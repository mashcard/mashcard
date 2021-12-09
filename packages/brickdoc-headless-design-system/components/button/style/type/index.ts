export const type = {
  primary: {
    backgroundColor: '$color-primary-default',
    color: '$white',

    '&:hover, &:focus, &:active': {
      textDecoration: 'none',
      backgroundColor: '$color-primary-hover'
    }
  },
  'primary-press': {
    backgroundColor: '$color-primary-pressed',
    color: '$white'
  },

  secondary: {
    backgroundColor: '$white',
    border: '1px solid $color-border-secondary',
    color: '$color-type-primary',
    '&:hover, &:focus, &:active': {
      textDecoration: 'none',
      backgroundColor: '$color-background-secondary'
    },
    '&-press': {}
  },
  'secondary-press': {
    backgroundColor: '$grey-3',
    color: '$color-type-primary'
  },

  text: {
    backgroundColor: 'transparent',
    color: '$color-type-primary',
    '&:hover, &:focus, &:active': {
      textDecoration: 'none',
      backgroundColor: '$color-background-primary'
    }
  },
  'text-press': {
    backgroundColor: '$grey-3',
    color: '$color-type-primary'
    // transition: 'background .3s $ease-in-out'
  },

  danger: {
    backgroundColor: '$color-error-default',
    color: '$white',
    '&:hover, &:focus, &:active': {
      textDecoration: 'none',
      backgroundColor: '$color-error-hover'
    }
  },
  'danger-press': {
    backgroundColor: '$color-error-pressed',
    color: '$white'
  }
}