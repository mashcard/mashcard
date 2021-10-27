import React from 'react'
import { Button, Popover, Icon, Input } from '@brickdoc/design-system'
import styles from './DocumentTitle.module.less'
import { DashboardProps } from '@brickdoc/uploader'
import { TEST_ID_ENUM } from '@brickdoc/test-helper'
import { DocumentIcon, DocumentIconMeta } from './DocumentIcon'
import { DocumentCover, DocumentCoverMeta } from './DocumentCover'
import { useDocsI18n } from '../../../common/hooks'
import { useDocumentIconUploader, useDocumentCoverUploader } from '../../hooks'

export interface DocumentTitleProps {
  blockId: string
  editable: boolean
  prepareFileUpload: DashboardProps['prepareFileUpload']
  fetchUnsplashImages: DashboardProps['fetchUnsplashImages']
  title?: string
  icon?: DocumentIconMeta | null
  cover?: DocumentCoverMeta | null
  onCoverChange: (cover: DocumentCoverMeta | null | undefined) => void
  onIconChange: (icon: DocumentIconMeta | null | undefined) => void
  onTitleChange: (title: string) => void
  getDocIconUrl: () => string | undefined
  getDocCoverUrl: () => string | undefined
}

export const DocumentTitle: React.FC<DocumentTitleProps> = ({
  blockId,
  prepareFileUpload,
  fetchUnsplashImages,
  title,
  icon,
  cover,
  onCoverChange,
  onIconChange,
  onTitleChange,
  getDocIconUrl,
  getDocCoverUrl,
  editable
}) => {
  const { t } = useDocsI18n()
  const [localIcon, setLocalIcon] = React.useState('')
  const [localCover, setLocalCover] = React.useState('')
  const [documentIconMeta, iconPopoverProps] = useDocumentIconUploader(icon, {
    blockId,
    prepareFileUpload,
    fetchUnsplashImages,
    styles,
    onChange: onIconChange,
    onFileLoaded: setLocalIcon
  })
  const [documentCoverMeta, coverPopoverProps] = useDocumentCoverUploader(cover, {
    blockId,
    prepareFileUpload,
    fetchUnsplashImages,
    styles,
    onChange: onCoverChange,
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

      <div className={styles.titleWrapper}>
        <div className={styles.maxWidth}>
          {editable && (
            <div className={styles.actions}>
              {!documentIconMeta && (
                <Popover {...iconPopoverProps}>
                  <Button type="text" className={styles.item} disabled={!editable}>
                    <Icon.Face className={styles.icon} />
                    <span className={styles.name}>{t('title.add_icon')}</span>
                  </Button>
                </Popover>
              )}
              {!documentCoverMeta && (
                <Popover {...coverPopoverProps}>
                  <Button
                    data-testid={TEST_ID_ENUM.page.DocumentPage.coverButton.id}
                    type="text"
                    className={styles.item}
                    disabled={!editable}>
                    <Icon.Image className={styles.icon} />
                    <span className={styles.name}>{t('title.add_cover')}</span>
                  </Button>
                </Popover>
              )}
            </div>
          )}
          <div className={styles.titleRow}>
            {documentIconMeta && (
              <Popover {...iconPopoverProps} visible={!editable ? false : undefined}>
                <DocumentIcon getDocIconUrl={getDocIconUrl} localUrl={localIcon} documentIconMeta={documentIconMeta} />
              </Popover>
            )}
            <Input
              data-testid={TEST_ID_ENUM.page.DocumentPage.titleInput.id}
              className={styles.titleInput}
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              placeholder={t('title.untitled')}
              disabled={!editable}
            />
          </div>
        </div>
      </div>
    </>
  )
}
