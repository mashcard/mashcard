import { createFunctionClause, FORMULA_USED_TYPES } from '../../type'

/**
 * @source
 */
export const logicIf = createFunctionClause({
  name: 'IF',
  async: false,
  pure: true,
  persist: false,
  lazy: false,
  acceptError: false,
  effect: false,
  description: 'Returns the first argument if the condition is true, otherwise the second argument.',
  group: 'core',
  chain: false,
  args: [
    { name: 'condition', type: 'boolean' },
    { name: 'ifTrue', type: [...FORMULA_USED_TYPES] },
    { name: 'ifFalse', type: [...FORMULA_USED_TYPES] }
  ],
  examples: [{ input: '=IF(true, "123", "456")', output: { type: 'string', result: '123' } }],
  returns: FORMULA_USED_TYPES,
  testCases: [
    { input: [true, 1, 2], output: { type: 'number', result: 1 } },
    { input: [true, '2', 2], output: { type: 'string', result: '2' } },
    { input: [false, '1', false], output: { type: 'boolean', result: false } }
  ],
  reference: (ctx, condition, ifTrue, ifFalse) => (condition.result ? ifTrue : ifFalse)
})
