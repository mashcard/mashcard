import { DependencyList, FC, useEffect } from 'react'
import { Editor, EditorOptions, Extensions, JSONContent } from '@tiptap/core'
import { EditorContent as TiptapEditorContent, useEditor } from '../tiptapRefactor'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { ListItem } from '@tiptap/extension-list-item'
import { CommandHelper } from '../extensions'
import TextStyle from '@tiptap/extension-text-style'

export interface TestEditorContentProps {
  content?: string | JSONContent
  extensions?: Extensions
}

export function useTestEditor(options?: Partial<EditorOptions>, deps?: DependencyList): Editor | null {
  const baseExtensions = [
    Document,
    options?.extensions?.map(e => e.name).includes(Paragraph.name) ? undefined : Paragraph,
    ListItem,
    Text,
    TextStyle,
    CommandHelper
  ].filter(i => i) as Extensions

  return useEditor(
    {
      ...options,
      extensions: [...baseExtensions, ...(options?.extensions ?? [])]
    },
    deps
  )
}

export const TestEditorContent: FC<TestEditorContentProps> = ({ content, extensions }) => {
  const editor = useTestEditor({
    content,
    extensions
  })

  useEffect(() => {
    editor?.createNodeViews()
  }, [editor])

  return <TiptapEditorContent editor={editor} />
}
