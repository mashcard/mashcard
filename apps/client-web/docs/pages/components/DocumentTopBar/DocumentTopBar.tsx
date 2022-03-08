import React from 'react'
import { CollaboratorsMenu } from '@/docs/common/components/CollaboratorsMenu'
import { PathBreadcrumb } from '@/docs/common/components/PathBreadcrumb'
import { PinMenu } from '@/docs/common/components/PinMenu'
import { useReactiveVar } from '@apollo/client'
import { Button, Box } from '@brickdoc/design-system'
import { useNavigate } from 'react-router-dom'
import { HistoryMenu } from '../../../common/components/HistoryMenu'
import { ShareMenu } from '../../../common/components/ShareMenu'
import { useDocsI18n } from '../../../common/hooks'
import { isSavingVar } from '../../../reactiveVars'
import { DocMeta, NonNullDocMeta } from '../../DocumentContentPage'
import { BrickdocContext } from '@/common/brickdocContext'
import Logo from '@/common/assets/logo_brickdoc.svg'
/* import styles from './DocumentTopBar.module.less' */
import * as Root from './DocumentTopBar.style'
import loadingIcon from './loading.png'

export interface DocumentTopBarProps {
  docMeta: DocMeta
}

export const DocumentTopBar: React.FC<DocumentTopBarProps> = ({ docMeta }) => {
  const { t } = useDocsI18n()
  const navigate = useNavigate()
  const isSaving = useReactiveVar(isSavingVar)
  const { features } = React.useContext(BrickdocContext)

  if (!docMeta.viewable) {
    return <></>
  }

  const headMenu = docMeta.id ? (
    <>
      <Root.Menu as={PathBreadcrumb as any} docMeta={docMeta as NonNullDocMeta} />
      <Root.LogoIcon src={Logo} alt="Brickdoc" />
    </>
  ) : (
    <></>
  )

  const editableMenu =
    // eslint-disable-next-line no-nested-ternary
    docMeta.id && !docMeta.isDeleted ? (
      <>
        <Root.HiddenItem as={CollaboratorsMenu} docMeta={docMeta as NonNullDocMeta} />
        <Root.Item as={ShareMenu as any} docMeta={docMeta as NonNullDocMeta} />
        {features.page_history ? (
          <Root.HiddenItem as={HistoryMenu as any} docMeta={docMeta as NonNullDocMeta} />
        ) : (
          <></>
        )}
        {docMeta.isMine ? <Root.HiddenItem as={PinMenu as any} docMeta={docMeta as NonNullDocMeta} /> : <></>}
      </>
    ) : (
      <></>
    )

  const handleLogin = (): void => {
    navigate('/')
  }

  const loginMenu =
    docMeta.editable && docMeta.isAnonymous ? (
      <Button type="text" onClick={handleLogin}>
        {t('anonymous.edit_button')}
      </Button>
    ) : (
      <></>
    )
  return (
    <Root.TopBar
      width={{
        '@mdDown': 'md'
      }}
    >
      <Box>{headMenu}</Box>
      <Box>
        <Root.Menu>
          {isSaving && (
            <Root.Loading>
              <Root.LoadingIcon src={loadingIcon} alt="" />
              <span>{t('saving')}</span>
            </Root.Loading>
          )}
          {editableMenu}
          {loginMenu}
        </Root.Menu>
      </Box>
    </Root.TopBar>
  )
}