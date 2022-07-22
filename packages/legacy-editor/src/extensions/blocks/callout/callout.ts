import { mergeAttributes } from '@tiptap/core'
import { LegacyReactNodeViewRenderer } from '../../../tiptapRefactor'
import { CalloutView } from '../../../components/blockViews/CalloutView'
import { createBlock, createJSONAttributeHtmlParser, createJSONAttributeHtmlRender } from '../../common'
import { CalloutAttributes, CalloutOptions, meta } from './meta'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      /**
       * Set a callout node
       */
      setCallout: () => ReturnType
      /**
       * Toggle a callout node
       */
      toggleCallout: () => ReturnType
      /**
       * Unset a callout node
       */
      unsetCallout: () => ReturnType
    }
  }
}

export const Callout = createBlock<CalloutOptions, CalloutAttributes>({
  name: meta.name,

  content: 'block+',

  group: 'block',

  defining: true,

  draggable: true,

  addAttributes() {
    return {
      icon: {
        default: {
          type: 'EMOJI',
          emoji: '📍',
          name: 'round pushpin'
        },
        parseHTML: createJSONAttributeHtmlParser('data-icon'),
        renderHTML: createJSONAttributeHtmlRender('icon', 'data-icon')
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'callout'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['callout', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return LegacyReactNodeViewRenderer(CalloutView)
  },

  addCommands() {
    return {
      setCallout:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.type.name)
        },
      toggleCallout:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name)
        },
      unsetCallout:
        () =>
        ({ commands }) => {
          return commands.lift(this.name)
        }
    }
  }
})
