import { mergeAttributes, Content } from '@tiptap/core'
import { LegacyReactNodeViewRenderer } from '../../../tiptapRefactor'
import { Plugin, PluginKey } from 'prosemirror-state'
import { BlockJustCreated, MashcardEventBus, EmbedType } from '@mashcard/schema'
import { EmbedView } from '../../../components/blockViews'
import { createBlock, createJSONAttributeHtmlParser, createJSONAttributeHtmlRender } from '../../common'
import { EmbedAttributes, EmbedOptions, meta } from './meta'
import { uuid } from '@mashcard/active-support'
import { pasteImageHandler } from './pasteImageHandler'
import { dropImageHandler } from './dropImageHandler'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      /**
       * Set an embedBlock
       */
      setEmbedBlock: (embedType: EmbedType, defaultFile?: File, postion?: number) => ReturnType
    }
  }
}

export const Embed = createBlock<EmbedOptions, EmbedAttributes>({
  name: meta.name,

  group: 'block',

  selectable: false,

  draggable: true,

  allowGapCursor: false,

  addAttributes() {
    return {
      embedMeta: {
        default: {
          type: 'EmbedMeta'
        },
        parseHTML: createJSONAttributeHtmlParser('data-embed-meta'),
        renderHTML: createJSONAttributeHtmlRender('embedMeta', 'data-embed-meta')
      },
      defaultFile: {
        default: null
      },
      link: {
        default: {
          type: 'LINK'
        },
        parseHTML: createJSONAttributeHtmlParser('data-link'),
        renderHTML: createJSONAttributeHtmlRender('link', 'data-link')
      },
      image: {
        default: {
          type: 'IMAGE'
        },
        parseHTML: createJSONAttributeHtmlParser('data-image'),
        renderHTML: createJSONAttributeHtmlRender('image', 'data-image')
      },
      attachment: {
        default: {
          type: 'ATTACHMENT'
        },
        parseHTML: createJSONAttributeHtmlParser('data-attachment'),
        renderHTML: createJSONAttributeHtmlRender('attachment', 'data-attachment')
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'embed-block'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['embed-block', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return LegacyReactNodeViewRenderer(EmbedView)
  },

  addCommands() {
    return {
      setEmbedBlock:
        (embedType, defaultFile, position) =>
        ({ chain }) => {
          const id = uuid()
          const content: Content = {
            type: this.name,
            attrs: {
              uuid: id,
              defaultFile,
              embedMeta: {
                embedType
              }
            }
          }
          const result = chain().insertBlockAt(content, position).run()

          if (result) {
            MashcardEventBus.dispatch(BlockJustCreated({ id }))
          }

          return result
        }
    }
  },

  addProseMirrorPlugins() {
    const editor = this.editor
    return [
      new Plugin({
        key: new PluginKey(`${meta.name}Plugin`),
        props: {
          handlePaste(view, event, slice): boolean {
            return pasteImageHandler(editor, event)
          },
          handleDrop(view, event, slice): boolean {
            return dropImageHandler(editor, event as DragEvent)
          }
        }
      })
    ]
  }
})
