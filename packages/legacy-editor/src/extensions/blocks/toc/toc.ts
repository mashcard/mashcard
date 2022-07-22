import { mergeAttributes } from '@tiptap/core'
import { LegacyReactNodeViewRenderer } from '../../../tiptapRefactor'
import { TocView } from '../../../components/blockViews/TocView'
import { createBlock } from '../../common'
import { meta, TocOptions, TocAttributes } from './meta'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tocBlock: {
      /**
       * Set a toc block
       */
      setTocBlock: (position?: number) => ReturnType
    }
  }
}

export const Toc = createBlock<TocOptions, TocAttributes>({
  name: meta.name,

  group: 'block',

  selectable: false,

  draggable: true,

  allowGapCursor: false,

  parseHTML() {
    return [
      {
        tag: 'toc-block'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['toc-block', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return LegacyReactNodeViewRenderer(TocView)
  },

  addCommands() {
    return {
      setTocBlock:
        position =>
        ({ chain }) => {
          return chain().insertBlockAt({ type: this.name }, position).run()
        }
    }
  }
})
