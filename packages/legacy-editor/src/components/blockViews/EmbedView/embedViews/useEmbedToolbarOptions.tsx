import {
  Preview,
  BookmarkView,
  TextView,
  Edit,
  Link,
  ScreenFull,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignFull,
  Plus,
  Minus
} from '@mashcard/design-icons'
import { Input, Popover, Spin, styled, theme } from '@mashcard/design-system'
import { ChangeEventHandler, FC, useCallback, useState } from 'react'
import { EmbedViewProps } from '../../../../extensions/blocks/embed/meta'
import { useEditorI18n } from '../../../../hooks'
import { ToolbarOptionGroup } from '../../../ui/Toolbar'
import { useLinkValue } from '../embedTypes/Link/useLinkValue'
import { EmbedBlockType, UpdateEmbedBlockAttributes } from '../EmbedView'
import { EmbedToolbarProps } from './EmbedToolbar'

const Icon = styled('span', {
  variants: {
    active: {
      true: {
        color: theme.colors.primaryDefault
      },
      false: {}
    }
  }
})

const EditPanelContainer = styled('div', {
  padding: '.8rem 1rem'
})

const EditField = styled('div', {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row'
})

const EditInput = styled(Input, {
  variants: {
    size: {
      md: {
        flex: '1 !important',
        paddingLeft: 0,
        paddingRight: 0
      }
    }
  }
})

export function useDisplayName(
  blockType: EmbedBlockType,
  displayName: string,
  updateEmbedBlockAttributes: UpdateEmbedBlockAttributes,
  onSubmit?: (value: string) => void
): [string, ChangeEventHandler<HTMLInputElement>, VoidFunction] {
  const [editDisplayName, setEditDisplayName] = useState(displayName)
  const onDisplayNameChange = useCallback<ChangeEventHandler<HTMLInputElement>>(event => {
    setEditDisplayName(event.target.value)
  }, [])

  const onSubmitDisplayName = useCallback(() => {
    onSubmit?.(editDisplayName)
    if (displayName === editDisplayName) return
    updateEmbedBlockAttributes({ displayName: editDisplayName }, blockType)
  }, [blockType, displayName, editDisplayName, onSubmit, updateEmbedBlockAttributes])

  return [editDisplayName, onDisplayNameChange, onSubmitDisplayName]
}

export const EditPanel: FC<{
  link: string
  displayName: string
  blockType: EmbedBlockType
  extension?: EmbedViewProps['extension']
  onSubmit?: (value: string) => void
  updateEmbedBlockAttributes: UpdateEmbedBlockAttributes
}> = ({ link, displayName, blockType, extension, updateEmbedBlockAttributes, onSubmit }) => {
  const [editDisplayName, onDisplayNameChange, onSubmitDisplayName] = useDisplayName(
    blockType,
    displayName,
    updateEmbedBlockAttributes,
    onSubmit
  )
  const [editLink, onLinkChange, , onSubmitLink, progress] = useLinkValue(
    updateEmbedBlockAttributes,
    extension,
    link,
    onSubmit
  )

  return (
    <EditPanelContainer>
      <EditInput
        onPressEnter={onSubmitDisplayName}
        borderType="underline"
        size="md"
        value={editDisplayName}
        onChange={onDisplayNameChange}
      />
      <EditField>
        <EditInput
          onPressEnter={onSubmitLink}
          borderType="underline"
          size="md"
          prefix={<Link />}
          value={editLink}
          onChange={onLinkChange}
        />
        {progress.percentage > 0 && progress.percentage !== 1 && <Spin />}
      </EditField>
    </EditPanelContainer>
  )
}

export function useEmbedToolbarOptions({
  mode,
  blockType,
  displayName,
  url,
  extension,
  updateEmbedBlockAttributes,
  onFullScreen,
  align,
  zoomInImage,
  zoomOutImage
}: EmbedToolbarProps): [ToolbarOptionGroup] {
  const [t] = useEditorI18n()
  const isPreview = mode === 'preview'
  const isCard = mode === 'card'
  const isText = mode === 'text'

  const setToPreviewView = useCallback((): void => {
    updateEmbedBlockAttributes({ mode: 'preview' }, blockType)
  }, [blockType, updateEmbedBlockAttributes])

  const setToCardView = useCallback((): void => {
    updateEmbedBlockAttributes({ mode: 'card' }, blockType)
  }, [blockType, updateEmbedBlockAttributes])

  const setToTextView = useCallback((): void => {
    updateEmbedBlockAttributes({ mode: 'text' }, blockType)
  }, [blockType, updateEmbedBlockAttributes])

  const setAlignLeft = useCallback((): void => {
    updateEmbedBlockAttributes({ align: 'left' }, blockType)
  }, [blockType, updateEmbedBlockAttributes])

  const setAlignRight = useCallback((): void => {
    updateEmbedBlockAttributes({ align: 'right' }, blockType)
  }, [blockType, updateEmbedBlockAttributes])

  const setAlignCenter = useCallback((): void => {
    updateEmbedBlockAttributes({ align: 'center' }, blockType)
  }, [blockType, updateEmbedBlockAttributes])

  const setAlignFullWidth = useCallback((): void => {
    updateEmbedBlockAttributes({ align: 'full-width' }, blockType)
  }, [blockType, updateEmbedBlockAttributes])

  const [editPanelVisible, setEditPanelVisible] = useState(false)
  const closeEditPanel = useCallback(() => setEditPanelVisible(false), [])

  const options: ToolbarOptionGroup = [
    {
      type: 'group',
      items: [
        {
          type: 'item',
          name: 'preview',
          label: t('embed_block.view_types.preview.name'),
          tooltip: t('embed_block.view_types.preview.name'),
          icon: (
            <Icon active={isPreview}>
              <Preview />
            </Icon>
          ),
          onAction: setToPreviewView,
          active: isPreview
        },
        {
          type: 'item',
          name: 'card',
          label: t('embed_block.view_types.card.name'),
          tooltip: t('embed_block.view_types.card.name'),
          icon: (
            <Icon active={isCard}>
              <BookmarkView />
            </Icon>
          ),
          onAction: setToCardView,
          active: isCard
        },
        {
          type: 'item',
          name: 'text',
          label: t('embed_block.view_types.text.name'),
          tooltip: t('embed_block.view_types.text.name'),
          icon: (
            <Icon active={isText}>
              <TextView />
            </Icon>
          ),
          onAction: setToTextView,
          active: isText
        }
      ]
    }
  ]

  if (blockType === 'image' && isPreview) {
    options.push({
      type: 'group',
      items: [
        {
          type: 'item',
          name: 'alignLeft',
          tooltip: t('embed_block.align.left.tooltip'),
          icon: <AlignLeft />,
          onAction: setAlignLeft,
          active: align === 'left'
        },
        {
          type: 'item',
          name: 'alignCenter',
          tooltip: t('embed_block.align.center.tooltip'),
          icon: <AlignCenter />,
          onAction: setAlignCenter,
          active: !align || align === 'center'
        },
        {
          type: 'item',
          name: 'alignRight',
          tooltip: t('embed_block.align.right.tooltip'),
          icon: <AlignRight />,
          onAction: setAlignRight,
          active: align === 'right'
        },
        {
          type: 'item',
          name: 'alignFull',
          tooltip: t('embed_block.align.full_width.tooltip'),
          icon: <AlignFull />,
          onAction: setAlignFullWidth,
          active: align === 'full-width'
        }
      ]
    })

    if (align !== 'full-width') {
      options.push({
        type: 'group',
        items: [
          {
            type: 'item',
            name: 'zoomIn',
            tooltip: t('embed_block.zoom_in.tooltip'),
            icon: <Plus />,
            onAction: zoomInImage
          },
          {
            type: 'item',
            name: 'zoomOut',
            tooltip: t('embed_block.zoom_out.tooltip'),
            icon: <Minus />,
            onAction: zoomOutImage
          }
        ]
      })
    }
  } else {
    options.push({
      type: 'group',
      items: [
        {
          type: 'item',
          name: 'edit',
          tooltip: t('embed_block.edit.tooltip'),
          icon: (
            <Popover
              visible={editPanelVisible}
              onVisibleChange={setEditPanelVisible}
              compact={true}
              placement="bottom"
              trigger="click"
              content={
                <EditPanel
                  blockType={blockType}
                  extension={extension}
                  updateEmbedBlockAttributes={updateEmbedBlockAttributes}
                  onSubmit={closeEditPanel}
                  displayName={displayName}
                  link={url}
                />
              }
            >
              <Edit />
            </Popover>
          )
        }
      ]
    })
  }

  if (typeof onFullScreen === 'function') {
    options.push({
      type: 'group',
      items: [
        {
          type: 'item',
          name: 'full_screen',
          tooltip: t('embed_block.full_screen.tooltip'),
          icon: <ScreenFull />,
          onAction: onFullScreen
        }
      ]
    })
  }

  return [options]
}
