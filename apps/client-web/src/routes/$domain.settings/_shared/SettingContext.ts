import { createContext, ReactElement } from 'react'

import { GetCurrentPodQuery } from '@/MashcardGraphQL'

export interface SettingAction {
  navigatePath: string
  icon: ReactElement
}

export interface SettingsContextProps {
  pod?: GetCurrentPodQuery['pod']
  actions: SettingAction[]
}

export const SettingsContext = createContext<SettingsContextProps | null>(null)
