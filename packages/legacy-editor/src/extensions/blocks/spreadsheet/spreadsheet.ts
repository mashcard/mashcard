import { mergeAttributes } from '@tiptap/core'
import { LegacyReactNodeViewRenderer } from '../../../tiptapRefactor'
import { uuid } from '@mashcard/active-support'
import { SpreadsheetBlockView } from '../../../components/blockViews'
import { createBlock } from '../../common'
import { SpreadsheetOptions, SpreadsheetAttributes, meta } from './meta'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    spreadsheetBlock: {
      /**
       * Set a spreadsheet block
       */
      setSpreadsheetBlock: (position?: number) => ReturnType
    }
  }
}

export const Spreadsheet = createBlock<SpreadsheetOptions, SpreadsheetAttributes>({
  name: meta.name,

  group: 'block',

  selectable: false,

  atom: true,

  draggable: true,

  allowGapCursor: false,

  addAttributes() {
    return {
      isNew: {
        default: false
      },
      data: {
        default: {
          columns: [],
          rowsCount: 0
        },
        renderHTML: attributes => {
          return {
            'data-spreadsheet': JSON.stringify(attributes.data)
          }
        },
        parseHTML: element => {
          const str = element.getAttribute('data-spreadsheet')
          return str ? JSON.parse(str) : { columns: [], rowCount: 0 }
        }
      },
      title: {
        default: ''
      },
      isDefaultTitle: {
        default: true
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'spreadsheet-block'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['spreadsheet-block', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return LegacyReactNodeViewRenderer(SpreadsheetBlockView)
  },

  addCommands() {
    return {
      setSpreadsheetBlock:
        (position?: number) =>
        ({ chain, state }) => {
          const spreadsheetTitles: string[] = []
          state.doc.descendants(node => {
            if (node.type.name === meta.name) {
              spreadsheetTitles.push(node.attrs.title)
            }
          })
          let newTitle = ''
          for (let i = 1; newTitle === '' || spreadsheetTitles.includes(newTitle); i++) {
            newTitle = `Table${i}`
          }
          return chain()
            .insertBlockAt(
              {
                type: this.name,
                attrs: {
                  isNew: true,
                  isDefaultTitle: true,
                  title: newTitle,
                  data: {
                    columns: [
                      { uuid: uuid(), sort: 0 },
                      { uuid: uuid(), sort: 1 }
                    ],
                    rowCount: 0
                  }
                }
              },
              position
            )
            .run()
        }
    }
  }
})
