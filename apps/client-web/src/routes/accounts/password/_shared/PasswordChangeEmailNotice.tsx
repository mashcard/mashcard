import { ms } from '@mashcard/active-support'
import { Success } from '@mashcard/design-icons'
import { Box, Button, prefix, theme, toast, useCountDown } from '@mashcard/design-system'
import dayjs from 'dayjs'
import React, { useState } from 'react'

import { mutationResultHandler } from '@/common/utils'
import { useUserForgetPasswordMailSendMutation } from '@/MashcardGraphQL'
import { useAccountsI18n } from '../../_shared/useAccountsI18n'

export const PasswordChangeEmailNotice: React.FC<{ email: string; pending?: boolean }> = ({ email, pending }) => {
  const { t } = useAccountsI18n()
  const [targetDate, setTargetDate] = useState<number>(pending ? dayjs().add(1, 'minute').unix() : 0)
  const [countdown] = useCountDown({ targetDate })
  const [resendEmail, { loading }] = useUserForgetPasswordMailSendMutation()

  const onClick = async (): Promise<void> => {
    const { data } = await resendEmail({ variables: { input: { email } } })
    const result = data?.userForgetPasswordMailSend
    mutationResultHandler(result, () => {
      void toast.success(t('devise:passwords.send_instructions'))
    })
    setTargetDate(dayjs().add(1, 'minute').unix())
  }

  return (
    <Box
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        [`.${prefix}-icon-success`]: {
          fontSize: '4rem',
          marginBottom: '1rem',
          color: theme.colors.green6
        },
        h4: {
          margin: '2rem 0'
        }
      }}
    >
      <Success theme="filled" />
      <p>{t('devise:passwords.send_instructions')}</p>
      <Button loading={loading} onClick={onClick} disabled={countdown !== 0}>
        {countdown === 0 ? t('sessions.resend_confirmed_email') : t('sessions.resend_after', { ms: ms(countdown) })}
      </Button>
    </Box>
  )
}
