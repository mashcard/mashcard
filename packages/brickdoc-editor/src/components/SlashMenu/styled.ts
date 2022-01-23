import { FC } from 'react'
import { Icon, Menu, MenuProps, menuItemSpacing, styled, theme, css } from '@brickdoc/design-system'
import { IconBackground } from '../Icon'

const footerHeight = '2rem'

export const StyledSlashMenu = styled(Menu as FC<MenuProps>, {
  maxHeight: 'inherit',
  overflow: 'auto',
  paddingBottom: footerHeight,
  variants: {
    withFooter: {
      true: {
        paddingBottom: footerHeight
      },
      false: {
        paddingBottom: 0
      }
    }
  }
})

export const SlashMenuGroupLabel = styled('span', {
  color: theme.colors.typeThirdary,
  fontSize: theme.fontSizes.callout
})

export const MenuIcon = styled(IconBackground, {
  fontSize: '.8125rem',
  height: '1.3rem',
  width: '1.3rem'
})

export const menuIconStyle = css({
  fontSize: '.8125rem',
  height: '1.3rem',
  width: '1.3rem'
})

export const RecentItem = styled(Menu.Item, {
  include: ['flexCenter'],
  borderRadius: '4px',
  display: 'flex',
  minHeight: 'unset',
  minWidth: 'unset',
  padding: '5px'
})

export const recentItemIconStyle = css({
  height: '1.6rem',
  width: '1.6rem'
})

export const RecentGroup = styled(Menu.Group, {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  margin: '.625rem 0',
  padding: `0 ${menuItemSpacing}`,
  [`${RecentItem} + ${RecentItem}`]: {
    marginLeft: '.9rem'
  }
})

export const Shortcut = styled('kbd', {
  border: `1px solid ${theme.colors.borderPrimary}`,
  borderRadius: '4px',
  color: theme.colors.typeDisabled,
  fontSize: '.875rem',
  lineHeight: '1em',
  padding: '.25rem'
})

export const Footer = styled('div', {
  alignItems: 'center',
  background: theme.colors.ceramicSecondary,
  bottom: 0,
  color: theme.colors.typeThirdary,
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'row',
  fontSize: theme.fontSizes.callout,
  height: footerHeight,
  justifyContent: 'space-between',
  left: 0,
  padding: `0 ${menuItemSpacing}`,
  position: 'absolute',
  right: 0,
  zIndex: 1
})

export const ExploreItem = styled('div', {
  alignItems: 'center',
  color: theme.colors.typeThirdary,
  display: 'flex',
  fontSize: theme.fontSizes.callout,
  justifyContent: 'space-between',
  width: '100%'
})

export const ExploreIcon = styled(Icon.HamburgerButton, {
  color: theme.colors.iconDisable,
  fontSize: '1rem'
})
