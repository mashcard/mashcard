import { makeVar } from '@apollo/client'
import { ContextInterface } from '@mashcard/formula'
import { awarenessInfo } from './pages/hooks/useBlockSyncProvider'

export const isSavingVar = makeVar(false)
export const awarenessInfosVar = makeVar<awarenessInfo[]>([])

export const pagesVar = makeVar<
  Array<{
    key: string
    value: string
    parentId: string | null | undefined
    sort: number
    icon: string | null
    nextSort: number
    firstChildSort: number
    text: string
    title: string
  }>
>([])
export const FormulaContextVar = makeVar<ContextInterface | null>(null)
