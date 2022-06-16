import { BrickdocEventBus, HistoryListToggle } from '@brickdoc/schema'
import { itemStyle } from '@/docs/pages/components/DocumentTopBar/DocumentTopBar.style'
import { Button, Tooltip, Icon } from '@brickdoc/design-system'
import { useCallback } from 'react'
import { useDocsI18n } from '../../hooks'

export interface HistoryMenuProps {
  className?: string
}

export const HistoryMenu: React.FC<HistoryMenuProps> = ({ className }) => {
  const { t } = useDocsI18n()

  const onClick = useCallback(() => {
    BrickdocEventBus.dispatch(HistoryListToggle({}))
  }, [])

  return (
    <Tooltip title={t('history.tooltip')}>
      <Button className={className} type="text" onClick={onClick} css={itemStyle}>
        <Icon.Time aria-label={t('history.menu')} />
      </Button>
    </Tooltip>
  )
}