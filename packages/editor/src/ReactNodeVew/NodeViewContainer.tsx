import { createContext, FC, PropsWithChildren, RefObject, useContext, useEffect, useMemo, useRef } from 'react'

export interface NodeViewContextProps {
  setContentDOM?: (contentDOM: HTMLElement | null) => void
}

export const NodeViewContext = createContext<NodeViewContextProps>({})

export function useNodeContent<T extends HTMLElement>(): RefObject<T> {
  const { setContentDOM } = useContext(NodeViewContext)
  const ref = useRef<T>(null)

  useEffect(() => {
    setContentDOM?.(ref.current)
  }, [setContentDOM])

  return ref
}

export interface NodeViewContainerProps extends PropsWithChildren, NodeViewContextProps {}

export const NodeViewContainer: FC<NodeViewContainerProps> = ({ setContentDOM, children }) => {
  const contextValue = useMemo<NodeViewContextProps>(() => ({ setContentDOM }), [setContentDOM])
  return <NodeViewContext.Provider value={contextValue}>{children}</NodeViewContext.Provider>
}
