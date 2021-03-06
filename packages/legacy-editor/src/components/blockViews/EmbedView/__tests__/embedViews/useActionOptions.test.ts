import { renderHook } from '@testing-library/react'
import { ToolbarGroupOption, ToolbarItemOption } from '../../../../ui'
import { useActionOptions } from '../../embedViews/useActionOptions'

describe('useActionOptions', () => {
  it('triggers download correctly', () => {
    const url = 'url'
    const { result } = renderHook(() => useActionOptions(url))
    const [options] = result.current

    expect(options).toHaveLength(4)

    const downloadOption = (options[0] as ToolbarGroupOption).items[0] as ToolbarItemOption

    expect(() => downloadOption.onAction!('key')).not.toThrow()
  })
})
