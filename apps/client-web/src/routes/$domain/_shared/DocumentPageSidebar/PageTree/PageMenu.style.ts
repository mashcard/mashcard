import { styled, theme } from '@mashcard/design-system'
import { Link } from 'react-router-dom'

export const Title = styled(Link, {
  overflow: 'hidden',
  fontSize: 14,
  lineHeight: '2rem',
  alignItems: 'center',
  flexGrow: 1
})

export const Menu = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  whiteSpace: 'nowrap',
  width: '100%',
  alignItems: 'center',
  paddingRight: 3,
  a: {
    color: '#292333',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textDecoration: 'none'
  },
  '.btnBase, .addBtn, .moreBtn': {
    display: 'none',
    height: 'auto',
    fontSize: 'inherit',
    lineHeight: '16px',
    border: 'none',
    color: theme.colors.typeSecondary,
    zIndex: '2',
    padding: '4px',
    '&:hover': {
      backgroundColor: theme.colors.white_70p
    }
  },
  '.addBtn': {
    marginRight: 4,
    padding: 4
  },
  '.moreBtn': {
    marginRight: 0
  },
  '&:hover': {
    '.moreBtn': {
      display: 'unset'
    },
    '.addBtn': {
      display: 'unset'
    }
  }
})
