import type { IToken } from 'chevrotain'
import type {
  CodeFragment,
  Completion,
  ContextInterface,
  FormulaType,
  NamespaceId,
  SpreadsheetCodeFragment,
  VariableId
} from '..'

export interface CompleteInput {
  readonly tokens: IToken[]
  readonly input: string
  readonly formulaContext?: ContextInterface
  readonly codeFragments: CodeFragment[]
  readonly namespaceId: NamespaceId
  readonly variableId: VariableId
  readonly cacheCompletions?: Completion[]
}

const matchTypeWeight = (type1: FormulaType, type2: FormulaType, weight: number): number => {
  if (type1 === type2) return weight + 250
  if (type2 === 'any') return weight + 125

  return weight
}

// TODO: https://github.com/Chevrotain/chevrotain/blob/master/examples/parser/content_assist/content_assist_complex.js
export const complete = ({
  input,
  tokens,
  formulaContext,
  namespaceId,
  codeFragments,
  variableId,
  cacheCompletions
}: CompleteInput): Completion[] => {
  let completions = cacheCompletions ?? formulaContext?.completions(namespaceId, variableId) ?? []
  const lastCodeFragment = codeFragments[codeFragments.length - 1]
  const lastToken = tokens[tokens.length - 1]
  // const lastToken = tokens[tokens.length - 1]
  if (!lastCodeFragment || !lastToken) {
    return completions
  }
  const { code, name } = lastCodeFragment
  const lowerCaseName = name.toLowerCase()
  const lastTokenText = lastToken.image

  // console.log({ name, code, input })
  // console.log({ name, code, input, lastCodeFragment, tokens, codeFragments, completions })

  if (code === 'Dot') {
    const last2CodeFragment = codeFragments[codeFragments.length - 2]
    if (last2CodeFragment) {
      completions = completions.map(c => {
        return c.kind === 'function' && c.preview.chain
          ? { ...c, weight: matchTypeWeight(last2CodeFragment.type, c.preview.args[0].type, c.weight) }
          : c
      })

      if (last2CodeFragment.code === 'Spreadsheet') {
        completions = completions.map(c => {
          return c.kind === 'column' &&
            c.preview.namespaceId === (last2CodeFragment as SpreadsheetCodeFragment).meta.blockId
            ? { ...c, weight: c.weight + 1000 }
            : c
        })
      }
    }
  }

  if (['GreaterThan', 'GreaterThanEqual', 'LessThan', 'LessThanEqual'].includes(code)) {
    completions = completions.map(c => {
      return c.kind === 'variable' && c.preview.variableValue.result.type === 'number'
        ? { ...c, weight: c.weight + 1000 }
        : c
    })
  }

  if (['other', 'NumberLiteral'].includes(code)) {
    completions = completions.map(c => {
      if (c.name === name) {
        return { ...c, weight: c.weight + 1000, replace: c.replace.concat(name) }
      }

      const cname = c.name.toLowerCase()
      if (cname === lowerCaseName) {
        return { ...c, weight: c.weight + 500, replace: c.replace.concat(name) }
      }

      if (cname.startsWith(lowerCaseName)) {
        return { ...c, weight: c.weight + 100, replace: c.replace.concat(name) }
      }

      if (cname.includes(lowerCaseName)) {
        return { ...c, weight: c.weight + 10, replace: c.replace.concat(name) }
      }

      if (c.name === lastTokenText) {
        return { ...c, weight: c.weight + 1000, replace: c.replace.concat(lastTokenText) }
      }

      if (cname === lastTokenText) {
        return { ...c, weight: c.weight + 500, replace: c.replace.concat(lastTokenText) }
      }

      if (cname.startsWith(lastTokenText)) {
        return { ...c, weight: c.weight + 100, replace: c.replace.concat(lastTokenText) }
      }

      if (cname.includes(lastTokenText)) {
        return { ...c, weight: c.weight + 10, replace: c.replace.concat(lastTokenText) }
      }

      return c
    })
  }

  return completions.sort((a, b) => b.weight - a.weight)
}
