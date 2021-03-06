import { isEmpty } from '@mashcard/active-support'
import { useImperativeQuery } from '@/common/hooks/index'
import {
  QueryEmailAvailableFromWsDocument,
  QueryEmailAvailableFromWsQuery as Query,
  QueryEmailAvailableFromWsQueryVariables as Variables
} from '@/MashcardGraphQL'
import { TestConfig } from 'yup'

// TODO: merge with useDomainAvailableValidator --> useAvailableValidator
export const useEmailAvailableValidator = (): TestConfig => {
  const queryEmailAvailable = useImperativeQuery<Query, Variables>(QueryEmailAvailableFromWsDocument)
  return {
    name: 'emailAvailable',
    test: async (value, ctx) => {
      if (isEmpty(value)) {
        return false
      }
      const { message, success } = (await queryEmailAvailable({ email: value as string })).data.emailAvailable
      return success ? true : ctx.createError({ message: `${value} ${message}` })
    }
  }
}
