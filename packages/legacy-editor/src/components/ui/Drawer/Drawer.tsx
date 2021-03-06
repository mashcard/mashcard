import { FC, ReactNode, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { motion, Transition } from 'framer-motion'
import { Button, styled, theme } from '@mashcard/design-system'
import { Close } from '@mashcard/design-icons'

export interface DrawerProps {
  className?: string
  title?: string
  visible?: boolean
  container?: HTMLElement
  onClose?: () => void
  renderBody?: () => ReactNode
  children?: ReactNode
}

export const width = '17.5rem'
export const horizontalPadding = '1.125rem'

const DrawerContainer = styled(motion.div, {
  include: ['ceramicSecondary'],
  borderLeft: `1px solid ${theme.colors.dividerOverlayPrimary}`,
  borderTopRightRadius: '2px',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: '0.75rem 0',
  position: 'relative',
  width,
  variants: {
    visible: {
      false: {
        height: 0,
        padding: 0
      }
    }
  }
})

const CloseButton = styled(Button, {
  position: 'absolute',
  height: '1rem',
  right: '1rem',
  top: '1rem',
  width: '1rem',
  variants: {
    size: {
      md: {
        fontSize: '1rem',
        padding: 0
      }
    }
  }
})

const Title = styled('div', {
  color: theme.colors.typeSecondary,
  fontSize: theme.fontSizes.body,
  fontWeight: 600,
  lineHeight: '1.5rem',
  marginBottom: '1.625rem',
  padding: `0 ${horizontalPadding}`
})

const Body = styled('div', {
  padding: `0 ${horizontalPadding}`
})

const drawerAnimation = (visible?: boolean): { width: string | number } => ({
  width: visible ? width : 0
})
const drawerTransition = (visible?: boolean): Transition => ({
  width: visible ? { type: 'spring', stiffness: 1400, damping: 80 } : { ease: 'linear', duration: 0 }
})

export const Drawer: FC<DrawerProps> = ({ visible, className, title, renderBody, container, onClose, children }) => {
  const element = container ?? document.body

  return createPortal(
    <Suspense>
      <DrawerContainer
        visible={visible}
        className={className}
        animate={drawerAnimation(visible)}
        transition={drawerTransition(visible)}
      >
        {visible && (
          <>
            <CloseButton
              onClick={onClose}
              type="unstyled"
              size="md"
              icon={<Close fill={theme.colors.iconThirdary.value} />}
            />
            <Title>{title}</Title>
            {renderBody?.()}
            <Body>{children}</Body>
          </>
        )}
      </DrawerContainer>
    </Suspense>,
    element
  )
}
