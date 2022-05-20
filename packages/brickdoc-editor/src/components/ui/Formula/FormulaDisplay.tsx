import React from 'react'
import { Icon } from '@brickdoc/design-system'
import { FormulaSourceType, VariableDisplayData, loadDisplayResult } from '@brickdoc/formula'
import { SelectedType } from '../../blockViews/FormulaView/useFormula'
import { useEditorPropsContext } from '../../../hooks/useEditorPropsContext'
import { FormulaLiteral, FormulaValue } from '.'

export interface FormulaDisplayProps {
  displayData?: VariableDisplayData
  display?: string
  formulaType: FormulaSourceType
  name?: string
  disablePopover?: boolean
  selected?: SelectedType
}

export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({
  displayData,
  display,
  formulaType,
  name,
  selected,
  disablePopover,
  ...props
}) => {
  const editorProps = useEditorPropsContext()
  if (!displayData) {
    if (formulaType === 'normal') {
      return (
        <span {...props} className="brickdoc-formula-empty">
          <Icon.Formula className="brickdoc-formula-empty-icon" />
        </span>
      )
    }
    return <div />
  }

  const { result, meta } = displayData

  if (result.type === 'literal') {
    return (
      <span {...props}>
        <FormulaLiteral result={result} formulaType={meta.richType.type} />
      </span>
    )
  }

  const formulaContext = editorProps.formulaContext!

  const ctx = { formulaContext, meta, interpretContext: { ctx: {}, arguments: [] } }
  const newDisplayData = loadDisplayResult(ctx, displayData)

  let preview: React.ReactElement | null = null

  const dataResult = newDisplayData.result

  if (dataResult.view) {
    const viewRender = formulaContext.findViewRender(dataResult.view.type)
    if (viewRender) {
      preview = viewRender(dataResult.view.attrs, newDisplayData)
    }
  }

  return (
    <span {...props}>
      <FormulaValue
        displayData={newDisplayData}
        name={name}
        selected={selected}
        disablePopover={disablePopover}
        display={display ?? newDisplayData.display}
        border={true}
      />
      {preview ?? <></>}
    </span>
  )
}
