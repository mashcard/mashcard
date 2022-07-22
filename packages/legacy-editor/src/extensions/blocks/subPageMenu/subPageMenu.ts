import { mergeAttributes } from '@tiptap/core'
import { LegacyReactNodeViewRenderer } from '../../../tiptapRefactor'
import { SubPageMenuView } from '../../../components/blockViews'
import { createBlock } from '../../common'
import { meta, SubPageMenuAttributes, SubPageMenuOptions } from './meta'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    subPageMenu: {
      /**
       * Set a subPage menu block
       */
      setSubPageMenuBlock: (position?: number) => ReturnType
    }
  }
}

export const SubPageMenu = createBlock<SubPageMenuOptions, SubPageMenuAttributes>({
  name: meta.name,

  group: 'block',

  selectable: false,

  draggable: true,

  allowGapCursor: false,

  parseHTML() {
    return [
      {
        tag: 'sub-page-menu-block'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['sub-page-menu-block', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return LegacyReactNodeViewRenderer(SubPageMenuView)
  },

  addCommands() {
    return {
      setSubPageMenuBlock:
        position =>
        ({ chain }) => {
          return chain().insertBlockAt({ type: this.name }, position).run()
        }
    }
  }
})
