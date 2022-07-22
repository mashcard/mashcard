import { refractor } from './refractorLanguagesBundle'
import { CodeBlock as TiptapCodeBlock } from '@tiptap/extension-code-block'
import { LegacyReactNodeViewRenderer } from '../../../tiptapRefactor'
import { RefractorPlugin } from './refractor-plugin'
import { CodeBlockView } from '../../../components/blockViews'
import { CodeBlockOptions, meta } from './meta'

export const CodeBlock = TiptapCodeBlock.extend<CodeBlockOptions>({
  name: meta.name,

  draggable: true,

  addOptions() {
    return {
      ...this.parent?.(),
      refractor,
      defaultLanguage: 'typescript'
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      autoWrap: {
        default: true
      }
    }
  },

  addNodeView() {
    return LegacyReactNodeViewRenderer(CodeBlockView)
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() ?? []),
      RefractorPlugin({
        name: this.name,
        refractor: this.options.refractor,
        defaultLanguage: this.options.defaultLanguage
      })
    ]
  }
})
