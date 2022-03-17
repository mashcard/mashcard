import { mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { UserView } from '../../../components/blockViews'
import { createBlock } from '../../common'
import { meta, UserAttributes, UserOptions } from './meta'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    userBlock: {
      /**
       * Set a user block
       */
      setUserBlock: (domain: string, name: string | null | undefined, avatarUrl: string | undefined) => ReturnType
    }
  }
}

export const User = createBlock<UserOptions, UserAttributes>({
  name: meta.name,

  inline: true,

  group: 'inline',

  selectable: false,

  addAttributes() {
    return {
      people: {
        default: {
          type: 'PEOPLE'
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'user-block'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['user-block', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(UserView)
  },

  addCommands() {
    return {
      setUserBlock:
        (domain, name, avatarUrl) =>
        ({ chain }) => {
          return chain()
            .insertBlockAt({
              type: this.name,
              attrs: {
                people: {
                  type: 'PEOPLE',
                  domain,
                  name,
                  avatarUrl
                }
              }
            })
            .run()
        }
    }
  }
})