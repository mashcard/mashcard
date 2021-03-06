import { DEFAULT_FIRST_NAMESPACEID } from '../../tests/testType'
import { mockBlock } from '../../tests/testMock'
import { OperatorType } from '../operator'

const pageId = '11111111-1111-1111-1111-111111111111'
const page2Id = '44444444-4444-aaaa-0000-111111111111'

export const blockOperator: OperatorType = {
  name: 'block',
  expressionType: 'Block',
  dynamicParseType: lhsType => lhsType,
  lhsType: 'any',
  rhsType: 'any',
  dynamicInterpretLhs: async ({ operators, interpreter }) => {
    const op = operators?.[0]
    if (!op) throw new Error('unsupported expression')
    const namespaceId = op.tokenType.name === 'CurrentBlock' ? interpreter.ctx.meta.namespaceId : op.image
    const block = interpreter.ctx.formulaContext.findBlockById(namespaceId)
    if (block) return { type: 'Block', result: block }

    return { type: 'Error', result: { message: `Block ${namespaceId} not found`, type: 'runtime' } }
  },
  interpret: async ({ lhs }) => lhs,
  testCases: {
    pages: [
      { pageName: 'Block', pageId },
      { pageName: '1 Block With Space', pageId: page2Id }
    ],
    successTestCases: [
      {
        definition: '=Block',
        result: mockBlock('Block', pageId),
        expected: [
          {
            key: 'codeFragments',
            matchType: 'toMatchObject',
            match: [
              { code: 'Equal' },
              { code: 'Block', type: 'Block', display: 'Block', attrs: { kind: 'Block' }, namespaceId: pageId }
            ]
          },
          { key: 'nameDependencies', match: [] },
          { key: 'blockDependencies', match: [pageId] }
        ]
      },
      {
        definition: '=  "Block" ',
        newAbbrevInput: '=  Block ',
        result: mockBlock('Block', pageId),
        expected: [
          {
            key: 'codeFragments',
            matchType: 'toMatchObject',
            match: [
              { code: 'Equal' },
              { code: 'Space' },
              { code: 'Block', type: 'Block', display: 'Block', attrs: { kind: 'Block' }, namespaceId: pageId },
              { code: 'Space' }
            ]
          },
          { key: 'nameDependencies', match: [] },
          { key: 'blockDependencies', match: [pageId] }
        ]
      },
      {
        definition: '=  "1 Block With Space" ',
        result: mockBlock('1 Block With Space', page2Id),
        expected: [
          {
            key: 'codeFragments',
            matchType: 'toMatchObject',
            match: [
              { code: 'Equal' },
              { code: 'Space' },
              {
                code: 'Block',
                type: 'Block',
                display: '"1 Block With Space"',
                attrs: { kind: 'Block' },
                namespaceId: page2Id
              },
              { code: 'Space' }
            ]
          },
          { key: 'nameDependencies', match: [] },
          { key: 'blockDependencies', match: [page2Id] }
        ]
      },
      {
        definition: '=#CurrentBlock',
        result: mockBlock('Block', pageId),
        namespaceId: pageId,
        expected: [
          {
            key: 'codeFragments',
            matchType: 'toMatchObject',
            match: [
              { code: 'Equal' },
              { code: 'Block', type: 'Block', display: '#CurrentBlock', attrs: { kind: 'Block' }, namespaceId: pageId }
            ]
          },
          { key: 'nameDependencies', match: [] },
          { key: 'blockDependencies', match: [pageId] }
        ]
      },
      {
        definition: `=   #${pageId}  `,
        newAbbrevInput: '=   Block  ',
        result: mockBlock('Block', pageId),
        expected: [
          {
            key: 'codeFragments',
            matchType: 'toMatchObject',
            match: [
              { code: 'Equal' },
              { code: 'Space' },
              { code: 'Block', type: 'Block', display: 'Block', attrs: { kind: 'Block' }, namespaceId: pageId },
              { code: 'Space' }
            ]
          },
          { key: 'nameDependencies', match: [] },
          { key: 'blockDependencies', match: [pageId] }
        ]
      },
      {
        definition: '=#CurrentBlock',
        result: mockBlock('1 Block With Space', page2Id),
        namespaceId: page2Id,
        expected: [
          {
            key: 'codeFragments',
            matchType: 'toMatchObject',
            match: [
              { code: 'Equal' },
              {
                code: 'Block',
                type: 'Block',
                display: '#CurrentBlock',
                attrs: { kind: 'Block' },
                namespaceId: page2Id
              }
            ]
          },
          { key: 'nameDependencies', match: [] },
          { key: 'blockDependencies', match: [page2Id] }
        ]
      },
      {
        definition: `=  #${page2Id}  `,
        newAbbrevInput: '=  "1 Block With Space"  ',
        result: mockBlock('1 Block With Space', page2Id),
        expected: [
          {
            key: 'codeFragments',
            matchType: 'toMatchObject',
            match: [
              { code: 'Equal' },
              { code: 'Space' },
              {
                code: 'Block',
                type: 'Block',
                display: '"1 Block With Space"',
                attrs: { kind: 'Block' },
                namespaceId: page2Id
              },
              { code: 'Space' }
            ]
          },
          { key: 'nameDependencies', match: [] },
          { key: 'blockDependencies', match: [page2Id] }
        ]
      }
    ],
    errorTestCases: [
      {
        definition: `=#`,
        errorType: 'syntax',
        errorMessage: 'errors.parse.missing.expression',
        groupOptions: [{ name: 'basicError' }]
      },
      {
        definition: '=UnknownBlock',
        errorType: 'syntax',
        errorMessage: '"UnknownBlock" not found',
        expected: [
          { key: 'nameDependencies', match: [{ namespaceId: DEFAULT_FIRST_NAMESPACEID, name: 'UnknownBlock' }] }
        ]
      }
    ]
  }
}
