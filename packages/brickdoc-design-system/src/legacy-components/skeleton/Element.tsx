import { cx as classNames } from '../../utilities'

export interface SkeletonElementProps {
  prefixCls?: string
  className?: string
  style?: React.CSSProperties
  size?: 'large' | 'small' | 'default' | number
  shape?: 'circle' | 'square' | 'round'
  active?: boolean
}

/**
 * @deprecated Legacy Component.
 * @param props
 * @returns
 */
const Element = (props: SkeletonElementProps) => {
  const { prefixCls, className, style, size, shape } = props

  const sizeCls = classNames({
    [`${prefixCls}-lg`]: size === 'large',
    [`${prefixCls}-sm`]: size === 'small'
  })

  const shapeCls = classNames({
    [`${prefixCls}-circle`]: shape === 'circle',
    [`${prefixCls}-square`]: shape === 'square',
    [`${prefixCls}-round`]: shape === 'round'
  })

  const sizeStyle: React.CSSProperties =
    typeof size === 'number'
      ? {
          width: size,
          height: size,
          lineHeight: `${size}px`
        }
      : {}

  return <span className={classNames(prefixCls, sizeCls, shapeCls, className)} style={{ ...sizeStyle, ...style }} />
}

export default Element