import { theme } from '@brickdoc/design-system'

export const itemHeight = '1.25rem'

export const hover = {
  '&:hover': {
    backgroundColor: theme.colors.secondaryHover
  }
}

export const pressed = {
  '&:focus, &:active': {
    backgroundColor: theme.colors.secondaryPressed
  }
}

export const itemCommon = {
  borderRadius: '2px',
  padding: '0 .25rem',
  transition: `all .3s ${theme.transitions.easeInOut}`,
  ...hover,
  ...pressed
}