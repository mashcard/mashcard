import React, { useEffect } from 'react'
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import Paragraph from '@tiptap/extension-paragraph'
import { useEditor, EditorContent, JSONContent, EditorEvents } from '@tiptap/react'
import { devLog } from '@brickdoc/design-system'
import { HandleKeyDownExtension } from './extensions/handleKeyDown'
import './FormulaEditor.less'
import { FormulaTypeExtension } from './extensions/formulaType'
import { BrickdocEventBus, FormulaEditorUpdateEventTrigger } from '@brickdoc/schema'

export interface EditorContentType {
  content: JSONContent | undefined
  position: number
}

export interface FormulaEditorProps {
  editorContent: EditorContentType
  editable: boolean
  onBlur?: () => void
  rootId?: string
  formulaId?: string
}

const findNearestWord = (content: string, targetIndex: number): string | undefined =>
  content.split(' ').find((word, index) => index + word.length >= targetIndex)

export const FormulaEditor: React.FC<FormulaEditorProps> = ({ editable, editorContent, onBlur, rootId, formulaId }) => {
  const editor = useEditor({
    editable,
    autofocus: 'end',
    extensions: [
      Document,
      Text,
      Paragraph,
      FormulaTypeExtension.configure({ editable }),
      HandleKeyDownExtension({ formulaId, rootId })
    ],
    onFocus: (props: EditorEvents['focus']) => {
      // console.debug('FormulaEditor:onFocus', props)
    },
    onBlur: (props: EditorEvents['blur']) => {
      // NOTE Very hacky way to prevent blur hook
      // TODO WHY IS THIS CALLED?
      // = -> =1
      // =1 -> =
      if (props.event.relatedTarget) {
        console.debug('FormulaEditor:onBlur', props)
        onBlur?.()
      }
    },
    onUpdate: ({ editor, transaction }) => {
      const editorPosition = transaction.selection.from - 1
      if (transaction.selection.from === transaction.selection.to && editorPosition >= 1) {
        const blocks: JSONContent[] = editor.getJSON().content?.[0].content ?? []
        let length = 0

        for (const block of blocks) {
          let blockLength = 0
          if (block.type === 'text') {
            blockLength = block.text?.length ?? 0
          } else {
            blockLength = 1
          }

          // matched
          if (length + blockLength >= editorPosition) {
            if (block.type !== 'text') break

            const word = findNearestWord(block.text!, editorPosition - length - 1)
            console.info({ word, position: editorPosition - length - 1 })
          }

          length += blockLength
        }
      }

      if (rootId && formulaId) {
        const jsonContent = editor.getJSON()
        BrickdocEventBus.dispatch(
          FormulaEditorUpdateEventTrigger({ position: editorPosition, content: jsonContent, formulaId, rootId })
        )
      }
    }
  })

  useEffect(() => {
    if (editor && !editor.isDestroyed && editorContent.content) {
      if (editorContent.position) {
        editor
          .chain()
          .replaceRoot(editorContent.content)
          .setTextSelection(editorContent.position + 1)
          .run()
      } else {
        editor.commands.replaceRoot(editorContent.content)
      }

      if (editable) devLog('after replace root', { editorContent, editor })
    }
  }, [editor, editorContent, editable])

  return (
    <>
      <EditorContent className="brickdoc-formula-editor" editor={editor} />
    </>
  )
}
