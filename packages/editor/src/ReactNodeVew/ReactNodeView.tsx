import { Node } from 'prosemirror-model'
import { uuid } from '@mashcard/active-support'
import { Decoration, DecorationSource, EditorView, NodeView } from 'prosemirror-view'
import { ComponentType } from 'react'
import { NodePortal } from '../NodePortal'
import { flushSync } from 'react-dom'

export interface NodePortalStore {
  set: (nodePortal: NodePortal) => void
  remove: (id: string) => void
}

export class ReactNodeView implements NodeView {
  id: string
  container: HTMLDivElement
  nodePortalStore: NodePortalStore
  component: ComponentType<{}>
  editorView: EditorView

  constructor(component: ComponentType, editorView: EditorView, nodePortalStore: NodePortalStore) {
    this.editorView = editorView
    this.container = document.createElement('div')
    this.nodePortalStore = nodePortalStore
    this.id = uuid()
    this.component = component

    this.renderComponent()
  }

  get dom(): Element {
    return this.container.firstElementChild ?? this.container
  }

  get contentDOM(): HTMLElement | null | undefined {
    console.log(this.container.querySelector('p'))
    return this.container.querySelector('p')
  }

  update?: ((node: Node, decorations: readonly Decoration[], innerDecorations: DecorationSource) => boolean) | undefined
  selectNode?: (() => void) | undefined
  deselectNode?: (() => void) | undefined
  setSelection?: ((anchor: number, head: number, root: Document | ShadowRoot) => void) | undefined
  stopEvent?: ((event: Event) => boolean) | undefined
  ignoreMutation?: ((mutation: MutationRecord) => boolean) | undefined
  destroy?: (() => void) | undefined

  private renderComponent(): void {
    flushSync(() => {
      this.nodePortalStore.set({
        id: this.id,
        container: this.container,
        child: <this.component />
      })
    })
  }
}
