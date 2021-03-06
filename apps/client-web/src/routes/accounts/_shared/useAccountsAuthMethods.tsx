import { sortBy } from '@mashcard/active-support'
import { ImageIcon } from '@mashcard/design-icons'
import { useContext } from 'react'

import { MashcardContext } from '@/common/mashcardContext'
import { AuthMethod, useGetAccountsConfigFromWsQuery } from '@/MashcardGraphQL'
import Email from './email-auth-icon.svg'

export interface authMethod {
  name: string
  logo: JSX.Element
  action: () => void
}

function redirectToOAuthProvider(provider: string, csrfToken: string): void {
  const form = document.createElement('form')
  form.method = 'post'
  form.action = `/$internal-apis/accounts/auth/${provider}`
  form.innerHTML = `
    <input name="_method" value="POST" type="hidden" />
    <input name="authenticity_token" value="${csrfToken}" type="hidden" />
    <input type="submit" />
  `
  form.style.display = 'none'
  document.body.appendChild(form)
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]')
  submit?.click()
}

/**
 * A Array of enabled accounts authentication methods.
 * With the preferred authentication method at the TOP of this array.
 *
 * @param emailPwdBtnOnClick - If emailPasssword is not preferred, the function triggered when it is clicked
 */
export const useAccountsAuthMethods = (
  emailPwdBtnOnClick: () => void
): { authMethods: authMethod[]; loading: boolean } => {
  const { csrfToken } = useContext(MashcardContext)
  const { loading, data } = useGetAccountsConfigFromWsQuery()
  if (loading) {
    return { loading, authMethods: [] }
  }
  const config = data?.metadata.config

  let authMethods =
    config?.accountsFederatedProviders
      ?.map(i => ({
        name: i.name,
        logo: <ImageIcon src={i.logo} style={{ maxWidth: '1em' }} alt={`${i.name} logo`} />,
        action: () => redirectToOAuthProvider(i.name, csrfToken)
      }))
      // Add EmailPassword Auth if it enabled.
      .concat(
        config.accountsEmailPasswordAuth
          ? [
              {
                name: AuthMethod.EmailPassword,
                logo: <ImageIcon src={Email} alt="email auth icon" />,
                action: emailPwdBtnOnClick
              }
            ]
          : []
      ) ?? []

  // Move `accountsPreferredAuthMethod` to the top of the authMethods array.
  authMethods = sortBy(authMethods, ({ name }) => (name === config?.accountsPreferredAuthMethod ? 0 : 1))
  return { authMethods, loading }
}
