import React from 'react'
import { Icon } from '@brickdoc/design-system'
import { BLOCK, BlockCommandItem, ORDER_TOGGLE_BLOCK } from '../../../helpers/block'
import { BlockContext } from '../../../context/BlockContext'
import { EditorContext } from '../../../context/EditorContext'
import { useDocumentEditable } from '../../../hooks'
import { ActionGroupOption, ActionItemOption } from './BlockActions'

export type BasicActionOptionType = 'delete' | 'duplicate' | 'copy' | 'move' | 'transform'

export interface UseActionOptionsProps {
  types: BasicActionOptionType[]
}

const transformBlocks = ORDER_TOGGLE_BLOCK.map(key => Object.values(BLOCK).find(block => block.key === key))

export function useBasicActionOptions({ types }: UseActionOptionsProps): ActionGroupOption | null {
  const { deleteBlock, duplicateBlock, copyContent, moveBlock, getPosition } = React.useContext(BlockContext)
  const { t, editor } = React.useContext(EditorContext)
  const [documentEditable] = useDocumentEditable(undefined)

  const createActionOption = React.useCallback(
    (blockItem: BlockCommandItem): ActionItemOption => ({
      type: 'item',
      name: blockItem.key,
      label: t(`blocks.${blockItem.key}.label`),
      icon: blockItem.squareIcon,
      onAction: () => {
        if (!editor) return
        const position = getPosition()
        if (position === undefined) return
        const chain = editor.chain().setNodeSelection(position)
        blockItem.setBlock(chain).run()
      }
    }),
    [editor, getPosition, t]
  )

  return React.useMemo<ActionGroupOption | null>(() => {
    const group: ActionGroupOption = { type: 'group', items: [] }

    if (!documentEditable || types.length === 0) {
      return null
    }

    if (types.includes('duplicate')) {
      group.items.push({
        label: t('block_actions.basic.duplicate'),
        name: 'duplicate',
        type: 'item',
        icon: <Icon.Copy />,
        onAction: duplicateBlock
      })
    }

    if (types.includes('copy')) {
      group.items.push({
        name: 'copy',
        label: t('block_actions.basic.copy'),
        type: 'item',
        icon: <Icon.Link />,
        onAction: copyContent
      })
    }

    if (types.includes('delete'))
      group.items.push({
        label: t('block_actions.basic.delete'),
        name: 'delete',
        type: 'item',
        icon: <Icon.Delete />,
        onAction: deleteBlock
      })

    if (types.includes('transform')) {
      group.items.push({
        label: t('block_actions.basic.transform'),
        name: 'transform',
        type: 'subMenu',
        icon: <Icon.CornerDownRight />,
        items: transformBlocks.filter(i => !!i).map(item => createActionOption(item!))
      })
    }

    if (types.includes('move')) {
      group.items.push({
        label: t('block_actions.basic.move'),
        name: 'move',
        type: 'item',
        icon: <Icon.MoveIn />,
        onAction: moveBlock
      })
    }

    return group
  }, [copyContent, createActionOption, deleteBlock, documentEditable, duplicateBlock, moveBlock, t, types])
}