import { styled, theme } from '../../../themes'
import { rem } from 'polished'

export const PageBlock = styled('div', {})

export const Indent = styled('div', {
  display: 'block'
})

export const PageItem = styled('div', {
  display: 'block',
  color: 'inherit',
  textDecoration: 'none',
  width: '100%',
  cursor: 'pointer'
})

export const ItemContent = styled('div', {
  userSelect: 'none',
  transition: 'background 20ms ease-in 0s',
  cursor: 'pointer',
  width: '100%'
})

export const Content = styled('div', {
  display: 'flex',
  alignItems: 'center',
  lineHeight: theme.space.xxxl,
  fontSize: theme.fontSizes.subHeadline,
  width: '100%'
})

export const ContentArrow = styled('div', {
  flexShrink: 0,
  flexGrow: 0,
  position: 'relative',
  width: theme.space.lg,
  height: theme.space.xxxl,
  borderRadius: `${theme.space.xxs} 0 0 ${theme.space.xxs}`,
  color: theme.colors.typeSecondary,
  fontSize: theme.fontSizes.body,
  paddingRight: theme.space.xxs,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 0,
  '& span': {
    transform: 'rotate(0deg)',
    transition: 'transform .1s ease-in-out'
  },
  variants: {
    isExpanded: {
      true: {
        '& span': {
          transform: 'rotate(90deg)'
        }
      }
    }
  }
})

export const LeafDot = styled('div', {
  position: 'absolute',
  width: theme.space.xxs,
  height: theme.space.xxs,
  background: theme.colors.iconSecondary,
  borderRadius: theme.space.xxs,
  top: rem('14px')
})

export const ContentTitle = styled('div', {
  flex: '1 1 auto',
  whiteSpace: 'nowrap',
  minWidth: '0px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: theme.fontSizes.subHeadline,
  color: theme.colors.typePrimary,
  '&:hover': {
    color: theme.colors.typePrimary
  }
})

export const ContentAction = styled('div', {
  width: `calc(100% - ${theme.space.lg})`,
  fontSize: theme.fontSizes.body,
  fontWeight: '500',
  lineHeight: theme.space.xxl
})

export const ContentIcon = styled('a', {
  fontFamily: theme.fonts.emoji,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  flexGrow: 0,
  width: theme.space.xl,
  height: theme.space.xl,
  fontSize: theme.fontSizes.title4,
  marginRight: '4px',
  position: 'relative',
  [`& + ${ContentAction}`]: {
    width: `calc(100% - ${theme.space.lg} - ${theme.space.xl} - 4px)`
  },
  '&:hover,&:active': {
    textDecoration: 'none'
  }
})

export const EmptyNode = styled('p', {
  margin: 0,
  fontSize: theme.fontSizes.subHeadline,
  fontWeight: 500,
  lineHeight: theme.space.xxxl,
  color: theme.colors.typeThirdary,
  paddingLeft: theme.space.lg,
  borderBottom: `${theme.space.xxxs} solid #00000000`
})

export const Base = styled('div', {
  boxSizing: 'border-box',
  display: 'flex',
  height: theme.space.xxxl,
  paddingLeft: theme.space.md,
  borderRadius: theme.space.xxs,
  background: 'transparent',
  marginRight: theme.space.xxxs,
  borderBottom: `${theme.space.xxxs} solid #00000000`,
  outline: 'none',
  '&:hover': {
    background: theme.colors.secondaryHover,
    backdropFilter: 'blur(40px)'
  },

  '&:active:hover': {
    background: theme.colors.thirdaryPressed
  },

  variants: {
    size: {},
    dragging: {
      true: {
        cursor: 'move'
      }
    },
    selected: {
      true: {
        background: theme.colors.secondarySelected,
        outline: 'none',
        '&:hover': {
          background: theme.colors.secondarySelected
        }
      }
    },
    variant: {},
    full: {}
  },
  compoundVariants: [],
  defaultVariants: {}
})
