import { isEmpty } from '@mashcard/active-support'
import { styled, Avatar, theme } from '@mashcard/design-system'
import { defaultSelectionStyles } from '../../../styles/index.style'
import { UserAttributes, UserOptions } from '../../../extensions/blocks/user/meta'
import { useEditorI18n } from '../../../hooks'

export interface UserProps {
  attributes: UserAttributes
  options?: UserOptions
}

const UserBlockAvatar = styled(Avatar, {
  marginRight: '.25rem',
  variants: {
    size: {
      sm: {
        width: '1.25rem',
        height: '1.25rem',
        lineHeight: '1.25rem',
        fontSize: '1.25rem'
      }
    }
  }
})

const UserName = styled('span', {
  color: theme.colors.primaryHover,
  variants: {
    size: {
      md: {
        fontSize: theme.fontSizes.body,
        lineHeight: '1.5rem'
      },
      sm: {
        fontSize: theme.fontSizes.callout,
        lineHeight: '1.125rem'
      }
    }
  }
})

const UserBlockContainer = styled('span', {
  alignItems: 'center',
  display: 'inline-flex',
  flexDirection: 'row',
  ...defaultSelectionStyles
})

export const User: React.FC<UserProps> = ({ attributes, options }) => {
  const [t] = useEditorI18n()
  const { name, domain, avatarUrl } = attributes?.people ?? {}
  const size = options?.size ?? 'md'
  const showAvatar = size !== 'sm'

  return (
    <UserBlockContainer>
      {showAvatar && (
        <UserBlockAvatar size="sm" initials={name ?? domain} src={isEmpty(avatarUrl) ? undefined : avatarUrl} />
      )}
      <UserName size={size}>
        {size === 'sm' && '@'}
        {isEmpty(name) ? t('user_block.anonymous') : name}
      </UserName>
    </UserBlockContainer>
  )
}
