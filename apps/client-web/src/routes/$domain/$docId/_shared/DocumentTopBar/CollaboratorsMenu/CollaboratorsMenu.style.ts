import { styled, theme, Tooltip } from '@mashcard/design-system'
import { PodAvatar } from '../../../../../_shared/PodAvatar'

export const Avatar = styled(PodAvatar, {
  outlineColor: theme.colors.white,
  outlineWidth: '0.125rem',
  outlineStyle: 'solid',
  variants: {
    isMore: {
      true: {
        background: `${theme.colors.grey5.value}!important`,
        color: theme.colors.white
      }
    }
  }
})

export const CollaboratorsConatainer = styled(Tooltip, {
  flexDirection: 'row-reverse',
  marginRight: '0.875rem'
})
