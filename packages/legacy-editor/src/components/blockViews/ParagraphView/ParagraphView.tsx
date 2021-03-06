import { FC } from 'react'
import { NodeViewContent } from '../../../tiptapRefactor'
import { css, cx, theme } from '@mashcard/design-system'
import { BlockContainer } from '../BlockContainer'
import { ParagraphViewProps } from '../../../extensions/blocks/paragraph/meta'
import { usePlaceholder } from './usePlaceholder'

const placeholderStyle = css({
  '&:before': {
    color: theme.colors.typeDisabled,
    content: 'attr(data-placeholder)',
    fontWeight: 400,
    left: 0,
    pointerEvents: 'none',
    position: 'absolute',
    transform: 'translateY(-50%)',
    top: '50%',
    whiteSpace: 'nowrap'
  }
})

const paragraphStyles = css({
  minWidth: '1em'
})

export const ParagraphView: FC<ParagraphViewProps> = props => {
  const { node, getPos, deleteNode, extension, editor } = props
  const placeholderClassName = placeholderStyle()
  const paragraphClassName = paragraphStyles()
  const placeholder = usePlaceholder(editor, node, getPos)

  return (
    <BlockContainer
      node={node}
      getPos={getPos}
      editable="custom"
      deleteNode={deleteNode}
      style={{ position: 'relative' }}
      actionOptions={['cut', 'copy', 'delete', 'transform']}
    >
      <NodeViewContent
        {...extension.options.HTMLAttributes}
        draggable={false}
        data-placeholder={placeholder}
        as="p"
        className={cx(placeholderClassName, paragraphClassName)}
      />
    </BlockContainer>
  )
}
