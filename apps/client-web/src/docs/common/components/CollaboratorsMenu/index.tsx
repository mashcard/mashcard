import { FC } from 'react'

import { Avatar, CollaboratorsConatainer } from './index.style'
import { awarenessInfosVar } from '../../../reactiveVars'

export const CollaboratorsMenu: FC = () => {
  const awarenessInfos = awarenessInfosVar()

  if (!awarenessInfos.length) {
    return <></>
  }

  const currentOperatorId = globalThis.mashcardContext.uuid
  const userNames: string[] = []
  // pull current operator to first and unique users
  const infos = awarenessInfos
    .sort((a, b) => (a.user.operatorId === currentOperatorId ? 1 : -1))
    .filter(i => {
      if (userNames.includes(i.user.name)) return false
      userNames.push(i.user.name)
      return true
    })

  const avatars = infos.map((info, i) => {
    const pod = { ...info.user, domain: info.user.name }
    return (
      <CollaboratorsConatainer title={info.user.name} key={i}>
        <span>
          <Avatar size={24} pod={pod} style={{ outlineColor: info.user.color }} />
        </span>
      </CollaboratorsConatainer>
    )
  })

  return <>{avatars}</>
}
