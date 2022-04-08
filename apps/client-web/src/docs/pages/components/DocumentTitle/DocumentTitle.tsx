import React from 'react'
import { Button, Popover, Icon } from '@brickdoc/design-system'
import styles from './DocumentTitle.module.less'
import * as Root from './DocumentTitle.style'
import { TEST_ID_ENUM } from '@brickdoc/test-helper'
import { DocumentIcon } from './DocumentIcon'
import { DocumentCover } from './DocumentCover'
import { useDocsI18n } from '../../../common/hooks'
import {
  useDocumentIconUploader,
  useDocumentCoverUploader,
  usePrepareFileUpload,
  useFetchUnsplashImages
} from '../../hooks'
import { useReactiveVar } from '@apollo/client'
import { editorVar } from '@/docs/reactiveVars'
import { useBlobGetter } from '../../hooks/useBlobGetter'
import { GetChildrenBlocksQuery } from '@/BrickdocGraphQL'
import { EditorContentProps } from '@brickdoc/editor'

export interface DocumentTitleProps {
  blocks: GetChildrenBlocksQuery['childrenBlocks']
  editable: boolean
}

const createDocAttrsUpdater =
  (editor: EditorContentProps['editor'], field: string) =>
  (value: any): void => {
    if (!editor || editor.isDestroyed) return
    editor.commands.setDocAttrs({
      ...editor.state.doc.attrs,
      [field]: value
    })
  }

export const DocumentTitle: React.FC<DocumentTitleProps> = ({ editable, blocks }) => {
  const { t } = useDocsI18n()
  const editor = useReactiveVar(editorVar)
  const blockId = editor?.state.doc.attrs.uuid
  const icon = editor?.state.doc.attrs.icon
  const cover = editor?.state.doc.attrs.cover
  const title = editor?.state.doc.attrs.title

  const inputRef = React.useRef<any>(null)
  const inputComposing = React.useRef(false)

  React.useEffect(() => {
    if (inputRef.current && title !== undefined) {
      inputRef.current.value = title
    }
  }, [title])

  const docIconGetter = useBlobGetter('icon', blocks)
  const docCoverGetter = useBlobGetter('cover', blocks)

  const setTitle = createDocAttrsUpdater(editor, 'title')
  const setIcon = createDocAttrsUpdater(editor, 'icon')
  const setCover = createDocAttrsUpdater(editor, 'cover')

  const getDocIconUrl = (): string | undefined => {
    if (!editor || editor.isDestroyed) return undefined
    return docIconGetter(editor.state.doc)
  }
  const getDocCoverUrl = (): string | undefined => {
    if (!editor || editor.isDestroyed) return undefined
    return docCoverGetter(editor.state.doc)
  }

  const prepareFileUpload = usePrepareFileUpload()
  const fetchUnsplashImages = useFetchUnsplashImages()
  const [localIcon, setLocalIcon] = React.useState('')
  const [localCover, setLocalCover] = React.useState('')
  const [documentIconMeta, iconPopoverProps] = useDocumentIconUploader(icon, {
    blockId,
    prepareFileUpload,
    fetchUnsplashImages,
    styles,
    onChange: setIcon,
    onFileLoaded: setLocalIcon
  })
  const [documentCoverMeta, coverPopoverProps] = useDocumentCoverUploader(cover, {
    blockId,
    prepareFileUpload,
    fetchUnsplashImages,
    styles,
    onChange: setCover,
    onFileLoaded: setLocalCover
  })

  return (
    <>
      <DocumentCover
        editable={editable}
        localUrl={localCover}
        getDocCoverUrl={getDocCoverUrl}
        documentCoverMeta={documentCoverMeta}
        popoverProps={coverPopoverProps}
      />

      <Root.TitleWrapper
        width={{
          '@smDown': 'sm'
        }}
      >
        <Root.MaxWidth>
          {editable && (
            <Root.Actions data-testid={TEST_ID_ENUM.page.DocumentPage.actionButtons.id}>
              {!documentIconMeta && (
                <Popover {...iconPopoverProps}>
                  <Root.Item as={Button} type="unstyled" disabled={!editable}>
                    <Root.Icon as={Icon.Face} />
                    <Root.Name>{t('title.add_icon')}</Root.Name>
                  </Root.Item>
                </Popover>
              )}
              {!documentCoverMeta && (
                <Popover {...coverPopoverProps}>
                  <Root.Item
                    as={Button}
                    data-testid={TEST_ID_ENUM.page.DocumentPage.coverButton.id}
                    type="unstyled"
                    disabled={!editable}
                  >
                    <Root.Icon as={Icon.Image} />
                    <Root.Name>{t('title.add_cover')}</Root.Name>
                  </Root.Item>
                </Popover>
              )}
            </Root.Actions>
          )}
          <Root.TitleRow>
            {documentIconMeta && (
              <Popover {...iconPopoverProps} visible={!editable ? false : undefined}>
                <DocumentIcon getDocIconUrl={getDocIconUrl} localUrl={localIcon} documentIconMeta={documentIconMeta} />
              </Popover>
            )}
            <Root.Input
              type="text"
              bordered={false}
              ref={(container: HTMLInputElement) => {
                if (container) {
                  inputRef.current = container
                  // TODO: fix this hack
                  container.value = title
                }
              }}
              defaultValue={title}
              data-testid={TEST_ID_ENUM.page.DocumentPage.titleInput.id}
              onCompositionStart={() => {
                inputComposing.current = true
              }}
              onCompositionUpdate={() => {
                inputComposing.current = true
              }}
              onCompositionEnd={(e: any) => {
                inputComposing.current = false
                setTitle((e.target as any).value)
              }}
              onChange={(e: any) => {
                if (inputComposing.current) {
                  inputComposing.current = false
                  return
                }
                setTitle(e.target.value)
              }}
              placeholder={t('title.untitled')}
              disabled={!editable}
            />
          </Root.TitleRow>
        </Root.MaxWidth>
      </Root.TitleWrapper>
    </>
  )
}
