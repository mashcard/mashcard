import { theme, utils, styled } from '@mashcard/design-system'

export const PageContainer = styled('div', {
  height: '100vh',
  overflowY: 'auto',
  overflowX: 'hidden',
  ...utils.mixins.refractionSecondary,
  ...utils.mixins.ceramicSecondary,
  padding: '5rem 7rem 0',
  display: 'flex',
  flexFlow: 'column'
})

export const Title = styled('title', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  h1: {
    lineHeight: 1.5,
    fontSize: '1.5rem',
    margin: 0
  },
  paddingBottom: '2rem'
})

export const InputSuffix = styled('span', {
  color: theme.colors.deepPurple4
})

export const List = styled('ul', {
  flex: 1,
  overflowX: 'hidden',
  overflowY: 'auto',
  listStyle: 'none',
  margin: 0,
  padding: 0,
  position: 'relative',
  '.trash-spin': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  }
})

export const Page = styled('div', {
  flex: 4,
  display: 'flex',
  alignItems: 'start',
  cursor: 'pointer',
  overflowX: 'hidden',
  minWidth: 0,
  paddingRight: '0.5rem',
  '.ellipsis': {
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  '.title': {
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    lineHeight: '1.375rem',
    color: theme.colors.typePrimary,
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  '.path': {
    margin: '0 0 0 1.75rem',
    fontSize: '0.75rem',
    lineHeight: 1.5,
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
})

export const Owner = styled('div', {
  flex: 1
})

export const Time = styled('div', {
  flex: 2
})

export const Action = styled('div', {
  flex: 1,
  textAlign: 'right',
  paddingRight: 8,
  opacity: 0
})

export const AvatarEmoji = styled('span', {
  fontSize: '1.25rem',
  marginRight: '0.5rem',
  color: theme.colors.typeThirdary
})

export const ActionButtonStyle = {
  height: '1.5rem',
  width: '1.5rem',
  padding: 0,
  marginLeft: 8,
  color: theme.colors.typeThirdary,
  '&:hover': {
    background: 'white'
  }
}

export const PageTile = styled('div', {
  flex: 1
})

export const SelectBlock = styled('div', {
  width: '2rem',
  display: 'flex',
  alignItems: 'flex',
  justifyContent: 'center',
  padding: '2px 0',
  fontSize: 18,
  opacity: 0,
  flexShrink: 0,
  variants: {
    checked: {
      true: {
        opacity: 1
      }
    }
  }
})

export const Item = styled('li', {
  flexShrink: 0,
  position: 'relative',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  height: 56,
  marginBo5tom: 1,
  color: theme.colors.typeThirdary,
  fontSize: '0.75rem',
  borderRadius: 4,
  '&::after': {
    content: '',
    position: 'absolute',
    bottom: -1,
    left: 0,
    width: '100%',
    height: '1px',
    background: `linear-gradient(to right, transparent 1.875rem, ${theme.colors.dividerOverlayPrimary} 1.875rem)`
  },
  variants: {
    type: {
      title: {
        fontSize: '0.875rem',
        background: 'transparent',
        [Action.toString()]: {
          opacity: 1
        }
      },
      item: {
        '&:hover': {
          backgroundColor: theme.colors.secondaryHover,
          [Action.toString()]: {
            opacity: 1
          },
          [SelectBlock.toString()]: {
            opacity: 1
          }
        }
      }
    },
    checked: {
      true: {
        backgroundColor: theme.colors.secondarySelected,
        '&:hover': {
          backgroundColor: theme.colors.secondarySelected
        }
      }
    }
  }
})

export const NotFound = styled('p', {
  color: theme.colors.deepPurple3,
  fontSize: theme.fontSizes.subHeadline,
  margin: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%'
})

export const SelectedBar = styled('div', {
  alignItems: 'center',
  flexShrink: 0,
  display: 'flex',
  height: '5rem',
  background: theme.colors.overlaySecondary,
  padding: '0 0.5rem 0 0',
  borderRadius: 4,
  '&:hover': {
    backgroundColor: theme.colors.overlaySecondary
  },
  [Action.toString()]: {
    flex: 4,
    opacity: 1
  },
  button: {
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem'
  }
})
