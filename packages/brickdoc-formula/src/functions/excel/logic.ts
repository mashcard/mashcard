import { ContextInterface, FunctionClause } from '../..'

export const IF = (ctx: ContextInterface, condition: boolean, ifTrue: any, ifFalse: any): any => (condition ? ifTrue : ifFalse)

export const TRUE = (ctx: ContextInterface): boolean => true

export const FALSE = (ctx: ContextInterface): boolean => false

export const AND = (ctx: ContextInterface, ...conditions: boolean[]): boolean =>
  conditions.reduce((acc, condition) => acc && condition, true)

export const OR = (ctx: ContextInterface, ...conditions: boolean[]): boolean =>
  conditions.reduce((acc, condition) => acc || condition, false)

export const NOT = (ctx: ContextInterface, term: boolean): boolean => !term

export const EXCEL_LOGIC_CLAUSES: FunctionClause[] = [
  {
    name: 'IF',
    async: false,
    pure: true,
    effect: false,
    description: 'Returns the first argument if the condition is true, otherwise the second argument.',
    group: 'excel',
    args: [
      {
        name: 'condition',
        type: 'boolean'
      },
      {
        name: 'ifTrue',
        type: 'any'
      },
      {
        name: 'ifFalse',
        type: 'any'
      }
    ],
    returns: 'any',
    examples: [{ input: [true, 'yes', 'no'], output: 'yes' }],
    chain: false,
    reference: IF
  },
  {
    name: 'TRUE',
    async: false,
    pure: true,
    effect: false,
    description: 'Returns true.',
    group: 'excel',
    args: [],
    returns: 'boolean',
    examples: [{ input: [], output: true }],
    chain: false,
    reference: TRUE
  },
  {
    name: 'FALSE',
    async: false,
    pure: true,
    effect: false,
    description: 'Returns false.',
    group: 'excel',
    args: [],
    returns: 'boolean',
    examples: [{ input: [], output: false }],
    chain: false,
    reference: FALSE
  },
  {
    name: 'NOT',
    async: false,
    pure: true,
    effect: false,
    description: 'Returns the opposite of the argument.',
    group: 'excel',
    args: [
      {
        name: 'term',
        type: 'boolean'
      }
    ],
    returns: 'boolean',
    examples: [{ input: [true], output: false }],
    chain: false,
    reference: NOT
  },
  {
    name: 'AND',
    async: false,
    pure: true,
    effect: false,
    description: 'Returns true if all the arguments are true.',
    group: 'excel',
    args: [
      {
        name: 'conditions',
        type: 'boolean',
        spread: true
      }
    ],
    returns: 'boolean',
    examples: [{ input: [true, true, true], output: true }],
    chain: false,
    reference: AND
  },
  {
    name: 'OR',
    async: false,
    pure: true,
    effect: false,
    description: 'Returns true if any of the arguments are true.',
    group: 'excel',
    args: [
      {
        name: 'conditions',
        type: 'boolean',
        spread: true
      }
    ],
    returns: 'boolean',
    examples: [{ input: [true, false, true], output: true }],
    chain: false,
    reference: OR
  }
]