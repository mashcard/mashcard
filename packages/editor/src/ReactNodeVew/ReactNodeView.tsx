import { Node } from 'prosemirror-model'
import { uuid } from '@mashcard/active-support'
import { Decoration, DecorationSource, EditorView, NodeView } from 'prosemirror-view'
import { ComponentType } from 'react'
import { NodePortal } from '../NodePortal'
import { flushSync } from 'react-dom'
import { NodeViewContainer } from './NodeViewContainer'

export { useNodeContent } from './NodeViewContainer'

export interface NodePortalStore {
  set: (nodePortal: NodePortal) => void
  remove: (id: string) => void
}

export class ReactNodeView implements NodeView {
  private readonly id: string
  private readonly container: HTMLDivElement
  private contentContainer: HTMLElement | null
  private readonly nodePortalStore: NodePortalStore
  private readonly component: ComponentType<{}>
  private readonly editorView: EditorView

  constructor(component: ComponentType, editorView: EditorView, nodePortalStore: NodePortalStore) {
    this.editorView = editorView
    this.container = document.createElement('div')
    this.contentContainer = null
    this.nodePortalStore = nodePortalStore
    this.id = uuid()
    this.component = component

    this.renderComponent()
  }

  public get dom(): Element {
    return this.container.firstElementChild ?? this.container
  }

  public get contentDOM(): HTMLElement | null | undefined {
    return this.contentContainer
  }

  update?: ((node: Node, decorations: readonly Decoration[], innerDecorations: DecorationSource) => boolean) | undefined
  selectNode?: (() => void) | undefined
  deselectNode?: (() => void) | undefined
  setSelection?: ((anchor: number, head: number, root: Document | ShadowRoot) => void) | undefined
  stopEvent?: ((event: Event) => boolean) | undefined
  ignoreMutation?: ((mutation: MutationRecord) => boolean) | undefined
  destroy?: (() => void) | undefined

  private readonly setContentDOM = (contentDOM: HTMLElement | null): void => {
    this.contentContainer = contentDOM
  }

  private renderComponent(): void {
    flushSync(() => {
      this.nodePortalStore.set({
        id: this.id,
        container: this.container,
        child: (
          <NodeViewContainer setContentDOM={this.setContentDOM}>
            <this.component />
          </NodeViewContainer>
        )
      })
    })
  }
}
