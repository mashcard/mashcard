import { appendFormulas, buildVariable, interpret, parse, SuccessParseResult } from '../../grammar/core'
import { Formula } from '../../types'
import { FormulaContext } from '../context'

describe('Context', () => {
  const formulaContext = new FormulaContext({})
  void appendFormulas(formulaContext, [])
  const interpretContext = { ctx: {}, arguments: [] }

  const fooVariableId = '1588aedf-06e1-47f1-9282-d2ffe865974c'
  const fooNamespaceId = 'd986e871-cb85-4bd5-b675-87307f60b882'

  const barVariableId = '475d9e73-e52a-42b3-8a95-477596812900'
  const barNamespaceId = '615d7f74-dc97-4aae-8690-b6cba1072a6a'

  const formulas: Formula[] = [
    {
      name: 'foo',
      id: fooVariableId,
      blockId: fooNamespaceId,
      definition: '=123',
      kind: 'constant',
      dependencyIds: [],
      version: 0,
      level: 0,
      cacheValue: {
        type: 'number',
        result: 123
      },
      view: {}
    },
    {
      name: 'bar',
      id: barVariableId,
      blockId: barNamespaceId,
      dependencyIds: [fooVariableId],
      definition: `=ABS(120) + #${fooNamespaceId}.${fooVariableId}`,
      kind: 'expression',
      version: 0,
      level: 0,
      cacheValue: {
        type: 'number',
        result: 243
      },
      view: {}
    }
  ]

  void appendFormulas(formulaContext, formulas)

  it('reset', async () => {
    const reverseFunctionDependencies = formulaContext.reverseFunctionDependencies
    const reverseVariableDependencies = formulaContext.reverseVariableDependencies

    expect(Object.keys(formulaContext.context)).toMatchSnapshot()
    expect(reverseFunctionDependencies).toMatchSnapshot()
    expect(reverseVariableDependencies).toMatchSnapshot()
    expect(formulaContext.variableCount()).toEqual(2)

    formulaContext.resetFormula()

    expect(formulaContext.reverseFunctionDependencies).toEqual({})
    expect(formulaContext.reverseVariableDependencies).toEqual({})

    await appendFormulas(formulaContext, formulas)

    expect(formulaContext.reverseFunctionDependencies).toEqual(reverseFunctionDependencies)
    expect(formulaContext.reverseVariableDependencies).toEqual(reverseVariableDependencies)
  })

  it('findVariable', () => {
    const foo = formulaContext.findVariable(fooNamespaceId, fooVariableId)!
    const bar = formulaContext.findVariable(barNamespaceId, barVariableId)!

    expect({ foo: [foo.t.functionDependencies, foo.t.variableDependencies] }).toMatchSnapshot()
    expect({ bar: [bar.t.functionDependencies, bar.t.variableDependencies] }).toMatchSnapshot()
  })

  it('removeVariable', async () => {
    await formulaContext.removeVariable(barNamespaceId, barVariableId)
    expect(Object.keys(formulaContext.context)).toMatchSnapshot()
    expect(formulaContext.reverseFunctionDependencies).toMatchSnapshot()
    expect(formulaContext.reverseVariableDependencies).toMatchSnapshot()

    formulaContext.resetFormula()
    await appendFormulas(formulaContext, formulas)
  })

  it('unique name check', () => {
    const newFooVariableId = '7fb702f9-8216-47de-a574-e6b8eede5bf5'
    const name = 'foo'
    const input = '=123'
    const meta = { namespaceId: fooNamespaceId, variableId: newFooVariableId, name, input }
    const parseResult = parse({ ctx: { formulaContext, meta, interpretContext } })
    expect(parseResult.errorMessages).toEqual([{ message: 'Name exist in same namespace', type: 'name_unique' }])
  })

  it('reserved name check', () => {
    const newFooVariableId = '7fb702f9-8216-47de-a574-e6b8eede5bf5'
    const name = 'if'
    const input = '=123'
    const meta = { namespaceId: fooNamespaceId, variableId: newFooVariableId, name, input }
    const parseResult = parse({ ctx: { formulaContext, meta, interpretContext } })
    expect(parseResult.errorMessages).toEqual([{ message: 'Variable name is reserved', type: 'name_check' }])
  })

  it('if', () => {
    const input = `=IF((#${fooNamespaceId}.${fooVariableId}), 1, 2)`
    const name = 'ifname'
    const namespaceId = '37198be0-d10d-42dc-ae8b-20d45a95401b'
    const variableId = 'b4289606-2a52-48e3-a50f-77ee321dd84e'
    const meta = { namespaceId, variableId, name, input }
    const parseResult = parse({ ctx: { formulaContext, meta, interpretContext } })

    expect(parseResult.errorMessages).toEqual([{ message: 'Expected boolean but got number', type: 'type' }])

    const parseResult2 = parse({
      ctx: {
        formulaContext,
        meta: { ...meta, input: `=IF((#${fooNamespaceId}.${fooVariableId} = 3), 1, 2)` },
        interpretContext
      }
    })
    expect(parseResult2.errorMessages).toEqual([])
  })

  it('commitVariable normal', async () => {
    const namespaceId = '37198be0-d10d-42dc-ae8b-20d45a95401b'
    const variableId = 'b4289606-2a52-48e3-a50f-77ee321dd84e'
    const name = 'baz'
    const input = `=#${fooNamespaceId}.${fooVariableId} + #${barNamespaceId}.${barVariableId}`
    const meta = { namespaceId, variableId, name, input }
    const view = {}
    const parseInput = { ctx: { formulaContext, meta, interpretContext } }
    const parseResult = parse(parseInput) as SuccessParseResult

    expect(parseResult.success).toEqual(true)

    const interpretResult = await interpret({
      cst: parseResult.cst,
      ctx: {
        formulaContext,
        meta,
        interpretContext: { ctx: {}, arguments: [] }
      }
    })

    expect(interpretResult.variableValue.success).toEqual(true)

    const variable = buildVariable({ formulaContext, meta, parseResult, interpretResult, view })

    await formulaContext.commitVariable({ variable })

    expect(formulaContext.variableCount()).toEqual(3)

    const v = variable.t

    expect(v.variableValue.result.result).toEqual(366)

    expect({ ...v, variableValue: { ...v.variableValue, updatedAt: null } }).toMatchSnapshot()
    expect(formulaContext.reverseFunctionDependencies).toMatchSnapshot()
    expect(formulaContext.reverseVariableDependencies).toMatchSnapshot()

    // Update
    variable.t.name = 'bazNew'
    void formulaContext.commitVariable({ variable })

    expect(formulaContext.variableCount()).toEqual(3)

    formulaContext.resetFormula()
    void appendFormulas(formulaContext, formulas)
  })
})
