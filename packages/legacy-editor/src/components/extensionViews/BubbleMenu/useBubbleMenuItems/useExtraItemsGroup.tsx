import { useMemo } from 'react'
import { RemoveAnchorMark, AnchorMark, More } from '@mashcard/design-icons'
import { ToolbarSubMenuOption, ToolbarGroupOption } from '../../../ui/Toolbar'
import { isBubbleMenuVisible } from '../BubbleMenu'
import { useEditorContext, useEditorI18n } from '../../../../hooks'
import { NodeIcon } from './useBubbleMenuItems'

export function useExtraItemsGroup(): [ToolbarGroupOption | null] {
  const [t] = useEditorI18n()
  const { editor } = useEditorContext()

  const option = useMemo<ToolbarGroupOption | null>(() => {
    if (!isBubbleMenuVisible(editor)) return null

    const moreItemsGroup: ToolbarGroupOption = {
      type: 'group',
      items: []
    }

    const moreItems: ToolbarSubMenuOption['items'] = []

    if (!editor.isActive('heading')) {
      if (editor.isActive('anchor')) {
        moreItems.push({
          type: 'item',
          name: 'removeAnchor',
          icon: (
            <NodeIcon>
              <RemoveAnchorMark />
            </NodeIcon>
          ),
          label: t('bubble_menu.anchor.remove'),
          onAction: () => editor.chain().focus().unsetAnchor().run()
        })
      } else {
        moreItems.push({
          type: 'item',
          name: 'anchor',
          icon: (
            <NodeIcon>
              <AnchorMark />
            </NodeIcon>
          ),
          label: t('bubble_menu.anchor.add'),
          onAction: () => editor.chain().focus().setAnchor().run()
        })
      }
    }

    if (moreItems.length !== 0) {
      moreItemsGroup.items.push({
        type: 'subMenu',
        trigger: 'hover',
        name: 'more',
        content: <More />,
        items: moreItems
      })
    }

    if (moreItemsGroup.items.length === 0) return null

    return moreItemsGroup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor?.state.selection])

  return [option]
}
