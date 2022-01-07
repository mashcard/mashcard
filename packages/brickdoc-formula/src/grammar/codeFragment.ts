import { CstNode, IToken } from 'chevrotain'
import {
  CodeFragment,
  ErrorMessage,
  FormulaType,
  Argument,
  VariableKind,
  VariableDependency,
  FunctionClause,
  OtherCodeFragment,
  CodeFragmentResult,
  FormulaCheckType,
  NamespaceId,
  FunctionContext,
  ExpressionType
} from '../types'
import { renderBlock, renderColumn, renderSpreadsheet, renderVariable } from '../context/util'
import { buildFunctionKey } from '../functions'
import { BaseCstVisitor } from './parser'
import { intersectType } from './util'
import { BlockClass } from '../controls/block'

const SpaceBeforeTypes = [
  'In',
  'ExactIn',
  'Semicolon',
  'RParen',
  'RBracket',
  'RBrace',
  'Plus',
  'Div',
  'Minus',
  'Multi',
  'Caret',
  'And',
  'Or',
  'Equal',
  'NotEqual',
  'Equal2',
  'NotEqual2',
  'LessThanEqual',
  'LessThan',
  'GreaterThan',
  'GreaterThanEqual'
]

const SpaceAfterTypes = [
  'In',
  'ExactIn',
  'Comma',
  'Colon',
  'Semicolon',
  'LParen',
  'LBracket',
  'LBrace',
  'Plus',
  'Div',
  'Minus',
  'Multi',
  'Caret',
  'And',
  'Or',
  'Equal',
  'NotEqual',
  'Equal2',
  'NotEqual2',
  'LessThanEqual',
  'LessThan',
  'GreaterThan',
  'GreaterThanEqual'
]

const token2fragment = (token: IToken, type: FormulaType): OtherCodeFragment => {
  const spaceBefore = SpaceBeforeTypes.includes(token.tokenType.name)
  const spaceAfter = SpaceAfterTypes.includes(token.tokenType.name)
  return { name: token.image, code: token.tokenType.name, errors: [], type, spaceBefore, spaceAfter, render: undefined }
}

interface ExpressionArgument {
  readonly type: ExpressionType
  readonly firstArgumentType?: FormulaType
}

export class CodeFragmentVisitor extends BaseCstVisitor {
  ctx: FunctionContext
  variableDependencies: VariableDependency[] = []
  functionDependencies: Array<FunctionClause<any>> = []
  blockDependencies: NamespaceId[] = []
  flattenVariableDependencies: VariableDependency[] = []
  level: number = 0
  kind: VariableKind = 'constant'

  constructor({ ctx }: { ctx: FunctionContext }) {
    super()
    this.ctx = ctx
    this.validateVisitor()
  }

  startExpression(
    ctx: { expression: CstNode | CstNode[]; Equal: any },
    { type }: ExpressionArgument
  ): CodeFragmentResult {
    // const operator = ctx.Equal[0] as IToken
    // return [token2fragment(operator), ...this.visit(ctx.expression)]
    const { type: newType, codeFragments, image } = this.visit(ctx.expression, { type })
    return { type: newType, codeFragments, image: `${ctx.Equal[0].image}${image}` }
  }

  expression(
    ctx: {
      rhs: Array<CstNode | CstNode[]>
      lhs: CstNode | CstNode[]
      Equal: Array<{ image: any }>
      Semicolon: { [x: string]: IToken }
    },
    { type }: ExpressionArgument
  ): CodeFragmentResult {
    if (!ctx.rhs) {
      const { type: newType, codeFragments, image } = this.visit(ctx.lhs, { type })
      return { type: newType, codeFragments, image }
    }

    const codeFragments: CodeFragment[] = []
    const images: string[] = []
    let parentType: FormulaType
    const childrenType: FormulaType = 'any'

    const {
      codeFragments: lhsCodeFragments,
      image: lhsImage,
      type: firstType
    }: CodeFragmentResult = this.visit(ctx.lhs, {
      type: childrenType
    })
    parentType = firstType
    codeFragments.push(...lhsCodeFragments)
    images.push(lhsImage)

    ctx.rhs.forEach((rhsOperand: CstNode | CstNode[], idx: string | number) => {
      const operator = ctx.Semicolon[idx] as IToken
      const {
        codeFragments: rhsValue,
        image: rhsImage,
        type: newType
      }: CodeFragmentResult = this.visit(rhsOperand, {
        type: childrenType
      })

      const errorMessages: ErrorMessage[] = rhsImage ? [] : [{ type: 'syntax', message: 'Missing expression' }]

      codeFragments.push({ ...token2fragment(operator, 'any'), errors: errorMessages }, ...rhsValue)
      parentType = newType
      images.push(operator.image, rhsImage)
    })

    const { errorMessages, newType } = intersectType(type, parentType, 'expression')
    return {
      image: images.join(''),
      codeFragments: codeFragments.map(codeFragment => ({
        ...codeFragment,
        errors: [...errorMessages, ...codeFragment.errors]
      })),
      type: newType
    }
  }

  combineExpression(
    ctx: { rhs: any[]; lhs: CstNode | CstNode[]; CombineOperator: { [x: string]: IToken } },
    { type }: ExpressionArgument
  ): CodeFragmentResult {
    if (!ctx.rhs) {
      return this.visit(ctx.lhs, { type })
    }

    const codeFragments: CodeFragment[] = []
    const images: string[] = []
    const parentType: FormulaType = 'boolean'
    const childrenType: FormulaType = 'boolean'
    const missingTokenErrorMessages: ErrorMessage[] = []

    const { codeFragments: lhsCodeFragments, image: lhsImage }: CodeFragmentResult = this.visit(ctx.lhs, {
      type: childrenType
    })
    codeFragments.push(...lhsCodeFragments)
    images.push(lhsImage)

    ctx.rhs.forEach((rhsOperand: CstNode | CstNode[], idx: string | number) => {
      const operator = ctx.CombineOperator[idx] as IToken
      const { codeFragments: rhsValue, image: rhsImage }: CodeFragmentResult = this.visit(rhsOperand, {
        type: childrenType
      })
      if (!rhsValue.length) {
        missingTokenErrorMessages.push({ message: 'Missing right expression', type: 'syntax' })
      }

      codeFragments.push(token2fragment(operator, parentType), ...rhsValue)
      images.push(operator.image, rhsImage)
    })

    const { errorMessages, newType } = intersectType(type, parentType, 'combineExpression')
    return {
      image: images.join(''),
      codeFragments: codeFragments.map(codeFragment => ({
        ...codeFragment,
        errors: [...errorMessages, ...missingTokenErrorMessages, ...codeFragment.errors]
      })),
      type: newType
    }
  }

  notExpression(ctx: { lhs: any[]; rhs: CstNode | CstNode[] }, { type }: ExpressionArgument): CodeFragmentResult {
    if (!ctx.lhs) {
      return this.visit(ctx.rhs, { type })
    }

    const codeFragments: CodeFragment[] = []
    const images: string[] = []
    const parentType: FormulaType = 'boolean'
    const childrenType: FormulaType = 'any'

    ctx.lhs.forEach((operator: IToken) => {
      codeFragments.push(token2fragment(operator, parentType))
      images.push(operator.image)
    })

    const { errorMessages, newType } = intersectType(type, parentType, 'notExpression')
    const { codeFragments: rhsCodeFragments, image }: CodeFragmentResult = this.visit(ctx.rhs, { type: childrenType })
    images.push(image)

    return {
      image: images.join(''),
      codeFragments: [...codeFragments, ...rhsCodeFragments].map(codeFragment => ({
        ...codeFragment,
        errors: [...errorMessages, ...codeFragment.errors]
      })),
      type: newType
    }
  }

  equalCompareExpression(
    ctx: { rhs: any[]; lhs: CstNode | CstNode[]; EqualCompareOperator: { [x: string]: any } },
    { type }: ExpressionArgument
  ): CodeFragmentResult {
    if (!ctx.rhs) {
      return this.visit(ctx.lhs, { type })
    }

    const codeFragments: CodeFragment[] = []
    const images: string[] = []
    const parentType: FormulaType = 'boolean'
    const childrenType: FormulaType = 'any'
    const missingTokenErrorMessages: ErrorMessage[] = []

    const { codeFragments: lhsCodeFragments, image }: CodeFragmentResult = this.visit(ctx.lhs, { type: childrenType })
    images.push(image)
    codeFragments.push(...lhsCodeFragments)

    ctx.rhs.forEach((rhsOperand: CstNode | CstNode[], idx: string | number) => {
      const { codeFragments: rhsValue, image }: CodeFragmentResult = this.visit(rhsOperand, { type: childrenType })
      const operator = ctx.EqualCompareOperator[idx]

      if (!rhsValue.length) {
        missingTokenErrorMessages.push({ message: 'Missing right expression', type: 'syntax' })
      }

      codeFragments.push(token2fragment(operator, parentType), ...rhsValue)
      images.push(operator.image, image)
    })

    const { errorMessages, newType } = intersectType(type, parentType, 'equalCompareExpression')
    return {
      image: images.join(''),
      codeFragments: codeFragments.map(codeFragment => ({
        ...codeFragment,
        errors: [...errorMessages, ...missingTokenErrorMessages, ...codeFragment.errors]
      })),
      type: newType
    }
  }

  compareExpression(
    ctx: { rhs: any[]; lhs: CstNode | CstNode[]; CompareOperator: { [x: string]: any } },
    { type }: ExpressionArgument
  ): CodeFragmentResult {
    if (!ctx.rhs) {
      return this.visit(ctx.lhs, { type })
    }

    const codeFragments: CodeFragment[] = []
    const images: string[] = []
    const parentType: FormulaType = 'boolean'
    const childrenType: FormulaType = 'number'
    const missingTokenErrorMessages: ErrorMessage[] = []

    const { codeFragments: lhsCodeFragments, image }: CodeFragmentResult = this.visit(ctx.lhs, { type: childrenType })
    codeFragments.push(...lhsCodeFragments)
    images.push(image)

    ctx.rhs.forEach((rhsOperand: CstNode | CstNode[], idx: string | number) => {
      const { codeFragments: rhsValue, image }: CodeFragmentResult = this.visit(rhsOperand, { type: childrenType })
      const operator = ctx.CompareOperator[idx]

      if (!rhsValue.length) {
        missingTokenErrorMessages.push({ message: 'Missing right expression', type: 'syntax' })
      }

      codeFragments.push(token2fragment(operator, parentType), ...rhsValue)
      images.push(operator.image, image)
    })

    const { errorMessages, newType } = intersectType(type, parentType, 'compareExpression')
    return {
      image: images.join(''),
      codeFragments: codeFragments.map(codeFragment => ({
        ...codeFragment,
        errors: [...errorMessages, ...missingTokenErrorMessages, ...codeFragment.errors]
      })),
      type: newType
    }
  }

  inExpression(
    ctx: { rhs: CstNode | CstNode[]; lhs: CstNode | CstNode[]; InOperator: IToken[] },
    { type }: ExpressionArgument
  ): CodeFragmentResult {
    if (!ctx.rhs) {
      return this.visit(ctx.lhs, { type })
    }

    const codeFragments: CodeFragment[] = []
    const images: string[] = []
    const parentType: FormulaType = 'boolean'
    const childrenLhsType: FormulaCheckType = ['string', 'number', 'boolean', 'null']

    const {
      codeFragments: lhsCodeFragments,
      image: lhsImage,
      type: newLhsType
    }: CodeFragmentResult = this.visit(ctx.lhs, {
      type: childrenLhsType
    })
    codeFragments.push(...lhsCodeFragments)
    images.push(lhsImage)

    const childrenRhsType: FormulaCheckType = ['string', 'number'].includes(newLhsType)
      ? ['string', 'Array', 'Spreadsheet', 'Column']
      : ['Array']

    const { codeFragments: rhsCodeFragments, image: rhsImage }: CodeFragmentResult = this.visit(ctx.rhs, {
      type: childrenRhsType
    })

    const inErrorMessages: ErrorMessage[] = rhsCodeFragments.length
      ? []
      : [{ message: 'Missing right expression', type: 'syntax' }]
    codeFragments.push({ ...token2fragment(ctx.InOperator[0], 'any'), errors: inErrorMessages })
    images.push(ctx.InOperator[0].image)

    codeFragments.push(...rhsCodeFragments)
    images.push(rhsImage)

    const { errorMessages, newType } = intersectType(type, parentType, 'inExpression')
    return {
      image: images.join(''),
      codeFragments: codeFragments.map(codeFragment => ({
        ...codeFragment,
        errors: [...errorMessages, ...codeFragment.errors]
      })),
      type: newType
    }
  }

  concatExpression(ctx: { rhs: any[]; lhs: CstNode | CstNode[] }, { type }: ExpressionArgument): CodeFragmentResult {
    if (!ctx.rhs) {
      return this.visit(ctx.lhs, { type })
    }

    const codeFragments: CodeFragment[] = []
    const images: string[] = []
    const parentType: FormulaType = 'string'
    const childrenType: FormulaType = 'string'
    const missingTokenErrorMessages: ErrorMessage[] = []

    const { codeFragments: lhsCodeFragments, image }: CodeFragmentResult = this.visit(ctx.lhs, { type: childrenType })
    codeFragments.push(...lhsCodeFragments)
    images.push(image)

    ctx.rhs.forEach((rhsOperand: CstNode | CstNode[]) => {
      const { codeFragments: rhsValue, image }: CodeFragmentResult = this.visit(rhsOperand, { type: childrenType })

      if (!rhsValue.length) {
        missingTokenErrorMessages.push({ message: 'Missing right expression', type: 'syntax' })
      }

      codeFragments.push(
        {
          name: '&',
          code: 'Ampersand',
          type: 'any',
          errors: [],
          spaceBefore: true,
          spaceAfter: true,
          render: undefined
        },
        ...rhsValue
      )
      images.push('&', image)
    })

    const { errorMessages, newType } = intersectType(type, parentType, 'concatExpression')
    return {
      image: images.join(''),
      codeFragments: codeFragments.map(codeFragment => ({
        ...codeFragment,
        errors: [...errorMessages, ...missingTokenErrorMessages, ...codeFragment.errors]
      })),
      type: newType
    }
  }

  additionExpression(
    ctx: { rhs: any[]; lhs: CstNode | CstNode[]; AdditionOperator: { [x: string]: any } },
    { type }: ExpressionArgument
  ): CodeFragmentResult {
    if (!ctx.rhs) {
      return this.visit(ctx.lhs, { type })
    }

    const codeFragments: CodeFragment[] = []
    const images: string[] = []
    const parentType: FormulaType = 'number'
    const childrenType: FormulaType = 'number'

    const { codeFragments: lhsCodeFragments, image }: CodeFragmentResult = this.visit(ctx.lhs, { type: childrenType })
    codeFragments.push(...lhsCodeFragments)
    images.push(image)

    const missingTokenErrorMessages: ErrorMessage[] = []

    ctx.rhs.forEach((rhsOperand: CstNode | CstNode[], idx: string | number) => {
      const { codeFragments: rhsValue, image }: CodeFragmentResult = this.visit(rhsOperand, { type: childrenType })
      const operator = ctx.AdditionOperator[idx]
      if (!rhsValue.length) {
        missingTokenErrorMessages.push({ message: 'Missing right expression', type: 'syntax' })
      }
      codeFragments.push(token2fragment(operator, parentType), ...rhsValue)
      images.push(operator.image, image)
    })

    const { errorMessages, newType } = intersectType(type, parentType, 'additionExpression')
    return {
      image: images.join(''),
      codeFragments: codeFragments.map(codeFragment => ({
        ...codeFragment,
        errors: [...errorMessages, ...missingTokenErrorMessages, ...codeFragment.errors]
      })),
      type: newType
    }
  }

  multiplicationExpression(
    ctx: { rhs: any[]; lhs: CstNode | CstNode[]; MultiplicationOperator: { [x: string]: any } },
    { type }: ExpressionArgument
  ): CodeFragmentResult {
    if (!ctx.rhs) {
      return this.visit(ctx.lhs, { type })
    }

    const codeFragments: CodeFragment[] = []
    const images: string[] = []
    const parentType: FormulaType = 'number'
    const childrenType: FormulaType = 'number'
    const missingTokenErrorMessages: ErrorMessage[] = []

    const { codeFragments: lhsCodeFragments, image }: CodeFragmentResult = this.visit(ctx.lhs, { type: childrenType })
    codeFragments.push(...lhsCodeFragments)
    images.push(image)

    ctx.rhs.forEach((rhsOperand: CstNode | CstNode[], idx: string | number) => {
      const { codeFragments: rhsValue, image }: CodeFragmentResult = this.visit(rhsOperand, { type: childrenType })
      const operator = ctx.MultiplicationOperator[idx]

      if (!rhsValue.length) {
        missingTokenErrorMessages.push({ message: 'Missing right expression', type: 'syntax' })
      }
      codeFragments.push(token2fragment(operator, parentType), ...rhsValue)
      images.push(operator.image, image)
    })

    const { errorMessages, newType } = intersectType(type, parentType, 'multiplicationExpression')
    return {
      image: images.join(''),
      codeFragments: codeFragments.map(codeFragment => ({
        ...codeFragment,
        errors: [...errorMessages, ...missingTokenErrorMessages, ...codeFragment.errors]
      })),
      type: newType
    }
  }

  chainExpression(
    ctx: { Dot: any; lhs: CstNode | CstNode[]; rhs: any[] },
    { type }: ExpressionArgument
  ): CodeFragmentResult {
    if (!ctx.Dot) {
      return this.visit(ctx.lhs, { type })
    }

    const codeFragments: CodeFragment[] = []
    const images: string[] = []
    const {
      codeFragments: lhsCodeFragments,
      type: lhsType,
      image
    }: CodeFragmentResult = this.visit(ctx.lhs, { type: 'any' })
    codeFragments.push(...lhsCodeFragments)
    images.push(image)

    let firstArgumentType = lhsType

    ctx.Dot.forEach((dotOperand: CstNode | CstNode[], idx: number) => {
      const rhsCst = ctx.rhs?.[idx]
      const missingRhsErrors: ErrorMessage[] = rhsCst ? [] : [{ message: 'Missing expression', type: 'syntax' }]

      codeFragments.push({
        name: '.',
        code: 'Dot',
        type: 'any',
        spaceBefore: false,
        spaceAfter: false,
        render: undefined,
        errors: missingRhsErrors
      })
      images.push('.')

      if (rhsCst) {
        const accessErrorMessages: ErrorMessage[] =
          ['null', 'string', 'boolean', 'number'].includes(firstArgumentType) &&
          type !== 'Reference' &&
          rhsCst.name !== 'FunctionCall'
            ? [{ type: 'syntax', message: 'Access error' }]
            : []

        const args = rhsCst.name === 'FunctionCall' ? { type: 'any', firstArgumentType } : { type: 'string' }

        const { codeFragments: rhsCodeFragments, image: rhsImage }: CodeFragmentResult = this.visit(rhsCst, args)

        firstArgumentType = 'any'
        images.push(rhsImage)
        codeFragments.push(...rhsCodeFragments.map(f => ({ ...f, errors: [...accessErrorMessages, ...f.errors] })))
      }
    })

    const { errorMessages, newType } = intersectType(type, firstArgumentType, 'chainExpression')
    return {
      image: images.join(''),
      codeFragments: codeFragments.map(codeFragment => ({
        ...codeFragment,
        errors: [...errorMessages, ...codeFragment.errors]
      })),
      type: newType
    }
  }

  keyExpression(ctx: any, { type }: ExpressionArgument): CodeFragmentResult {
    if (ctx.FunctionName) {
      return this.FunctionNameExpression(ctx, { type })
    } else if (ctx.StringLiteral) {
      return this.StringLiteralExpression(ctx, { type })
    }

    return { codeFragments: [], type: 'any', image: '' }
  }

  simpleAtomicExpression(
    ctx: {
      parenthesisExpression: CstNode | CstNode[]
      arrayExpression: CstNode | CstNode[]
      recordExpression: CstNode | CstNode[]
      constantExpression: CstNode | CstNode[]
      FunctionCall: CstNode | CstNode[]
      lazyVariableExpression: CstNode | CstNode[]
    },
    { type }: ExpressionArgument
  ): CodeFragmentResult {
    if (ctx.parenthesisExpression) {
      return this.visit(ctx.parenthesisExpression, { type })
    } else if (ctx.arrayExpression) {
      return this.visit(ctx.arrayExpression, { type })
    } else if (ctx.recordExpression) {
      return this.visit(ctx.recordExpression, { type })
    } else if (ctx.constantExpression) {
      return this.visit(ctx.constantExpression, { type })
    } else if (ctx.FunctionCall) {
      return this.visit(ctx.FunctionCall, { type })
    } else if (ctx.lazyVariableExpression) {
      return this.visit(ctx.lazyVariableExpression, { type })
    }

    // console.log('debugAtomic', {ctx, type})
    return { codeFragments: [], type: 'any', image: '' }
  }

  atomicExpression(
    ctx: {
      simpleAtomicExpression: CstNode | CstNode[]
      columnExpression: CstNode | CstNode[]
      referenceExpression: CstNode | CstNode[]
      blockExpression: CstNode | CstNode[]
      predicateExpression: CstNode | CstNode[]
    },
    { type }: ExpressionArgument
  ): CodeFragmentResult {
    if (ctx.simpleAtomicExpression) {
      return this.visit(ctx.simpleAtomicExpression, { type })
    } else if (ctx.columnExpression) {
      return this.visit(ctx.columnExpression, { type })
    } else if (ctx.referenceExpression) {
      return this.visit(ctx.referenceExpression, { type })
    } else if (ctx.blockExpression) {
      return this.visit(ctx.blockExpression, { type })
    } else if (ctx.predicateExpression) {
      return this.visit(ctx.predicateExpression, { type })
    }

    // console.log('debugAtomic', {ctx, type})
    return { codeFragments: [], type: 'any', image: '' }
  }

  referenceExpression(ctx: any, { type }: ExpressionArgument): CodeFragmentResult {
    const codeFragments: CodeFragment[] = []
    const images: string[] = []
    const parentType: FormulaType = 'Reference'
    // console.log('reference', { ctx })
    const token = ctx.Ampersand[0]

    images.push(token.image)
    const ampersandCodeFragment = token2fragment(ctx.Ampersand[0], 'any')
    const ampersandErrors: ErrorMessage[] = ctx.lazyVariableExpression
      ? []
      : [{ type: 'syntax', message: 'Missing variable' }]
    codeFragments.push({ ...ampersandCodeFragment, errors: ampersandErrors })

    if (ctx.lazyVariableExpression) {
      const { codeFragments: VariableCodeFragments, image }: CodeFragmentResult = this.visit(
        ctx.lazyVariableExpression,
        {
          type: 'any'
        }
      )

      codeFragments.push(...VariableCodeFragments)
      images.push(image)
    }

    const { errorMessages, newType } = intersectType(type, parentType, 'referenceExpression')
    return {
      image: images.join(''),
      codeFragments: codeFragments.map(codeFragment => ({
        ...codeFragment,
        errors: [...errorMessages, ...codeFragment.errors]
      })),
      type: newType
    }
  }

  predicateExpression(
    ctx: {
      EqualCompareOperator: IToken[]
      CompareOperator: IToken[]
      columnExpression: CstNode | CstNode[]
      simpleAtomicExpression: CstNode | CstNode[]
    },
    { type }: ExpressionArgument
  ): CodeFragmentResult {
    let token: IToken
    let childrenType: FormulaType
    if (ctx.EqualCompareOperator) {
      token = ctx.EqualCompareOperator[0]
      childrenType = 'any'
    } else {
      token = ctx.CompareOperator[0]
      childrenType = 'number'
    }

    const codeFragments: CodeFragment[] = []
    const images: string[] = []

    if (ctx.columnExpression) {
      const { codeFragments: columnCodeFragments, image: columnImage }: CodeFragmentResult = this.visit(
        ctx.columnExpression,
        {
          type: 'Column'
        }
      )
      codeFragments.push(...columnCodeFragments)
      images.push(columnImage)
    }

    const parentType: FormulaType = 'Predicate'
    const { codeFragments: expressionCodeFragments, image }: CodeFragmentResult = this.visit(
      ctx.simpleAtomicExpression,
      {
        type: childrenType
      }
    )

    codeFragments.push(
      {
        name: token.image,
        code: token.tokenType.name,
        errors: [],
        render: undefined,
        spaceBefore: false,
        spaceAfter: false,
        type: 'any'
      },
      ...expressionCodeFragments
    )
    images.push(token.image, image)

    const { errorMessages, newType } = intersectType(type, parentType, 'predicateExpression')
    return {
      image: images.join(''),
      codeFragments: codeFragments.map(codeFragment => ({
        ...codeFragment,
        errors: [...errorMessages, ...codeFragment.errors]
      })),
      type: newType
    }
  }

  arrayExpression(
    ctx: { LBracket: IToken[]; RBracket: IToken[]; Arguments: CstNode | CstNode[] },
    { type }: ExpressionArgument
  ): CodeFragmentResult {
    if (!ctx.LBracket) {
      return { codeFragments: [], type: 'any', image: '' }
    }
    const parentType = 'Array'
    const rParenErrorMessages: ErrorMessage[] = ctx.RBracket
      ? []
      : [{ message: 'Missing closing parenthesis', type: 'syntax' }]
    const { codeFragments, image } = ctx.Arguments
      ? (this.visit(ctx.Arguments) as CodeFragmentResult)
      : { codeFragments: [], image: '' }
    const rBracketCodeFragments = ctx.RBracket ? [token2fragment(ctx.RBracket[0], 'any')] : []
    const finalImage = ctx.RBracket
      ? `${ctx.LBracket[0].image}${image}${ctx.RBracket[0].image}`
      : `${ctx.LBracket[0].image}${image}`

    const { errorMessages, newType } = intersectType(type, parentType, 'arrayExpression')

    return {
      codeFragments: [
        { ...token2fragment(ctx.LBracket[0], 'any'), errors: rParenErrorMessages },
        ...codeFragments,
        ...rBracketCodeFragments
      ].map(codeFragment => ({
        ...codeFragment,
        errors: [...errorMessages, ...codeFragment.errors]
      })),
      type: newType,
      image: finalImage
    }
  }

  recordExpression(
    ctx: { LBrace: IToken[]; RBrace: IToken[]; recordField: Array<CstNode | CstNode[]>; Comma: IToken[] },
    { type }: ExpressionArgument
  ): CodeFragmentResult {
    if (!ctx.LBrace) {
      return { codeFragments: [], type: 'any', image: '' }
    }

    const images: string[] = []
    const codeFragments: CodeFragment[] = []

    images.push(ctx.LBrace[0].image)
    const rBraceErrorMessages: ErrorMessage[] = ctx.RBrace
      ? []
      : [{ message: 'Missing closing parenthesis', type: 'syntax' }]
    codeFragments.push({ ...token2fragment(ctx.LBrace[0], 'any'), errors: rBraceErrorMessages })

    const parentType = 'Record'
    const childrenType = 'any'

    let expressionMatchErrorMessages: ErrorMessage[] = []
    if (ctx.recordField) {
      let commaIndex = 0
      let validExpressionCount = 0
      const keyArray: string[] = []

      ctx.recordField.forEach((arg: CstNode | CstNode[], idx: number) => {
        const { codeFragments: fieldCodeFragments, image: fieldImage } = this.visit(arg, { type: childrenType })
        let nameDuplicateErrors: ErrorMessage[] = []
        if (fieldCodeFragments[0]) {
          const str = fieldCodeFragments[0].name
          const finalStr =
            fieldCodeFragments[0].code === 'StringLiteral' ? str.substring(1, str.length - 1).replace(/""/g, '"') : str
          if (keyArray.includes(finalStr)) {
            nameDuplicateErrors = [{ message: 'Record key duplicated', type: 'syntax' }]
          }
          keyArray.push(finalStr)
        }

        images.push(fieldImage)
        codeFragments.push(
          ...fieldCodeFragments.map((c: CodeFragment) => ({ ...c, errors: [...nameDuplicateErrors, ...c.errors] }))
        )

        if (fieldCodeFragments.length > 0) {
          validExpressionCount += 1
        }

        if (ctx.Comma?.[commaIndex]) {
          codeFragments.push(token2fragment(ctx.Comma[commaIndex], 'any'))
          images.push(ctx.Comma[commaIndex].image)
          commaIndex += 1
        }
      })

      if (validExpressionCount !== commaIndex + 1) {
        expressionMatchErrorMessages = [{ message: 'Expression count mismatch', type: 'syntax' }]
      }
    }

    if (ctx.RBrace) {
      codeFragments.push(token2fragment(ctx.RBrace[0], 'any'))
      images.push(ctx.RBrace[0].image)
    }

    const { errorMessages, newType } = intersectType(type, parentType, 'recordExpression')

    return {
      codeFragments: codeFragments.map(codeFragment => ({
        ...codeFragment,
        errors: [...errorMessages, ...codeFragment.errors, ...expressionMatchErrorMessages]
      })),
      type: newType,
      image: images.join('')
    }
  }

  recordField(
    ctx: { Colon: IToken[]; keyExpression: CstNode | CstNode[]; expression: CstNode | CstNode[] },
    { type }: ExpressionArgument
  ): CodeFragmentResult {
    const images: string[] = []
    const codeFragments: CodeFragment[] = []
    const missingColonErrors: ErrorMessage[] = ctx.Colon ? [] : [{ message: 'Missing colon', type: 'syntax' }]

    const { codeFragments: keyCodeFragments, image: keyImage } = this.visit(ctx.keyExpression, { type: 'string' })
    codeFragments.push(...keyCodeFragments.map((e: CodeFragment) => ({ ...e, errors: missingColonErrors })))
    images.push(keyImage)

    if (ctx.Colon) {
      images.push(ctx.Colon[0].image)
      codeFragments.push(token2fragment(ctx.Colon[0], 'any'))
    }

    if (ctx.expression) {
      const { codeFragments: expressionCodeFragments, image } = this.visit(ctx.expression, { type: 'any' })
      images.push(image)
      codeFragments.push(...expressionCodeFragments)
    }

    return {
      codeFragments,
      type: 'any',
      image: images.join('')
    }
  }

  parenthesisExpression(
    ctx: { expression: CstNode | CstNode[]; LParen: IToken[]; RParen: IToken[] },
    { type }: ExpressionArgument
  ): CodeFragmentResult {
    if (!ctx.LParen) {
      return { codeFragments: [], type: 'any', image: '' }
    }
    const rParenErrorMessages: ErrorMessage[] = ctx.RParen
      ? []
      : [{ message: 'Missing closing parenthesis', type: 'syntax' }]
    const { codeFragments, type: expressionType, image }: CodeFragmentResult = this.visit(ctx.expression, { type })
    const rparenCodeFragments = ctx.RParen ? [token2fragment(ctx.RParen[0], expressionType)] : []
    const finalImage = ctx.RParen
      ? `${ctx.LParen[0].image}${image}${ctx.RParen[0].image}`
      : `${ctx.LParen[0].image}${image}`

    return {
      codeFragments: [
        { ...token2fragment(ctx.LParen[0], 'any'), errors: rParenErrorMessages },
        ...codeFragments,
        ...rparenCodeFragments
      ],
      type: expressionType,
      image: finalImage
    }
  }

  constantExpression(
    ctx: {
      NumberLiteralExpression: CstNode | CstNode[]
      BooleanLiteralExpression: CstNode | CstNode[]
      StringLiteral: IToken[]
      NullLiteral: IToken[]
    },
    { type }: ExpressionArgument
  ): CodeFragmentResult {
    if (ctx.NumberLiteralExpression) {
      return this.visit(ctx.NumberLiteralExpression, { type })
    } else if (ctx.BooleanLiteralExpression) {
      return this.visit(ctx.BooleanLiteralExpression, { type })
    } else if (ctx.NullLiteral) {
      const parentType = 'null'
      const { errorMessages } = intersectType(type, parentType, 'constantExpression')

      return {
        codeFragments: [{ ...token2fragment(ctx.NullLiteral[0], 'null'), errors: errorMessages }],
        type: 'null',
        image: ctx.NullLiteral[0].image
      }
    } else if (ctx.StringLiteral) {
      return this.StringLiteralExpression(ctx, { type })
    }

    // console.log('debugConstant', { ctx, type })
    return { codeFragments: [], type: 'any', image: '' }
  }

  FunctionNameExpression(ctx: any, { type }: ExpressionArgument): CodeFragmentResult {
    const parentType = 'string'
    const { errorMessages } = intersectType(type, parentType, 'FunctionNameExpression')
    return {
      codeFragments: [{ ...token2fragment(ctx.FunctionName[0], parentType), errors: errorMessages }],
      type: parentType,
      image: ctx.FunctionName[0].image
    }
  }

  StringLiteralExpression(ctx: any, { type }: ExpressionArgument): CodeFragmentResult {
    const parentType = 'string'
    const { errorMessages } = intersectType(type, parentType, 'StringLiteralExpression')
    return {
      codeFragments: [{ ...token2fragment(ctx.StringLiteral[0], parentType), errors: errorMessages }],
      type: parentType,
      image: ctx.StringLiteral[0].image
    }
  }

  NumberLiteralExpression(
    ctx: { Minus: IToken[]; NumberLiteral: IToken[]; Sign: IToken[] },
    { type }: ExpressionArgument
  ): CodeFragmentResult {
    const parentType = 'number'

    const codeFragments: CodeFragment[] = []
    const images: string[] = []

    if (ctx.Minus) {
      const errorMessages: ErrorMessage[] = ctx.NumberLiteral ? [] : [{ message: 'Missing number', type: 'syntax' }]
      codeFragments.push({ ...token2fragment(ctx.Minus[0], 'any'), spaceAfter: false, errors: errorMessages })
      images.push(ctx.Minus[0].image)
    }

    const { errorMessages } = intersectType(type, parentType, 'NumberLiteralExpression')

    if (ctx.NumberLiteral) {
      codeFragments.push({ ...token2fragment(ctx.NumberLiteral[0], parentType) })
      images.push(ctx.NumberLiteral[0].image)
    }

    if (ctx.Sign) {
      codeFragments.push({ ...token2fragment(ctx.Sign[0], 'any') })
      images.push(ctx.Sign[0].image)
    }

    return {
      codeFragments: codeFragments.map(codeFragment => ({
        ...codeFragment,
        errors: [...errorMessages, ...codeFragment.errors]
      })),
      type: parentType,
      image: images.join('')
    }
  }

  BooleanLiteralExpression(ctx: { BooleanLiteral: IToken[] }, { type }: ExpressionArgument): CodeFragmentResult {
    const parentType = 'boolean'
    const { errorMessages } = intersectType(type, parentType, 'BooleanLiteralExpression')
    return {
      codeFragments: [{ ...token2fragment(ctx.BooleanLiteral[0], parentType), errors: errorMessages }],
      type: parentType,
      image: ctx.BooleanLiteral[0].image
    }
  }

  columnExpression(ctx: { Sharp: IToken[]; UUID: [any, any] }, { type }: ExpressionArgument): CodeFragmentResult {
    const SharpFragment = token2fragment(ctx.Sharp[0], 'any')
    const [namespaceToken, columnToken] = ctx.UUID

    const namespaceId = namespaceToken.image
    const columnId = columnToken.image

    const columnFragment = token2fragment(columnToken, 'any')

    this.blockDependencies.push(namespaceId)

    const column = this.ctx.formulaContext.findColumn(namespaceId, columnId)

    const parentType: ExpressionType = 'Column'

    this.kind = 'expression'

    if (column) {
      const { errorMessages, newType } = intersectType(type, parentType, 'columnExpression')
      return {
        codeFragments: [
          {
            ...columnFragment,
            code: 'Column',
            type: parentType,
            name: `#${namespaceId}#${columnId}`,
            render: renderColumn(column, errorMessages),
            namespaceId: column.namespaceId,
            errors: errorMessages
          }
        ],
        type: newType,
        image: `#${namespaceId}#${columnId}`
      }
    } else {
      return {
        codeFragments: [
          SharpFragment,
          {
            ...columnFragment,
            name: `#${namespaceId}#${columnId}`,
            errors: [{ message: `Column not found: ${columnId}`, type: 'deps' }]
          }
        ],
        type: parentType,
        image: `#${namespaceId}#${columnId}`
      }
    }
  }

  blockExpression(ctx: { Sharp: IToken[]; UUID: any[] }, { type }: ExpressionArgument): CodeFragmentResult {
    const SharpFragment = token2fragment(ctx.Sharp[0], 'any')
    const namespaceToken = ctx.UUID[0]
    const namespaceId = namespaceToken.image

    this.kind = 'expression'
    this.blockDependencies.push(namespaceId)
    const spreadsheet = this.ctx.formulaContext.findSpreadsheet(namespaceId)

    if (spreadsheet) {
      const parentType: FormulaType = 'Spreadsheet'
      const { errorMessages, newType } = intersectType(type, parentType, 'blockExpression')
      return {
        codeFragments: [
          {
            ...token2fragment(namespaceToken, 'any'),
            code: 'Spreadsheet',
            type: parentType,
            render: renderSpreadsheet(spreadsheet, errorMessages),
            namespaceId: spreadsheet.blockId,
            name: `#${namespaceId}`,
            errors: errorMessages
          }
        ],
        image: `#${namespaceId}`,
        type: newType
      }
    }

    const formulaName = this.ctx.formulaContext.formulaNames.find(f => f.kind === 'Block' && f.key === namespaceId)
    if (formulaName) {
      const parentType: FormulaType = 'Block'
      const { errorMessages, newType } = intersectType(type, parentType, 'blockExpression')
      const block = new BlockClass(this.ctx, { id: namespaceId })

      return {
        codeFragments: [
          {
            ...token2fragment(namespaceToken, 'any'),
            code: 'Block',
            type: parentType,
            render: renderBlock(block.id, block.name, errorMessages),
            namespaceId: block.id,
            name: `#${namespaceId}`,
            errors: errorMessages
          }
        ],
        image: `#${namespaceId}`,
        type: newType
      }
    }

    return {
      codeFragments: [
        SharpFragment,
        {
          ...token2fragment(namespaceToken, 'any'),
          errors: [{ message: `Block not found: ${namespaceId}`, type: 'deps' }]
        }
      ],
      image: `#${namespaceId}`,
      type: 'Block'
    }
  }

  lazyVariableExpression(ctx: any, { type }: ExpressionArgument): CodeFragmentResult {
    if (ctx.variableExpression) {
      return this.visit(ctx.variableExpression, { type })
    } else if (ctx.Self) {
      return { codeFragments: [token2fragment(ctx.Self[0], 'Reference')], type: 'Reference', image: ctx.Self[0].image }
    } else if (ctx.Input) {
      return {
        codeFragments: [token2fragment(ctx.Input[0], 'Record')],
        type: 'Record',
        image: ctx.Input[0].image
      }
    } else if (ctx.LambdaArgumentNumber) {
      return {
        codeFragments: [token2fragment(ctx.LambdaArgumentNumber[0], 'Reference')],
        type: 'Reference',
        image: ctx.LambdaArgumentNumber[0].image
      }
    } else {
      return { codeFragments: [], type: 'any', image: '' }
    }
  }

  variableExpression(ctx: { Sharp: IToken[]; UUID: [any, any] }, { type }: ExpressionArgument): CodeFragmentResult {
    const SharpFragment = token2fragment(ctx.Sharp[0], 'any')
    const [namespaceToken, variableToken] = ctx.UUID

    const namespaceId = namespaceToken.image
    const variableId = variableToken.image

    const variableFragment = token2fragment(variableToken, 'any')

    const variable = this.ctx.formulaContext.findVariable(namespaceId, variableId)

    this.kind = 'expression'

    if (variable) {
      this.variableDependencies = [
        ...new Map(
          [...this.variableDependencies, { namespaceId, variableId }].map(item => [item.variableId, item])
        ).values()
      ]

      this.flattenVariableDependencies = [
        ...new Map(
          [
            ...this.flattenVariableDependencies,
            ...variable.t.flattenVariableDependencies,
            { namespaceId, variableId }
          ].map(item => [item.variableId, item])
        ).values()
      ]

      this.level = Math.max(this.level, variable.t.level + 1)

      const { errorMessages, newType } = intersectType(
        type,
        variable.t.variableValue.result.type ?? 'any',
        'variableExpression'
      )
      return {
        codeFragments: [
          {
            ...variableFragment,
            code: 'Variable',
            type: newType,
            render: renderVariable(variable, errorMessages),
            namespaceId: variable.t.namespaceId,
            name: `#${namespaceId}@${variableId}`,
            errors: errorMessages
          }
        ],
        image: `#${namespaceId}@${variableId}`,
        type: newType
      }
    } else {
      return {
        codeFragments: [
          SharpFragment,
          {
            ...variableFragment,
            code: 'Variable',
            name: `#${namespaceId}@${variableId}`,
            errors: [{ message: `Variable not found: ${variableId}`, type: 'deps' }]
          }
        ],
        image: `#${namespaceId}@${variableId}`,
        type: 'any'
      }
    }
  }

  // eslint-disable-next-line complexity
  FunctionCall(
    ctx: {
      FunctionName: Array<{ image: any }>
      Arguments: CstNode | CstNode[]
      LParen: IToken[]
      RParen: IToken[]
    },
    { type, firstArgumentType }: ExpressionArgument
  ): CodeFragmentResult {
    const names = ctx.FunctionName.map(({ image }) => image)
    const [group, name] = names.length === 1 ? ['core', ...names] : names

    const images: string[] = []

    if (names.length === 1) {
      images.push(name)
    } else {
      images.push(group, '::', name)
    }

    const clause = this.ctx.formulaContext.findFunctionClause(group, name)

    const functionKey = buildFunctionKey(group, name)

    const nameFragment: CodeFragment = {
      name: functionKey,
      code: 'FunctionName',
      errors: [],
      type: 'any',
      spaceBefore: false,
      spaceAfter: false,
      render: undefined
    }

    if (!ctx.LParen) {
      return {
        codeFragments: [
          {
            ...nameFragment,
            code: 'Function',
            errors: [{ message: `Unknown function ${functionKey}`, type: 'syntax' }]
          }
        ],
        image: images.join(''),
        type: 'any'
      }
    }

    const rParenErrorMessages: ErrorMessage[] = ctx.RParen
      ? []
      : [{ message: 'Missing closing parenthesis', type: 'syntax' }]
    const rparenCodeFragments = ctx.RParen ? [token2fragment(ctx.RParen[0], clause ? clause.returns : 'any')] : []

    const clauseErrorMessages: ErrorMessage[] = []
    if (!clause) {
      clauseErrorMessages.push({ message: `Function ${functionKey} not found`, type: 'deps' })
    } else if (clause.feature && !this.ctx.formulaContext.features.includes(clause.feature)) {
      clauseErrorMessages.push({ message: `Feature ${clause.feature} not enabled`, type: 'deps' })
    }

    if (clauseErrorMessages.length === 0 && clause) {
      this.functionDependencies.push(clause)

      if (clause.effect || !clause.pure) {
        this.kind = 'expression'
      }

      const chainError: ErrorMessage[] = []
      if (firstArgumentType && !clause.chain) {
        chainError.push({ message: `${group}::${name} is not chainable`, type: 'deps' })
      }

      let clauseArgs = clause.args
      if (firstArgumentType) {
        const firstType = clauseArgs[0].type

        const { errorMessages } = intersectType(firstType, firstArgumentType, 'FunctionCall')
        chainError.push(...errorMessages)
        clauseArgs = clause.args.slice(1)
      }
      const { codeFragments: argsCodeFragments, image } = ctx.Arguments
        ? (this.visit(ctx.Arguments, clauseArgs) as CodeFragmentResult)
        : { codeFragments: [], image: '' }
      const argsErrorMessages: ErrorMessage[] =
        clauseArgs.filter(a => !a.default).length > 0 && argsCodeFragments.length === 0
          ? [{ message: 'Miss argument', type: 'deps' }]
          : []

      images.push(ctx.LParen[0].image, image, ctx.RParen ? ctx.RParen[0].image : '')

      const { errorMessages, newType } = intersectType(type, clause.returns, 'FunctionCall')
      return {
        codeFragments: [
          {
            ...nameFragment,
            code: 'Function',
            errors: [...chainError, ...errorMessages, ...argsErrorMessages]
          },
          { ...token2fragment(ctx.LParen[0], 'any'), errors: rParenErrorMessages },
          ...argsCodeFragments,
          ...rparenCodeFragments
        ],
        image: images.join(''),
        type: newType
      }
    } else {
      const { codeFragments: argsCodeFragments, image } = ctx.Arguments
        ? (this.visit(ctx.Arguments, null) as CodeFragmentResult)
        : { codeFragments: [], image: '' }
      images.push(ctx.LParen[0].image, image, ctx.RParen ? ctx.RParen[0].image : '')

      return {
        codeFragments: [
          {
            ...nameFragment,
            code: 'Function',
            errors: clauseErrorMessages
          },
          { ...token2fragment(ctx.LParen[0], 'any'), errors: rParenErrorMessages },
          ...argsCodeFragments,
          ...rparenCodeFragments
        ],
        image: images.join(''),
        type: 'any'
      }
    }
  }

  Arguments(ctx: { expression: any[]; Comma: IToken[] }, args: Argument[] | null): CodeFragmentResult {
    const firstArgs = args?.[0]
    const argumentTypes = firstArgs?.spread
      ? Array(ctx.expression.length).fill(firstArgs.type)
      : args?.map(x => x.type) ?? []

    const nonDefaultArgumentCount = args ? args.filter(x => !x.default).length : 0

    const codeFragments: CodeFragment[] = []
    const images: string[] = []

    let commaIndex = 0
    let validExpressionCount = 0

    ctx.expression.forEach((arg: CstNode | CstNode[], idx: number) => {
      const { codeFragments: argFragments, image }: CodeFragmentResult = this.visit(arg, {
        type: argumentTypes[idx] || 'any'
      })

      if (argFragments.length > 0) {
        validExpressionCount += 1
      }

      codeFragments.push(...argFragments)
      images.push(image)

      if (ctx.Comma?.[commaIndex]) {
        codeFragments.push(token2fragment(ctx.Comma[commaIndex], 'any'))
        images.push(ctx.Comma[commaIndex].image)
        commaIndex += 1
      }
    })

    const expressionMatchErrorMessages: ErrorMessage[] =
      validExpressionCount === commaIndex + 1 ? [] : [{ message: 'Expression count mismatch', type: 'syntax' }]

    const errorMessages: ErrorMessage[] =
      !!args && (ctx.expression.length > argumentTypes.length || ctx.expression.length < nonDefaultArgumentCount)
        ? [{ message: 'Argument count mismatch', type: 'deps' }]
        : []
    return {
      image: images.join(''),
      codeFragments: codeFragments.map(codeFragment => ({
        ...codeFragment,
        errors: [...expressionMatchErrorMessages, ...errorMessages, ...codeFragment.errors]
      })),
      type: 'any'
    }
  }
}