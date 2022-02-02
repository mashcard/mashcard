import * as React from 'react'
import { cx } from '../../utilities'

import './style'
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider'

export interface DividerProps {
  prefixCls?: string
  type?: 'horizontal' | 'vertical'
  orientation?: 'left' | 'right' | 'center'
  className?: string
  children?: React.ReactNode
  dashed?: boolean
  style?: React.CSSProperties
  plain?: boolean
}

/**
 * @deprecated Legacy Component.
 * @param props
 * @returns
 */
const Divider: React.FC<DividerProps> = props => (
  <ConfigConsumer>
    {({ getPrefixCls, direction }: ConfigConsumerProps) => {
      const {
        prefixCls: customizePrefixCls,
        type = 'horizontal',
        orientation = 'center',
        className,
        children,
        dashed,
        plain,
        ...restProps
      } = props
      const prefixCls = getPrefixCls('divider', customizePrefixCls)
      const orientationPrefix = orientation.length > 0 ? `-${orientation}` : orientation
      const hasChildren = !!children
      const classString = cx(
        prefixCls,
        `${prefixCls}-${type}`,
        {
          [`${prefixCls}-with-text`]: hasChildren,
          [`${prefixCls}-with-text${orientationPrefix}`]: hasChildren,
          [`${prefixCls}-dashed`]: !!dashed,
          [`${prefixCls}-plain`]: !!plain,
          [`${prefixCls}-rtl`]: direction === 'rtl'
        },
        className
      )
      return (
        <div className={classString} {...restProps} role="separator">
          {children && <span className={`${prefixCls}-inner-text`}>{children}</span>}
        </div>
      )
    }}
  </ConfigConsumer>
)

export default Divider
