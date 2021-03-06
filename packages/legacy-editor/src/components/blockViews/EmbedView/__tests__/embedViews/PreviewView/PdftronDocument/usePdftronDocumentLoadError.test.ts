import { renderHook, act } from '@testing-library/react'
import { usePdftronDocument } from '../../../../embedViews/PreviewView/PdftronDocument/usePdftronDocument'

jest.mock('@pdftron/webviewer', () => ({
  __esModule: true,
  default: async () =>
    await Promise.resolve({
      UI: {
        addEventListener: (event: string, cb: Function) => {
          cb()
        },
        FitMode: {
          FitWidth: 1
        },
        Events: {
          LOAD_ERROR: 'LOAD_ERROR'
        },
        setFitMode: () => {}
      },
      Core: {
        documentViewer: {
          addEventListener: (event: string, cb: Function) => {}
        }
      }
    })
}))

jest.useRealTimers()

describe('usePdftronDocument load error', () => {
  it('handles load error correctly', async () => {
    const { result } = renderHook(() => usePdftronDocument('doc'))

    // wait for async effect
    await act(async () => {
      await new Promise<void>(resolve => {
        setTimeout(() => {
          resolve()
        }, 10)
      })
    })

    const [documentStatus] = result.current

    expect(documentStatus).toBe('error')
  })
})
