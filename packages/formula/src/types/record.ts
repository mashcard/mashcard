import { extractSubType } from '../grammar'
import { AnyTypeResult, BaseResult, FormulaType, FormulaTypeAttributes } from '../type'
import { mapValues } from 'lodash'

const TypeName = 'Record' as const
const ShortName = 'record' as const

export type FormulaRecordType = BaseResult<
  typeof TypeName,
  { [key: string]: AnyTypeResult },
  Record<string, any>,
  FormulaType
>

export const FormulaRecordAttributes: FormulaTypeAttributes<typeof TypeName, typeof ShortName> = {
  type: TypeName,
  shortName: ShortName,
  dump: ({ result, meta, ...rest }, f) => ({ ...rest, result: mapValues(result, a => f(a)) }),
  cast: ({ result, ...rest }, ctx, f) => {
    const record = mapValues(result, a => f(a, ctx))
    return { ...rest, result: record, meta: extractSubType(Object.values(record)) }
  },
  display: ({ result, meta, ...rest }, ctx, f) => {
    const recordArray = Object.entries(result).map(([key, value]) => `${key}: ${f(value, ctx).result}`)
    const recordResult = recordArray.join(', ')
    return { ...rest, result: `{${recordResult}}` }
  }
}
