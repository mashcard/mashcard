import { Input, theme } from '@mashcard/design-system'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDocsI18n } from '../useDocsI18n'
import * as Root from './Trash.style'
import { PageTrash } from './TrashList'

interface TrashTableProps {
  docMeta: {
    id?: string | undefined
    domain: string
  }
}

export const TrashTable: React.FC<TrashTableProps> = ({ docMeta }) => {
  const { t } = useDocsI18n()
  const [keyword, setSearchKeyword] = useState<string>('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const handleMetaK = (e: KeyboardEvent): void => {
      if (e.key === 'k' && e.metaKey) {
        ref.current?.focus()
      }
    }
    document.addEventListener('keydown', handleMetaK)
    return () => document.removeEventListener('keydown', handleMetaK)
  }, [])
  const handleEscape: React.KeyboardEventHandler<HTMLInputElement> = useCallback(e => {
    if (e.key === 'Escape') {
      ref.current?.blur()
    }
  }, [])
  return (
    <Root.PageContainer>
      <Root.Title>
        <h1>{t('trash.name')}</h1>
        <Input
          ref={ref}
          onKeyDown={handleEscape}
          css={{ width: 368, height: 32, background: theme.colors.ceramicQuaternary }}
          placeholder={t('trash.search')}
          suffix={<Root.InputSuffix>⌘+K</Root.InputSuffix>}
          onChange={e => setSearchKeyword(e.target.value)}
        />
      </Root.Title>
      <PageTrash domain={docMeta.domain} keyword={keyword} />
    </Root.PageContainer>
  )
}
