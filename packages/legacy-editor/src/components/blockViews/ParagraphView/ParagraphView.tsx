import { FC } from 'react'
import { css, cx, theme } from '@mashcard/design-system'
import { BlockContainer } from '../BlockContainer'
import { ParagraphViewProps } from '../../../extensions/blocks/paragraph/meta'
import { usePlaceholder } from './usePlaceholder'
import { useNodeContent } from '@mashcard/editor'

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
  const nodeContentRef = useNodeContent<HTMLParagraphElement>()

  return (
    <BlockContainer
      node={node}
      getPos={getPos}
      editable="custom"
      deleteNode={deleteNode}
      style={{ position: 'relative' }}
      actionOptions={['cut', 'copy', 'delete', 'transform']}>
      <p
        ref={nodeContentRef}
        {...extension.options.HTMLAttributes}
        draggable={false}
        data-placeholder={placeholder}
        className={cx(placeholderClassName, paragraphClassName)}
      />
    </BlockContainer>
  )
}
