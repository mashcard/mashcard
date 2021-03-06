import { theme } from '../../../themes'

export const btnType = {
  primary: {
    backgroundColor: theme.colors.primaryDefault,
    color: theme.colors.white,
    '&:hover, &:focus-visible, &:active': {
      textDecoration: 'none',
      backgroundColor: theme.colors.primaryHover
    },
    '&:active': {
      backgroundColor: theme.colors.primaryPressed,
      color: theme.colors.white
    }
  },

  secondary: {
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.borderSecondary}`,
    color: theme.colors.typePrimary,
    '&:hover, &:focus-visible, &:active': {
      textDecoration: 'none',
      backgroundColor: theme.colors.backgroundSecondary
    },
    '&:active': {
      backgroundColor: theme.colors.secondaryPressed,
      border: `1px solid ${theme.colors.borderSecondary}`,
      color: theme.colors.typePrimary
    }
  },

  text: {
    backgroundColor: 'transparent',
    color: theme.colors.typePrimary,
    '&:hover,&:focus-visible': {
      textDecoration: 'none',
      backgroundColor: theme.colors.secondaryHover
    },
    '&:active': {
      backgroundColor: theme.colors.secondaryPressed,
      color: theme.colors.typePrimary
    }
  },

  danger: {
    backgroundColor: theme.colors.errorDefault,
    color: theme.colors.white,
    '&:hover, &:focus-visible, &:active': {
      textDecoration: 'none',
      backgroundColor: theme.colors.errorHover
    },
    '&:active': {
      backgroundColor: theme.colors.errorPressed,
      color: theme.colors.white
    }
  },
  unstyled: {
    backgroundColor: 'unset',
    border: 'none',
    padding: 'unset',
    minWidth: 'unset'
  }
}
