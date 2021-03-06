/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useImperativeQuery } from '@/common/hooks'
import {
  BlockCreateShareLinkInput,
  Policytype,
  QueryPodSearchDocument,
  QueryPodSearchQuery as Query,
  QueryPodSearchQueryVariables as Variables,
  ShareLinkState,
  useBlockCreateShareLinkMutation,
  useGetBlockShareLinksQuery
} from '@/MashcardGraphQL'
import { debounce } from '@mashcard/active-support'
import { Check, LineDown } from '@mashcard/design-icons'
import { Button, Dropdown, Icon, Menu, Popover, Select, Spin, theme, toast } from '@mashcard/design-system'
import React, { useCallback, useState } from 'react'
import { useNonNullDocMeta } from '../../../../_shared/DocMeta'
import { PodCard, PodType } from '../../../../../_shared/PodCard'
import { useDocsI18n } from '../../../../_shared/useDocsI18n'
import { queryBlockShareLinks } from '../../graphql'
import { ShareLinkListItem } from './ShareLinkListItem'
import { Action, menu } from './ShareLinkListItem.style'
import { selectStyle } from './select.style'
import { CopyLinkWrapper, InviteBar, Item, List, SharePopTitle, Wrapper } from './SharePopover.style'

const menuClassName = menu()
const prefixCls = selectStyle()
interface SharePopoverProps {
  children: React.ReactElement
}

const debounceTimeout = 800

type PodValue = string

const SharePopoverContent: React.FC = () => {
  const { t } = useDocsI18n()
  const { id, path, domain } = useNonNullDocMeta()
  const [inviteLoading, setInviteLoading] = React.useState<boolean>(false)

  const [blockCreateShareLink] = useBlockCreateShareLinkMutation({ refetchQueries: [queryBlockShareLinks] })
  const { data } = useGetBlockShareLinksQuery({ fetchPolicy: 'no-cache', variables: { id } })
  const [fetching, setFetching] = React.useState(false)
  const [podValue, setPodValue] = React.useState<PodValue[]>([])
  const podSearch = useImperativeQuery<Query, Variables>(QueryPodSearchDocument)
  const [options, setOptions] = React.useState<PodType[]>([])
  const [inviteUserPolicy, setInviteUserPolicy] = useState<Policytype>(Policytype.View)
  const [copied, setCopied] = React.useState<boolean>(false)
  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(link)
    void toast.success(t('share.copy_hint'))
    setCopied(true)
  }

  const inviteUsers = useCallback(async () => {
    setInviteLoading(true)
    const input: BlockCreateShareLinkInput = {
      id,
      target: podValue.map(domain => ({
        domain,
        policy: inviteUserPolicy,
        state: ShareLinkState.Enabled
      }))
    }
    await blockCreateShareLink({ variables: { input } })
    setPodValue([])
    setOptions([])
    setInviteLoading(false)
  }, [podValue, inviteUserPolicy, blockCreateShareLink, id, setOptions])

  const link = `${window.location.origin}${path}`

  const anyoneItem = data?.blockShareLinks.find(item => item.sharePodData.name === 'anyone') ?? {
    policy: Policytype.View,
    state: ShareLinkState.Disabled,
    sharePodData: {
      domain: 'anyone',
      name: 'anyone'
    }
  }

  const inviteList = (
    <List>
      <Item key="anyone">
        <ShareLinkListItem item={anyoneItem} isAnyOne />
      </Item>
      {data?.blockShareLinks
        .filter(item => item.sharePodData.name !== 'anyone')
        .filter(item => item.state !== ShareLinkState.Disabled)
        .map(item => (
          <Item key={item.key}>
            <ShareLinkListItem item={item} />
          </Item>
        ))}
    </List>
  )

  const debounceFetcher = React.useMemo(() => {
    const loadOptions = async (value: string): Promise<void> => {
      setOptions([])
      setFetching(true)
      const { data } = await podSearch({ input: value })
      const pods: PodType[] = data?.podSearch?.filter(pod => pod.domain !== domain) ?? []
      setOptions(pods)
      setFetching(false)
    }

    return debounce(loadOptions, debounceTimeout)
  }, [podSearch, domain])

  const onChangeInviterPolicy = (key: string): void => {
    setInviteUserPolicy(key as Policytype)
  }

  const menu = (
    <Menu onAction={onChangeInviterPolicy}>
      <Menu.Item className={menuClassName} itemKey={Policytype.View} active={Policytype.View === inviteUserPolicy}>
        <div className="content">
          <div className="head">{t('invite.view_message')}</div>
          <div className="desc">{t('invite.view_message_description')}</div>
        </div>
        {Policytype.View === inviteUserPolicy && <Check className="check-icon" />}
      </Menu.Item>
      <Menu.Item className={menuClassName} itemKey={Policytype.Edit} active={Policytype.Edit === inviteUserPolicy}>
        <div className="content">
          <div className="head">{t('invite.edit_message')}</div>
          <div className="desc">{t('invite.edit_message_description')}</div>
        </div>
        {Policytype.Edit === inviteUserPolicy && <Check className="check-icon" />}
      </Menu.Item>
    </Menu>
  )
  const policyMessage = Policytype.Edit === inviteUserPolicy ? t('invite.edit_message') : t('invite.view_message')

  const policyData = (
    <Action
      css={{
        position: 'absolute',
        right: 86,
        top: 8
      }}
    >
      <Dropdown trigger="click" overlay={menu}>
        <div>
          {policyMessage} <LineDown />
        </div>
      </Dropdown>
    </Action>
  )

  return (
    <Wrapper>
      <SharePopTitle>{t('share.share_title')}</SharePopTitle>
      <InviteBar>
        <Select
          menuItemSelectedIcon={<Check fill={theme.colors.primaryDefault.value} className="check-icon" />}
          prefixCls={prefixCls}
          className="user-picker"
          showSearch
          placeholder={t('invite.search')}
          notFoundContent={
            fetching ? (
              <Spin size="sm" />
            ) : (
              <span style={{ padding: '0 8px', color: theme.colors.typeSecondary.value }}>{t('invite.no_result')}</span>
            )
          }
          mode="multiple"
          filterOption={false}
          onSearch={debounceFetcher}
          value={podValue}
          onChange={newValue => {
            setPodValue(newValue)
          }}
        >
          {options.map(pod => (
            <Select.Option key={pod.domain} value={pod.domain}>
              <PodCard size="xs" pod={pod} />
            </Select.Option>
          ))}
        </Select>
        {policyData}
        <Button
          type="primary"
          onClick={inviteUsers}
          disabled={inviteLoading || !podValue.length}
          className="invite-btn"
        >
          {t('share.invite_button')}
        </Button>
      </InviteBar>
      {inviteList}

      <CopyLinkWrapper>
        <Button type="primary" size="sm" onClick={handleCopy} icon={copied ? <Icon.Check /> : <Icon.Link />}>
          {t(copied ? 'share.copy_link_button_done' : 'share.copy_link_button')}
        </Button>
      </CopyLinkWrapper>
    </Wrapper>
  )
}

export const SharePopover: React.FC<SharePopoverProps> = ({ children }) => {
  return (
    <>
      <Popover
        title={null}
        trigger="click"
        placement="bottom"
        overlayStyle={{ zIndex: 1 }}
        overlayInnerStyle={{ marginRight: 48, marginTop: -5 }}
        content={<SharePopoverContent />}
        destroyTooltipOnHide
      >
        {children}
      </Popover>
    </>
  )
}
