import { mergeAttributes } from '@tiptap/core'
import { LegacyReactNodeViewRenderer } from '../../../tiptapRefactor'
import { PageLinkView } from '../../../components/blockViews'
import { createBlock, createJSONAttributeHtmlParser, createJSONAttributeHtmlRender } from '../../common'
import { meta, PageLinkAttributes, PageLinkOptions } from './meta'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageLinkBlock: {
      /**
       * Set a page link block
       */
      setPageLinkBlock: (
        id: string,
        link: string | null | undefined,
        title: string | null | undefined,
        icon: string | null | undefined
      ) => ReturnType
    }
  }
}

export const PageLink = createBlock<PageLinkOptions, PageLinkAttributes>({
  name: meta.name,

  inline: true,

  group: 'inline',

  selectable: false,

  addAttributes() {
    return {
      page: {
        default: {
          type: 'PAGE'
        },
        parseHTML: createJSONAttributeHtmlParser('data-page'),
        renderHTML: createJSONAttributeHtmlRender('page', 'data-page')
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'page-link-block'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['page-link-block', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return LegacyReactNodeViewRenderer(PageLinkView)
  },

  addCommands() {
    return {
      setPageLinkBlock:
        (id, link, title, icon) =>
        ({ chain }) => {
          return chain()
            .insertBlockAt({
              type: this.name,
              attrs: {
                page: {
                  type: 'PAGE',
                  key: id,
                  title,
                  link,
                  icon
                }
              }
            })
            .run()
        }
    }
  }
})
