import { TestCaseInterface, DEFAULT_FIRST_NAMESPACEID } from '../testType'

const pageId = '22222222-2222-2222-2222-222222222222'

const num0Id = '44444444-4444-5555-0000-222222222222'
const num1Id = '44444444-4444-5555-1111-222222222222'
const num2Id = '44444444-4444-5555-2222-222222222222'
const num3Id = '44444444-4444-5555-3333-222222222222'
const num4Id = '44444444-4444-5555-4444-222222222222'
const num5Id = '44444444-4444-5555-5555-222222222222'

const blockReplacements = [`#${pageId}`, 'Variable', '"Variable"']

export const VariableTestCase: TestCaseInterface = {
  name: 'variable',
  testCases: {
    pages: [
      {
        pageName: 'Variable',
        pageId,
        variables: [
          { variableName: 'num0', definition: '=0', variableId: num0Id },
          { variableName: 'num1', definition: '=0', variableId: num1Id },
          { variableName: 'num2', definition: '=num1', variableId: num2Id },
          { variableName: 'num3', definition: '=num1+num0', variableId: num3Id },
          { variableName: 'num4', definition: '=num3+num2', variableId: num4Id },
          { variableName: 'num5', definition: '=num4+num0', variableId: num5Id }
        ]
      }
    ],
    successTestCases: [
      {
        definition: '=num1',
        namespaceId: pageId,
        result: 0,
        expected: [
          {
            key: 'codeFragments',
            matchType: 'toMatchObject',
            match: [
              { code: 'Equal' },
              { code: 'Variable', display: 'num1', namespaceId: pageId, type: 'number', attrs: { kind: 'Variable' } }
            ]
          },
          { key: 'blockDependencies', match: [] },
          { key: 'variableDependencies', match: [{ namespaceId: pageId, variableId: num1Id }] },
          { key: 'flattenVariableDependencies', match: [{ namespaceId: pageId, variableId: num1Id }] },
          { key: 'nameDependencies', match: [] }
        ]
      },
      {
        definition: '="num1"',
        namespaceId: pageId,
        result: 'num1'
      },
      {
        definition: `=#${pageId}.num1  `,
        newAbbrevInput: '=Variable.num1  ',
        result: 0,
        expected: [
          {
            key: 'codeFragments',
            matchType: 'toMatchObject',
            match: [
              { code: 'Equal' },
              {
                code: 'Block',
                display: 'Variable',
                type: 'Block',
                attrs: { kind: 'Block' },
                replacements: blockReplacements,
                namespaceId: pageId
              },
              { code: 'Dot' },
              { code: 'Variable', display: 'num1', type: 'number', attrs: { kind: 'Variable' }, namespaceId: pageId },
              { code: 'Space' }
            ]
          },
          { key: 'blockDependencies', match: [pageId] },
          { key: 'nameDependencies', match: [] }
        ]
      },
      {
        definition: '=  Variable.NUM1  ',
        newAbbrevInput: '=  Variable.num1  ',
        result: 0,
        label: 'Case insensitive',
        expected: [
          {
            key: 'codeFragments',
            matchType: 'toMatchObject',
            match: [
              { code: 'Equal' },
              { code: 'Space' },
              {
                code: 'Block',
                display: 'Variable',
                type: 'Block',
                attrs: { kind: 'Block' },
                replacements: blockReplacements,
                namespaceId: pageId
              },
              { code: 'Dot' },
              { code: 'Variable', display: 'num1', type: 'number', attrs: { kind: 'Variable' }, namespaceId: pageId },
              { code: 'Space' }
            ]
          },
          { key: 'blockDependencies', match: [pageId] },
          { key: 'nameDependencies', match: [] }
        ]
      },
      {
        definition: '=#CurrentBlock.num1',
        result: 0,
        namespaceId: pageId,
        expected: [
          {
            key: 'codeFragments',
            matchType: 'toMatchObject',
            match: [
              { code: 'Equal' },
              {
                code: 'Block',
                display: '#CurrentBlock',
                type: 'Block',
                attrs: { kind: 'Block' },
                replacements: blockReplacements,
                namespaceId: pageId
              },
              { code: 'Dot' },
              { code: 'Variable', display: 'num1', type: 'number', attrs: { kind: 'Variable' }, namespaceId: pageId }
            ]
          },
          { key: 'blockDependencies', match: [pageId] },
          { key: 'nameDependencies', match: [] }
        ]
      },
      {
        definition: '=Variable.num1',
        result: 0,
        expected: [
          { key: 'blockDependencies', match: [pageId] },
          { key: 'nameDependencies', match: [] }
        ]
      },
      {
        definition: '=Variable.num1+Variable.num0',
        result: 0,
        expected: [
          { key: 'blockDependencies', match: [pageId] },
          { key: 'nameDependencies', match: [] }
        ]
      },
      {
        definition: '=num1 + num0',
        result: 0,
        namespaceId: pageId,
        expected: [
          { key: 'blockDependencies', match: [] },
          { key: 'nameDependencies', match: [] }
        ]
      },
      {
        definition: '=Variable.num3 + num1',
        namespaceId: pageId,
        result: 0,
        expected: [
          { key: 'blockDependencies', match: [pageId] },
          {
            key: 'variableDependencies',
            match: [
              { namespaceId: pageId, variableId: num3Id },
              { namespaceId: pageId, variableId: num1Id }
            ]
          },
          { key: 'nameDependencies', match: [] }
        ]
      },
      {
        definition: '=num4 + num5 + num0',
        namespaceId: pageId,
        result: 0,
        expected: [
          {
            key: 'variableDependencies',
            match: [num4Id, num5Id, num0Id].map(id => ({ namespaceId: pageId, variableId: id }))
          },
          {
            key: 'flattenVariableDependencies',
            match: [num1Id, num0Id, num3Id, num2Id, num4Id, num5Id].map(id => ({ namespaceId: pageId, variableId: id }))
          }
        ]
      }
    ],
    errorTestCases: [
      {
        definition: `=Variable.baz`,
        errorType: 'deps',
        errorMessage: '"baz" not found',
        expected: [
          {
            key: 'codeFragments',
            matchType: 'toMatchObject',
            match: [
              { code: 'Equal' },
              {
                code: 'Block',
                display: 'Variable',
                type: 'Block',
                attrs: { kind: 'Block' },
                replacements: blockReplacements,
                namespaceId: pageId
              },
              { code: 'Dot' },
              {
                code: 'FunctionName',
                display: 'baz',
                errors: [{ type: 'deps', message: '"baz" not found' }],
                namespaceId: pageId,
                type: 'string'
              }
            ]
          },
          { key: 'nameDependencies', match: [{ name: 'baz', namespaceId: pageId }] },
          { key: 'blockDependencies', match: [pageId] }
        ]
      },
      {
        definition: `=#CurrentBlock.baz`,
        errorType: 'deps',
        errorMessage: '"baz" not found',
        expected: [
          {
            key: 'codeFragments',
            matchType: 'toMatchObject',
            match: [
              { code: 'Equal' },
              {
                code: 'Block',
                display: '#CurrentBlock',
                type: 'Block',
                attrs: { kind: 'Block' },
                replacements: [`#${DEFAULT_FIRST_NAMESPACEID}`, 'Default', '"Default"'],
                namespaceId: DEFAULT_FIRST_NAMESPACEID
              },
              { code: 'Dot' },
              {
                code: 'FunctionName',
                display: 'baz',
                errors: [{ type: 'deps', message: '"baz" not found' }],
                namespaceId: DEFAULT_FIRST_NAMESPACEID,
                type: 'string'
              }
            ]
          },
          { key: 'nameDependencies', match: [{ name: 'baz', namespaceId: DEFAULT_FIRST_NAMESPACEID }] },
          { key: 'blockDependencies', match: [DEFAULT_FIRST_NAMESPACEID] }
        ]
      },
      {
        definition: `=baz`,
        errorType: 'syntax',
        errorMessage: '"baz" not found',
        expected: [
          {
            key: 'codeFragments',
            matchType: 'toMatchObject',
            match: [
              { code: 'Equal' },
              {
                code: 'FunctionName',
                display: 'baz',
                errors: [{ type: 'syntax', message: '"baz" not found' }],
                type: 'any'
              }
            ]
          },
          { key: 'nameDependencies', match: [{ name: 'baz', namespaceId: DEFAULT_FIRST_NAMESPACEID }] },
          { key: 'blockDependencies', match: [] }
        ]
      },
      {
        definition: '=fo',
        namespaceId: pageId,
        errorType: 'syntax',
        errorMessage: '"fo" not found',
        expected: [
          {
            key: 'codeFragments',
            matchType: 'toMatchObject',
            match: [
              { code: 'Equal' },
              {
                code: 'FunctionName',
                display: 'fo',
                errors: [{ type: 'syntax', message: '"fo" not found' }],
                type: 'any'
              }
            ]
          },
          { key: 'blockDependencies', match: [] },
          { key: 'nameDependencies', match: [{ name: 'fo', namespaceId: pageId }] }
        ]
      },
      {
        definition: '=num5',
        namespaceId: pageId,
        variableId: num0Id,
        name: 'num0',
        errorType: 'circular_dependency',
        groupOptions: [{ name: 'basicError' }],
        errorMessage: 'errors.parse.circular_dependency.variable'
      },
      {
        definition: '=num4',
        namespaceId: pageId,
        variableId: num0Id,
        name: 'num0',
        errorType: 'circular_dependency',
        errorMessage: 'errors.parse.circular_dependency.variable'
      },
      {
        definition: '=IF(false, 1, num4)',
        namespaceId: pageId,
        variableId: num0Id,
        name: 'num0',
        errorType: 'circular_dependency',
        errorMessage: 'errors.parse.circular_dependency.variable'
      }
    ]
  }
}
