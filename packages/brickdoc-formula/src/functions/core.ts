import { FunctionContext, BaseFunctionClause, ErrorResult, ReferenceResult, FunctionResult, CstResult } from '../types'

export const Set = (ctx: FunctionContext, ref: ReferenceResult, cst: CstResult): FunctionResult | ErrorResult => {
  // TODO check ref as constant
  const reference = ref.result
  if (reference.kind === 'variable') {
    const variable = ctx.formulaContext.findVariableById(reference.namespaceId, reference.variableId)
    if (!variable) {
      return { type: 'Error', errorKind: 'runtime', result: 'Variable not found' }
    }
    if (variable.t.kind === 'expression') {
      return {
        type: 'Error',
        errorKind: 'runtime',
        result: 'Only constant variable is supported'
      }
    }
  }
  return { type: 'Function', result: [{ name: 'Set', args: [ref, cst] }] }
}

export const CORE_CORE_CLAUSES: Array<BaseFunctionClause<'Function'>> = [
  {
    name: 'Set',
    async: false,
    pure: false,
    lazy: true,
    persist: false,
    acceptError: false,
    effect: false,
    examples: [{ input: '=Set(A, A+1)', output: null }],
    description: 'Set variable',
    group: 'core',
    args: [
      {
        name: 'name',
        type: 'Reference'
      },
      {
        name: 'body',
        type: 'Cst'
      }
    ],
    testCases: [],
    returns: 'Function',
    chain: false,
    reference: Set
  }
]
