import React, { useEffect, useMemo } from 'react'
import { Spin, devLog } from '@mashcard/design-system'
import { EditorContent, useEditor } from '@mashcard/editor'
import { Block } from '@/MashcardGraphQL'
import { DocumentTitle } from './components/DocumentTitle'
import { useSyncProvider, useBlockSyncProvider, useDocHistoryProvider } from './hooks'
import { blocksToJSONContents } from '../common/blocks'
import { JSONContent } from '@tiptap/core'
import { TrashPrompt } from '../common/components/TrashPrompt'
import { useNavigate } from 'react-router-dom'
import { editorVar, awarenessInfosVar, isSavingVar } from '../reactiveVars'
import { useDocumentEditable } from './hooks/useDocumentEditable'
import * as Root from './DocumentPage.style'
import { useDocMeta } from '../store/DocMeta'
import { useEditorOptions } from './hooks/useEditorOptions'
import { TEST_ID_ENUM } from '@mashcard/test-helper'

interface DocumentPageProps {
  // default: user can edit/view document normally
  // presentation: just for viewing and can not edit it.
  mode?: 'default' | 'presentation'
}

export const DocumentPage: React.FC<DocumentPageProps> = ({ mode }) => {
  const docMeta = useDocMeta()
  const navigate = useNavigate()

  const queryVariables = useMemo(
    () => ({ rootId: docMeta.id as string, historyId: docMeta.historyId, domain: docMeta.domain }),
    [docMeta.id, docMeta.historyId, docMeta.domain]
  )

  const { rootBlock, data, loading: blocksLoading, committing: blocksCommitting } = useSyncProvider(queryVariables)

  const freeze = mode === 'presentation'
  const currentRootBlock = rootBlock.current
  const [documentEditable] = useDocumentEditable(freeze ?? !docMeta.historyId, currentRootBlock)

  const { provider, initBlocksToEditor, loading, committing, awarenessInfos, meta, setMeta } = useBlockSyncProvider({
    blockId: docMeta.id as string,
    historyId: docMeta.historyId,
    editable: documentEditable
  })

  useDocHistoryProvider(docMeta.id as string)

  useEffect(() => {
    isSavingVar(blocksCommitting || committing)
  }, [blocksCommitting, committing])
  useEffect(() => {
    awarenessInfosVar(awarenessInfos)
  }, [awarenessInfos])

  const editorOptions = useEditorOptions({
    docMeta,
    provider,
    documentEditable,
    blocks: data?.childrenBlocks
  })

  // new ydoc requires new editor to load it
  const editor = useEditor(editorOptions, [provider])

  // TODO: refactor editor reactive var
  useEffect(() => {
    editorVar(freeze ? null : editor)
  }, [editor, freeze])

  if (loading || blocksLoading || !editor || editor.isDestroyed || !currentRootBlock) {
    return (
      <Root.PageSpinWrapper>
        <Spin size="lg" data-testid={TEST_ID_ENUM.page.DocumentPage.loading.id} />
      </Root.PageSpinWrapper>
    )
  }

  const PageElement = (
    <>
      {docMeta.id && docMeta.documentInfo?.isDeleted && <TrashPrompt />}
      <Root.Page
        width={{
          '@mdOnly': 'md',
          '@smDown': 'sm'
        }}
      >
        <DocumentTitle docBlock={currentRootBlock} editable={documentEditable} meta={meta} setMeta={setMeta} />
        <Root.PageContent>
          <EditorContent
            editor={editor}
            editable={documentEditable}
            rootId={docMeta.id}
            domain={docMeta.domain}
            historyId={docMeta.historyId}
            navigate={navigate}
          />
        </Root.PageContent>
      </Root.Page>
    </>
  )

  return PageElement
}
