import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
  CheckOne as CheckCircleOutlined,
  CloseOne as CloseCircleOutlined,
  Attention as ExclamationCircleOutlined,
  Info as InfoCircleOutlined
} from '../icon'
import { getConfirmLocale } from './locale'
import type { ModalFuncProps } from './Modal'
import ConfirmDialog from './ConfirmDialog'
import { globalConfig } from '../config-provider'
import devWarning from '../_util/devWarning'
import destroyFns from './destroyFns'

let defaultRootPrefixCls = ''

function getRootPrefixCls() {
  return defaultRootPrefixCls
}

export type ModalFunc = (props: ModalFuncProps) => {
  destroy: () => void
  update: (props: ModalFuncProps) => void
}

export type ModalStaticFunctions = Record<NonNullable<ModalFuncProps['type']>, ModalFunc>

export default function confirm(config: ModalFuncProps) {
  const div = document.createElement('div')
  document.body.appendChild(div)
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  let currentConfig = { ...config, close, visible: true } as any

  function destroy(...args: any[]) {
    const unmountResult = ReactDOM.unmountComponentAtNode(div)
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div)
    }
    const triggerCancel = args.some(param => param?.triggerCancel)
    if (config.onCancel && triggerCancel) {
      config.onCancel(...args)
    }
    for (let i = 0; i < destroyFns.length; i += 1) {
      const fn = destroyFns[i]
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      if (fn === close) {
        destroyFns.splice(i, 1)
        break
      }
    }
  }

  function render({ okText, cancelText, prefixCls: customizePrefixCls, ...props }: any) {
    /**
     * https://github.com/ant-design/ant-design/issues/23623
     *
     * Sync render blocks React event. Let's make this async.
     */
    setTimeout(() => {
      const runtimeLocale = getConfirmLocale()
      const { getPrefixCls } = globalConfig()
      // because Modal.config  set rootPrefixCls, which is different from other components
      const rootPrefixCls = getPrefixCls(undefined, getRootPrefixCls())
      const prefixCls = customizePrefixCls || `${rootPrefixCls}-modal`

      ReactDOM.render(
        <ConfirmDialog
          {...props}
          prefixCls={prefixCls}
          rootPrefixCls={rootPrefixCls}
          okText={okText || (props.okCancel ? runtimeLocale.okText : runtimeLocale.justOkText)}
          cancelText={cancelText || runtimeLocale.cancelText}
        />,
        div
      )
    })
  }

  function close(...args: any[]) {
    currentConfig = {
      ...currentConfig,
      visible: false,
      afterClose: () => {
        if (typeof config.afterClose === 'function') {
          config.afterClose()
        }
        // @ts-expect-error
        destroy.apply(this, args)
      }
    }
    render(currentConfig)
  }

  function update(props: ModalFuncProps) {
    currentConfig = {
      ...currentConfig,
      ...props
    }
    render(currentConfig)
  }

  render(currentConfig)

  destroyFns.push(close)

  return {
    destroy: close,
    update
  }
}

export function withWarn(props: ModalFuncProps): ModalFuncProps {
  return {
    icon: <ExclamationCircleOutlined />,
    okCancel: false,
    ...props,
    type: 'warning'
  }
}

export function withInfo(props: ModalFuncProps): ModalFuncProps {
  return {
    icon: <InfoCircleOutlined />,
    okCancel: false,
    ...props,
    type: 'info'
  }
}

export function withSuccess(props: ModalFuncProps): ModalFuncProps {
  return {
    icon: <CheckCircleOutlined />,
    okCancel: false,
    ...props,
    type: 'success'
  }
}

export function withError(props: ModalFuncProps): ModalFuncProps {
  return {
    icon: <CloseCircleOutlined />,
    okCancel: false,
    ...props,
    type: 'error'
  }
}

export function withConfirm(props: ModalFuncProps): ModalFuncProps {
  return {
    icon: <ExclamationCircleOutlined />,
    okCancel: true,
    ...props,
    type: 'confirm'
  }
}

export function modalGlobalConfig({ rootPrefixCls }: { rootPrefixCls: string }) {
  devWarning(false, 'Modal', 'Modal.config is deprecated. Please use ConfigProvider.config instead.')
  defaultRootPrefixCls = rootPrefixCls
}
