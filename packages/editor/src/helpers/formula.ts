import { CodeFragment } from '@mashcard/formula'
import { JSONContent } from '@tiptap/core'

const maybeRemoveDefinitionEqual = (definition: string | undefined, formulaIsNormal: boolean): string => {
  if (!definition) return ''
  if (!formulaIsNormal) return definition

  if (definition.startsWith('=')) {
    return definition.substring(1)
  }

  return definition
}

const maybeRemoveCodeFragmentsEqual = (codeFragments: CodeFragment[], formulaIsNormal: boolean): CodeFragment[] => {
  if (!codeFragments.length) return []
  if (!formulaIsNormal) return codeFragments

  const firstCodeFragment = codeFragments[0]

  if (firstCodeFragment.code === 'Equal') {
    // HACK: parse `===`
    const secondCodeFragment = codeFragments[1]
    if (secondCodeFragment && secondCodeFragment.code === 'Equal2' && firstCodeFragment.display === '') {
      return [{ ...secondCodeFragment, display: '=' }, ...codeFragments.slice(2)]
    }
    return codeFragments.slice(1)
  }

  return codeFragments
}

export const buildJSONContentByArray = (content: JSONContent[]): JSONContent => {
  return { type: 'doc', content: [{ type: 'paragraph', content }] }
}

const attrsToJSONContent = (attrs: CodeFragment): JSONContent => {
  return { type: 'text', text: attrs.display, marks: [{ type: 'FormulaType', attrs }] }
}

export const content2definition = (content: JSONContent | undefined, formulaIsNormal: boolean): [string] => {
  const contents = content?.content?.[0]?.content ?? []
  const input = contents.map((c: JSONContent) => c.text ?? '').join('') ?? ''
  // console.log('contentArrayToInput', { content, input })
  return [formulaIsNormal ? `=${input}` : input]
}

export const definition2content = (definition: string, formulaIsNormal: boolean): [JSONContent | undefined, string] => {
  const newDefinition = maybeRemoveDefinitionEqual(definition, formulaIsNormal)
  if (!newDefinition) return [undefined, newDefinition]

  return [buildJSONContentByArray([{ type: 'text', text: newDefinition }]), newDefinition]
}

export const codeFragments2content = (
  codeFragments: CodeFragment[] | undefined,
  formulaIsNormal: boolean
): [JSONContent | undefined, CodeFragment[]] => {
  if (!codeFragments) return [undefined, []]
  const newCodeFragments = maybeRemoveCodeFragmentsEqual(codeFragments, formulaIsNormal)
  if (newCodeFragments.length === 0) return [undefined, []]

  const contents = newCodeFragments.map<JSONContent>(codeFragment => attrsToJSONContent(codeFragment))
  return [buildJSONContentByArray(contents), newCodeFragments]
}