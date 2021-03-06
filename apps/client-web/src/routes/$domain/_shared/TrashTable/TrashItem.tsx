/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import { BlockEmoji, BlockType, DocumentInfo } from '@/MashcardGraphQL'
import { Delete, FilePages, Undo } from '@mashcard/design-icons'
import { Button, Checkbox, ConfirmDialog, theme } from '@mashcard/design-system'
import { TEST_ID_ENUM } from '@mashcard/test-helper'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDocsI18n } from '../useDocsI18n'
import { Action, ActionButtonStyle, AvatarEmoji, Page, PageTile, SelectBlock, Time } from './Trash.style'
import { BlockWithChecked } from './TrashList'

interface TrashItemProps {
  block: BlockWithChecked
  domain: string
  onChange: (checked: boolean) => void
  onDelete: (id: string) => Promise<void>
  onRestore: (id: string) => Promise<void>
}

export const TrashItem: React.FC<TrashItemProps> = ({ domain, block, onChange, onRestore, onDelete }) => {
  const { t } = useDocsI18n()
  const [actionLoading, setActionLoading] = useState(false)
  const [hardDeleteModalVisible, setHardDeleteModalVisible] = useState(false)

  const documentInfo = block.documentInfo

  // TODO support image type
  const avatar = (
    <AvatarEmoji data-testid={TEST_ID_ENUM.trash.pageItem.icon.id}>
      {block.documentInfo?.icon?.type === BlockType.Emoji ? (
        (block.documentInfo.icon as BlockEmoji).emoji
      ) : (
        <FilePages size="1.25rem" color={theme.colors.typeThirdary.value} />
      )}
    </AvatarEmoji>
  )

  const navigate = useNavigate()

  const link = `/${domain}/${block.id}`

  const onClickLink = (): void => {
    navigate(link)
  }

  const getEmoji = (path: DocumentInfo['pathArray'][0]): string | undefined => {
    return path.icon && path.icon.type === BlockType.Emoji ? (path.icon as BlockEmoji).emoji : ''
  }

  const title = (
    <span className="ellipsis" data-testid={TEST_ID_ENUM.trash.pageItem.title.id}>
      {documentInfo?.title ?? t('title.untitled')}
    </span>
  )
  const titleData =
    documentInfo?.pathArray.length === 0 || !documentInfo ? (
      <></>
    ) : (
      <div className="path ellipsis" data-testid={TEST_ID_ENUM.trash.pageItem.path.id}>
        {documentInfo.pathArray.map(p => `${getEmoji(p)}${p.title ?? t('title.untitled')}`).join(' / ')}
      </div>
    )
  const onDeleteConfrim = async (): Promise<void> => {
    setActionLoading(true)
    await onDelete(block.id)
    setActionLoading(false)
    setHardDeleteModalVisible(false)
  }

  const onClickRestore = async (): Promise<void> => {
    await onRestore(block.id)
  }

  const onCancelDelete = (): void => {
    setHardDeleteModalVisible(false)
    setActionLoading(false)
  }

  return (
    <>
      <Page>
        <SelectBlock checked={!!block.checked} data-testid={TEST_ID_ENUM.trash.pageItem.button.checkbox.id}>
          <Checkbox
            checked={!!block.checked}
            onChange={onChange as any}
            noLabel
            disabled={!documentInfo?.restorable}
            checkboxStyle={
              block.checked ? undefined : { border: '2px solid', borderColor: theme.colors.overlaySecondary.value }
            }
            style={{ background: theme.colors.white.value }}
          />
        </SelectBlock>
        <PageTile className="ellipsis" onClick={onClickLink}>
          <div className="title">
            {avatar}
            {title}
          </div>
          {titleData}
        </PageTile>
      </Page>
      <Time data-testid={TEST_ID_ENUM.trash.pageItem.deletedAt.id}>
        {documentInfo?.deletedAt && dayjs(documentInfo.deletedAt).format('YYYY-MM-DD HH:mm:ss')}
      </Time>
      <Action>
        {!block.checked && (
          <>
            {documentInfo?.restorable && (
              <Button
                css={ActionButtonStyle}
                type="text"
                onClick={onClickRestore}
                data-testid={TEST_ID_ENUM.trash.pageItem.button.restore.id}
              >
                <Undo />
              </Button>
            )}
            <Button
              css={ActionButtonStyle}
              type="text"
              onClick={() => setHardDeleteModalVisible(true)}
              data-testid={TEST_ID_ENUM.trash.pageItem.button.remove.id}
            >
              <Delete />
            </Button>
          </>
        )}
      </Action>
      <ConfirmDialog
        confirmBtnProps={{
          loading: actionLoading,
          danger: true
        }}
        confirmBtnText={t('trash.delete_confirmation_ok')}
        cancelBtnText={t('trash.delete_confirmation_cancel')}
        onCancel={onCancelDelete}
        onConfirm={onDeleteConfrim}
        open={hardDeleteModalVisible}
      >
        {t('trash.delete_confirmation_body')}
      </ConfirmDialog>
    </>
  )
}
