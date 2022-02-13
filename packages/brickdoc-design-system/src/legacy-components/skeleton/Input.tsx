import omit from 'rc-util/lib/omit'
import { cx as classNames } from '../../utilities'
import Element, { SkeletonElementProps } from './Element'
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider'

export interface SkeletonInputProps extends Omit<SkeletonElementProps, 'size' | 'shape'> {
  size?: 'large' | 'small' | 'default'
}

/**
 * @deprecated Legacy Component.
 * @param props
 * @returns
 */
const SkeletonInput = (props: SkeletonInputProps) => {
  const renderSkeletonInput = ({ getPrefixCls }: ConfigConsumerProps) => {
    const { prefixCls: customizePrefixCls, className, active } = props
    const prefixCls = getPrefixCls('skeleton', customizePrefixCls)
    const otherProps = omit(props, ['prefixCls'])
    const cls = classNames(
      prefixCls,
      `${prefixCls}-element`,
      {
        [`${prefixCls}-active`]: active
      },
      className
    )
    return (
      <div className={cls}>
        <Element prefixCls={`${prefixCls}-input`} {...otherProps} />
      </div>
    )
  }
  return <ConfigConsumer>{renderSkeletonInput}</ConfigConsumer>
}

SkeletonInput.defaultProps = {
  size: 'default'
}

export default SkeletonInput