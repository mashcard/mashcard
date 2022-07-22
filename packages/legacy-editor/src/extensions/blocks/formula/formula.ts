import { mergeAttributes } from '@tiptap/core'
import { LegacyReactNodeViewRenderer } from '../../../tiptapRefactor'
import { createBlock, createJSONAttributeHtmlParser, createJSONAttributeHtmlRender } from '../../common'
import { FormulaBlock } from '../../../components/blockViews'
import { FormulaAttributes, FormulaOptions, meta } from './meta'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    formula: {
      setFormula: (id: string) => ReturnType
      setFormulaBlock: () => ReturnType
      insertFormulaBlock: (position?: number) => ReturnType
      toggleFormula: () => ReturnType
    }
  }
}

export const Formula = createBlock<FormulaOptions, FormulaAttributes>({
  name: meta.name,

  group: 'inline',

  content: '',

  inline: true,

  selectable: false,

  addAttributes() {
    return {
      isNew: {
        default: false
      },
      formula: {
        default: {
          type: 'FORMULA'
        },
        parseHTML: createJSONAttributeHtmlParser('data-formula'),
        renderHTML: createJSONAttributeHtmlRender('formula', 'data-formula')
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'formula-block'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['formula-block', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return LegacyReactNodeViewRenderer(FormulaBlock)
  },

  addCommands() {
    return {
      setFormula:
        id =>
        ({ chain }) => {
          const content = { type: this.name, attrs: { formula: { type: 'FORMULA', id } } }
          return chain().insertBlockAt(content).run()
        },
      setFormulaBlock:
        () =>
        ({ chain }) => {
          const content = {
            type: this.name,
            attrs: { isNew: true, formula: { type: 'FORMULA' } }
          }
          return chain().insertBlockAt(content).run()
        },
      insertFormulaBlock:
        position =>
        ({ chain }) => {
          const content = {
            type: this.name,
            attrs: { isNew: true, formula: { type: 'FORMULA' } }
          }
          return chain().insertBlockAt(content, position).run()
        },
      toggleFormula:
        () =>
        ({ commands, chain }) => {
          if (this.editor.isActive(this.name)) {
            return commands.setNode('text')
          } else {
            const content = {
              type: this.name,
              attrs: { isNew: true, formula: { type: 'FORMULA' } }
            }
            return chain().insertBlockAt(content).run()
          }
        }
    }
  }
})
