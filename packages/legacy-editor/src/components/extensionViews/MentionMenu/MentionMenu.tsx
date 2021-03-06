import * as React from 'react'
import { SuggestionProps } from '@tiptap/suggestion'
import { UserGroup } from './UserGroup'
import { Menu, styled } from '@mashcard/design-system'
import { PageGroup } from './PageGroup'
import { TEST_ID_ENUM } from '@mashcard/test-helper'
import { PageItem, UserItem } from '../../../extensions/extensions/mentionCommands/filterMenuItemsByQuery'

export interface MentionCommandsMenuProps
  extends Omit<SuggestionProps, 'items' | 'decorationNode' | 'text' | 'clientRect'> {
  activeCategory: 'users' | 'pages'
  activeIndex: number
  baseId?: string
  items: {
    users: UserItem[]
    pages: PageItem[]
  }
  size?: 'sm' | 'md'
}

const MentionMenu = styled(Menu, {
  width: '22rem',
  variants: {
    size: {
      md: {
        width: '22rem'
      },
      sm: {
        width: '15.5rem'
      }
    }
  }
})

export const MentionCommandsMenu: React.FC<MentionCommandsMenuProps> = ({
  editor,
  range,
  items,
  baseId,
  size = 'md',
  activeCategory = 'users',
  activeIndex = 0
}) => {
  if (items.pages.length === 0 && items.users.length === 0) {
    return null
  }

  return (
    <MentionMenu size={size} baseId={baseId} data-testid={TEST_ID_ENUM.editor.linkMenu.id}>
      <UserGroup
        active={activeCategory === 'users'}
        activeIndex={activeIndex}
        editor={editor}
        range={range}
        items={items.users}
      />
      <PageGroup
        active={activeCategory === 'pages'}
        activeIndex={activeIndex}
        editor={editor}
        range={range}
        items={items.pages}
      />
    </MentionMenu>
  )
}
