import * as React from 'react'
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react'
import { Editor } from '@tiptap/core'
import {
  IconBoldWords,
  IconListOrdered,
  IconListUnordered,
  IconItalics,
  IconStrikeThrough,
  IconTextUnderline,
  IconRteH1,
  IconRteH2,
  IconRteH3
} from '@brickdoc/design-system'
import { FontColorMenuItem } from './FontColorMenuItem'
import { MenuItem } from './MenuItem'
import './index.less'

interface BubbleMenuProps {
  editor: Editor | null
}

export interface StyleMeta {
  value: 'bold' | 'italic' | 'strike' | 'heading' | 'bulletList' | 'orderedList' | 'underline' | 'fontColor'
  label: React.ReactNode
  desc: string
  shortcutDesc?: string
  option?: any
}

const MarkStyle: StyleMeta[] = [
  {
    value: 'bold',
    label: <IconBoldWords />,
    desc: 'Bold',
    shortcutDesc: '⌘+B'
  },
  {
    value: 'italic',
    label: <IconItalics />,
    desc: 'Italic',
    shortcutDesc: '⌘+I'
  },
  {
    value: 'underline',
    label: <IconTextUnderline />,
    desc: 'Underline',
    shortcutDesc: '⌘+U'
  },
  {
    value: 'strike',
    label: <IconStrikeThrough />,
    desc: 'Strike-through'
  }
]

const HeadingStyle: StyleMeta[] = [
  {
    value: 'heading',
    label: <IconRteH1 />,
    option: { level: 1 },
    desc: 'Heading 1'
  },
  {
    value: 'heading',
    label: <IconRteH2 />,
    option: { level: 2 },
    desc: 'Heading 2'
  },
  {
    value: 'heading',
    label: <IconRteH3 />,
    option: { level: 3 },
    desc: 'Heading 3'
  }
]

const ListStyle: StyleMeta[] = [
  {
    value: 'bulletList',
    label: <IconListUnordered />,
    desc: 'Bullet-list'
  },
  {
    value: 'orderedList',
    label: <IconListOrdered />,
    desc: 'Ordered-list'
  }
]

export const BubbleMenu: React.FC<BubbleMenuProps> = ({ editor }) => {
  if (!editor) {
    return null
  }

  return (
    <TiptapBubbleMenu editor={editor} tippyOptions={{ placement: 'top', maxWidth: '1000px' }}>
      <div className="brickdoc-bubble-menu">
        <div className="bubble-menu-group">
          {HeadingStyle.map((s, index) => (
            <MenuItem key={index} editor={editor} style={s} />
          ))}
        </div>
        <div className="bubble-menu-group">
          {MarkStyle.map((s, index) => (
            <MenuItem key={index} editor={editor} style={s} />
          ))}
        </div>
        <div className="bubble-menu-group">
          <FontColorMenuItem editor={editor} />
        </div>
        <div className="bubble-menu-group">
          {ListStyle.map((s, index) => (
            <MenuItem key={index} editor={editor} style={s} />
          ))}
        </div>
      </div>
    </TiptapBubbleMenu>
  )
}
