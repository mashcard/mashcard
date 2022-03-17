/* eslint-disable @typescript-eslint/restrict-plus-operands */
import React from 'react'
import { Node } from 'prosemirror-model'
import { useApolloClient } from '@apollo/client'
import { devLog } from '@brickdoc/design-system'
import {
  BlockInput,
  Block,
  useGetChildrenBlocksQuery,
  useBlockSyncBatchMutation,
  GetSpreadsheetChildrenDocument
} from '@/BrickdocGraphQL'
import { isEqual } from '@brickdoc/active-support'
import { isSavingVar } from '../../reactiveVars'
import { nodeToBlock } from '../../common/blocks'
import {
  BrickdocEventBus,
  Event,
  BlockUpdated,
  BlockDeleted,
  BlockNameLoad,
  BlockSynced,
  UpdateBlock,
  DeleteBlock,
  CommitBlocks,
  loadSpreadsheetBlocks,
  SpreadsheetLoaded
} from '@brickdoc/schema'

export type UpdateBlocks = (blocks: BlockInput[], toDeleteIds: string[]) => Promise<void>

export function useSyncProvider(queryVariables: { rootId: string; snapshotVersion: number }): {
  rootBlock: React.MutableRefObject<Block | undefined>
  data: any
  loading: boolean
  refetch: any
  onDocSave: (doc: Node) => Promise<void>
  updateBlocks: UpdateBlocks
  // updateCachedDocBlock: (block: Block, toDelete: boolean) => void
} {
  const rootId = React.useRef<string>(queryVariables.rootId)

  const { data, loading, refetch } = useGetChildrenBlocksQuery({
    fetchPolicy: 'no-cache',
    variables: queryVariables
  })

  const client = useApolloClient()
  const [blockSyncBatch] = useBlockSyncBatchMutation()

  const committing = React.useRef(false)

  const cachedBlocksMap = React.useRef(new Map<string, Block>())
  const docBlocksMap = React.useRef(new Map<string, Block>())
  const rootBlock = React.useRef<Block | undefined>()

  const dirtyBlocksMap = React.useRef(new Map<string, BlockInput>())
  const dirtyToDeleteIds = React.useRef(new Set<string>())

  React.useEffect(() => {
    rootId.current = queryVariables.rootId
    cachedBlocksMap.current = new Map<string, Block>()
    docBlocksMap.current = new Map<string, Block>()
    dirtyBlocksMap.current = new Map<string, Block>()
    dirtyToDeleteIds.current = new Set<string>()
    data?.childrenBlocks?.forEach(_block => {
      const block = _block as Block
      // cachedBlocksMap.current.set(block.id, block)
      docBlocksMap.current.set(block.id, block)
    })
    rootBlock.current = docBlocksMap.current.get(rootId.current)
  }, [queryVariables, data?.childrenBlocks])

  const commitDirty = async (): Promise<void> => {
    if (!dirtyBlocksMap.current.size && !dirtyToDeleteIds.current.size) return
    if (committing.current) return

    committing.current = true

    try {
      const blocks: BlockInput[] = Array.from(dirtyBlocksMap.current.values())
        .filter(
          // commit only if parent block in doc
          ({ parentId, id }) =>
            (!parentId || id === rootId.current || cachedBlocksMap.current.get(parentId)) ??
            docBlocksMap.current.get(parentId) ??
            dirtyBlocksMap.current.get(parentId)
        )
        .map(b => {
          // HACK: delete all __typename
          const block = { __typename: undefined, ...b, meta: b.meta ?? {} }
          delete block.__typename
          return block
        })

      const deletedIds = [...dirtyToDeleteIds.current]

      if (blocks.length > 0 || deletedIds.length > 0) {
        blocks.forEach(b => {
          if (!b.parentId || b.type === 'doc') {
            BrickdocEventBus.dispatch(BlockNameLoad({ id: b.id, name: b.text }))
          }
          BrickdocEventBus.dispatch(BlockUpdated(b))
          dirtyBlocksMap.current.delete(b.id)
        })
        deletedIds.forEach(id => {
          BrickdocEventBus.dispatch(BlockDeleted({ id }))
          dirtyToDeleteIds.current.delete(id)
        })

        const syncPromise = blockSyncBatch({
          variables: {
            input: {
              blocks,
              deletedIds,
              rootId: rootId.current,
              operatorId: globalThis.brickdocContext.uuid
            }
          }
        })
        await syncPromise
        blocks.forEach(b => {
          BrickdocEventBus.dispatch(BlockSynced(b))
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      committing.current = false
    }
    if (dirtyBlocksMap.current.size === 0 && dirtyToDeleteIds.current.size === 0) {
      isSavingVar(false)
    } else {
      setTimeout(() => {
        void commitDirty()
      }, 500)
    }
  }

  const onDocSave = async (doc: Node): Promise<void> => {
    if (!docBlocksMap.current.size) return
    isSavingVar(true)
    const docBlocks = nodeToBlock(doc, 0)
    const deletedIds = new Set(docBlocksMap.current.keys())
    deletedIds.delete(rootId.current)

    // Document Blocks dirty check and maintian
    docBlocks.forEach(newBlock => {
      newBlock.sort = `${newBlock.sort}`
      const oldBlock = docBlocksMap.current.get(newBlock.id)
      // TODO: Improve dirty check
      if (!oldBlock || !isEqual(oldBlock, newBlock)) {
        dirtyBlocksMap.current.set(newBlock.id, newBlock)
        docBlocksMap.current.set(newBlock.id, newBlock as Block)
      }
      deletedIds.delete(newBlock.id)
    })

    deletedIds.forEach(id => {
      dirtyToDeleteIds.current.add(id)
      docBlocksMap.current.delete(id)
    })

    await commitDirty()
  }

  BrickdocEventBus.subscribe(
    BlockUpdated,
    (e: Event) => {
      const block: Block = e.payload
      const oldBlock = docBlocksMap.current.get(block.id) ?? {}
      if (docBlocksMap.current.get(block.id)) {
        // update only on doc blocks
        docBlocksMap.current.set(block.id, { ...oldBlock, ...block })
      } else {
        cachedBlocksMap.current.set(block.id, { ...oldBlock, ...block })
      }
      if (block.id === rootId.current) {
        client.cache.modify({
          id: client.cache.identify({ __typename: 'BlockInfo', id: block.id }),
          fields: {
            title() {
              return block.text
            },
            icon() {
              return block.meta.icon
            }
          }
        })
        client.cache.modify({
          id: client.cache.identify({ __typename: 'BlockPath', id: block.id }),
          fields: {
            text() {
              return block.text
            }
          }
        })
        client.cache.modify({
          id: client.cache.identify({ __typename: 'block', id: block.id }),
          fields: {
            text() {
              return block.text
            },
            meta() {
              return block.meta
            }
          }
        })
      }
    },
    { subscribeId: 'SyncProvider' }
  )

  BrickdocEventBus.subscribe(
    BlockDeleted,
    (e: Event) => {
      const block: Block = e.payload
      docBlocksMap.current.delete(block.id)
    },
    { subscribeId: 'SyncProvider' }
  )

  BrickdocEventBus.subscribe(
    UpdateBlock,
    (e: Event) => {
      // isSavingVar(true)
      const { block, commit } = e.payload
      dirtyBlocksMap.current.set(block.id, block)
      if (commit) {
        void commitDirty()
      }
    },
    { subscribeId: 'SyncProvider' }
  )

  BrickdocEventBus.subscribe(
    DeleteBlock,
    (e: Event) => {
      // isSavingVar(true)
      const { blockId, commit } = e.payload
      dirtyToDeleteIds.current.add(blockId)
      if (commit) {
        void commitDirty()
      }
    },
    { subscribeId: 'SyncProvider' }
  )

  BrickdocEventBus.subscribe(
    CommitBlocks,
    (e: Event) => {
      isSavingVar(true)
      void commitDirty()
    },
    { subscribeId: 'SyncProvider' }
  )

  BrickdocEventBus.subscribe(
    loadSpreadsheetBlocks,
    (e: Event) => {
      const parentId = e.payload
      devLog(`loading spreadsheet ${parentId}`)
      void (async () => {
        const { data } = await client.query({
          query: GetSpreadsheetChildrenDocument,
          variables: {
            parentId
          },
          fetchPolicy: 'no-cache'
        })
        const { blocks } = data.spreadsheetChildren
        blocks.forEach((block: Block) => {
          cachedBlocksMap.current.set(block.id, block)
        })
        BrickdocEventBus.dispatch(
          SpreadsheetLoaded({
            parentId,
            blocks
          })
        )
      })()
    },
    { subscribeId: 'SyncProvider' }
  )

  const updateBlocks = async (blocks: BlockInput[], toDeleteIds: string[]): Promise<void> => {
    isSavingVar(true)
    blocks.forEach(block => dirtyBlocksMap.current.set(block.id, block))
    toDeleteIds.forEach(id => dirtyToDeleteIds.current.add(id))

    await commitDirty()
  }

  return {
    rootBlock,
    data,
    loading,
    refetch,
    onDocSave,
    updateBlocks
  }
}