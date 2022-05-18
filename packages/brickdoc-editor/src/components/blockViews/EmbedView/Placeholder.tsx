import { FC, ReactNode } from 'react'
import { styled, theme } from '@brickdoc/design-system'
import { UploadProgress } from '@brickdoc/uploader'
import { maxWidth } from './styles'

export interface EmbedBlockPlaceholderProps {
  icon: ReactNode
  label: string
  description: string
  progress?: UploadProgress
  onClick?: VoidFunction
}

const Placeholder = styled('div', {
  alignItems: 'center',
  backgroundColor: theme.colors.overlaySecondary,
  borderRadius: '4px',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'row',
  height: '4rem',
  maxWidth,
  padding: '.75rem 1rem',
  position: 'relative'
})

const IconContainer = styled('span', {
  color: theme.colors.typeThirdary,
  fontSize: '1.5rem',
  marginRight: '1rem'
})

const MainContent = styled('div', {
  display: 'flex',
  flexDirection: 'column'
})

const Label = styled('span', {
  color: theme.colors.typeSecondary,
  fontSize: theme.fontSizes.subHeadline,
  lineHeight: '1.375rem'
})

const Description = styled('span', {
  color: theme.colors.typeDisabled,
  fontSize: theme.fontSizes.callout,
  lineHeight: '1.125rem'
})

const Progress = styled('div', {
  background: theme.colors.primaryDefault,
  bottom: 0,
  borderBottomLeftRadius: '2px',
  height: '2px',
  left: 0,
  position: 'absolute',
  transition: 'width 300ms linear'
})

export const EmbedBlockPlaceholder: FC<EmbedBlockPlaceholderProps> = props => {
  const { icon, label, description, progress, onClick, children, ...restProps } = props
  return (
    <Placeholder {...restProps} role="button" onClick={onClick}>
      <IconContainer>{icon}</IconContainer>
      <MainContent>
        <Label>{label}</Label>
        <Description>{description}</Description>
      </MainContent>
      <Progress
        css={{ width: `${Math.floor((100 * (progress?.bytesUploaded ?? 0)) / (progress?.bytesTotal ?? Infinity))}%` }}
      />
    </Placeholder>
  )
}
