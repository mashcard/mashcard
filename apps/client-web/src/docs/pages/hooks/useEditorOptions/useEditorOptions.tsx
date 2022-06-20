import { Node } from 'prosemirror-model'
import { EditorOptions } from '@brickdoc/editor'
import { Block } from '@brickdoc/schema'
import { DocMeta } from '@/docs/store/DocMeta'
import { useMentionCommands } from './useMentionCommands'
import { useEmbed } from './useEmbed'
import { useReactiveVar } from '@apollo/client'
import { FormulaContextVar } from '@/docs/reactiveVars'
import { useCallback, useMemo } from 'react'
import { PageTree } from '@/docs/common/components/PageTree'
import { blockProvider } from '../useBlockSyncProvider'
import { string2Color } from '@brickdoc/design-system/src/components/Avatar/initials'
import { useDiscussion } from './useDiscussion'

export interface UseEditorOptions {
  docMeta: DocMeta
  blocks: Block[]
  documentEditable: boolean
  provider: blockProvider | undefined
  onDocSave: (doc: Node) => Promise<void>
}

export function useEditorOptions({
  docMeta,
  documentEditable,
  blocks,
  provider,
  onDocSave
}: UseEditorOptions): EditorOptions {
  const discussion = useDiscussion(docMeta)
  const embed = useEmbed(blocks, docMeta)
  const formulaContext = useReactiveVar(FormulaContextVar)
  const mentionCommands = useMentionCommands(docMeta)
  const renderView = useCallback(() => <PageTree mode="subPage" />, [])
  const { currentUser } = globalThis.brickdocContext

  return useMemo(
    () => ({
      base: {
        collaboration: provider ? { document: provider.document } : false,
        collaborationCursor:
          provider && currentUser
            ? {
                provider,
                user: {
                  id: currentUser.name,
                  name: currentUser.name,
                  operatorId: globalThis.brickdocContext.uuid,
                  color: string2Color(globalThis.brickdocContext.uuid)
                }
              }
            : false,
        discussion,
        embed,
        formula: {
          formulaContext
        },
        mentionCommands,
        pageLink: {
          pages: mentionCommands.pages
        },
        subPageMenu: {
          renderView
        },
        sync: {
          onSave: onDocSave
        }
      },
      editable: documentEditable
    }),
    [discussion, documentEditable, embed, formulaContext, mentionCommands, onDocSave, renderView, provider, currentUser]
  )
}
