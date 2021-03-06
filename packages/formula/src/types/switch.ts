import { SwitchType } from '../controls'
import { BaseResult, FormulaTypeAttributes } from '../type'

const TypeName = 'Switch' as const
const ShortName = 'switch' as const

export type FormulaSwitchType = BaseResult<typeof TypeName, SwitchType>

export const FormulaSwitchAttributes: FormulaTypeAttributes<typeof TypeName, typeof ShortName> = {
  type: TypeName,
  shortName: ShortName,
  dump: rest => ({ ...rest, result: 'other.not_supported' }),
  cast: rest => ({ ...rest, result: { message: 'other.not_supported', type: 'runtime' }, type: 'Error' }),
  display: rest => ({ ...rest, result: '#<Switch>' })
}
