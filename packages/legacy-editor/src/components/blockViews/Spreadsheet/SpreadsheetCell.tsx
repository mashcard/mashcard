import React from 'react'

import {
  MashcardEventBus,
  BlockInput,
  SpreadsheetUpdateCellValue,
  FormulaCalculateTrigger,
  FormulaEditorBlurTrigger,
  FormulaEditorCloseTrigger
} from '@mashcard/schema'
import { FormulaBlockRender, getFormulaContext, useFormula, UseFormulaInput } from '../FormulaView'
import {
  columnDisplayIndex,
  display,
  dumpDisplayResultForDisplay,
  fetchResult,
  SpreadsheetReloadViaId,
  VariableDisplayData,
  VariableInterface
} from '@mashcard/formula'
import { SpreadsheetContext } from './SpreadsheetContext'
import { devLog } from '@mashcard/design-system'
import { FormulaDisplay } from '../../ui/Formula'
import { useEditorContext, useDocumentContext } from '../../../hooks'

export interface SpreadsheetCellProps {
  context: SpreadsheetContext
  block: BlockInput
  rowIdx: number
  columnSort: number
  columnTitle: string | undefined
  tableId: string
  saveBlock: (block: BlockInput) => void
  width?: number
  height?: number
}

export const SpreadsheetCell: React.FC<SpreadsheetCellProps> = ({
  context,
  tableId,
  block,
  rowIdx,
  columnSort,
  columnTitle,
  saveBlock,
  width,
  height
}) => {
  const { editor } = useEditorContext()
  const { docId } = useDocumentContext()
  const rootId = docId!
  const formulaContext = getFormulaContext(editor)
  const minHeight = height ? height - 3 : undefined

  const [currentBlock, setCurrentBlock] = React.useState(block)
  const rowId = block.parentId as string
  const columnId = block.data.columnId

  const cellId = `${rowId},${columnId}`
  const formulaId = currentBlock.data.formulaId

  const formulaName = `Cell_${rowId}_${columnId}`.replaceAll('-', '')

  const editing = context?.editingCellId === formulaName
  const [editingCell, setEditingCell] = React.useState(editing)
  const latestEditing = React.useRef<boolean>(editing)
  const { setEditingCellId } = context
  const setEditing = React.useCallback(
    (newEditing: boolean) => {
      if (newEditing) {
        setEditingCellId(formulaName)
      } else if (editing) {
        setEditingCellId('')
      }
      setEditingCell(newEditing)
    },
    [setEditingCellId, formulaName, editing]
  )

  const onUpdateFormula = React.useCallback(
    async (variable: VariableInterface | undefined): Promise<void> => {
      if (!variable) return
      // TODO check no persist
      const value = display(fetchResult(variable.t), formulaContext!).result
      const oldValue = block.text
      if (value === oldValue && value) return
      devLog('Spreadsheet cell formula updated', { cellId, value, rootId })
      const newBlock = { ...block, text: value }
      setCurrentBlock(newBlock)
      saveBlock(newBlock)

      if (!formulaContext || !rootId) return

      const result = MashcardEventBus.dispatch(
        SpreadsheetReloadViaId({
          id: tableId,
          scope: {
            rows: [String(rowIdx + 1), rowId],
            columns: [block.data.columnId, columnDisplayIndex(columnSort), ...(columnTitle ? [columnTitle] : [])]
          },
          meta: null,
          namespaceId: rootId,
          username: formulaContext.username,
          key: variable?.currentUUID ?? tableId
        })
      )
      await Promise.all(result)
      // console.log('dispatch update cell', variable)
      // setEditing(false)
    },
    [formulaContext, block, cellId, rootId, saveBlock, tableId, rowIdx, rowId, columnSort, columnTitle]
  )

  const meta: UseFormulaInput['meta'] = {
    namespaceId: rootId,
    variableId: formulaId,
    input: '',
    position: 0,
    name: formulaName,
    richType: {
      type: 'spreadsheet',
      meta: {
        spreadsheetId: tableId,
        columnId,
        rowId
      }
    }
  }

  const { temporaryVariableT, savedVariableT, formulaEditor, onSaveFormula, commitFormula, completion } = useFormula({
    meta,
    onUpdateFormula,
    formulaContext
  })

  const eventId = `${tableId},${cellId}`

  React.useEffect(() => {
    const listener = MashcardEventBus.subscribe(
      SpreadsheetUpdateCellValue,
      e => {
        const { value } = e.payload
        devLog('Spreadsheet update cell', { eventId, value })
        void commitFormula(value)
      },
      { eventId, subscribeId: eventId }
    )
    return () => listener.unsubscribe()
  }, [commitFormula, eventId])

  const handleEnterEdit = (): void => {
    context.clearSelection()
    setEditing(true)
    MashcardEventBus.dispatch(FormulaCalculateTrigger({ skipExecute: true, formulaId, rootId }))
  }

  React.useEffect(() => {
    const listener = MashcardEventBus.subscribe(
      FormulaEditorCloseTrigger,
      e => {
        setEditing(false)
      },
      { eventId: `${rootId},${formulaId}`, subscribeId: `FormulaCell#${rootId},${formulaId}` }
    )
    return () => listener.unsubscribe()
  }, [formulaId, rootId, setEditing])

  React.useEffect(() => {
    const listener = MashcardEventBus.subscribe(
      FormulaEditorBlurTrigger,
      async e => {
        await onSaveFormula()
        setEditing(false)
      },
      { eventId: `${rootId},${formulaId}`, subscribeId: `FormulaCell#${rootId},${formulaId}` }
    )
    return () => listener.unsubscribe()
  }, [formulaId, onSaveFormula, rootId, setEditing])

  if (editingCell || editing) {
    if (!latestEditing.current && formulaEditor) {
      formulaEditor.commands.focus('end')
      latestEditing.current = true
    }

    return (
      <FormulaBlockRender
        formulaEditor={formulaEditor}
        meta={meta}
        temporaryVariableT={temporaryVariableT}
        completion={completion}
        width={width}
        minHeight={minHeight}
      />
    )
  } else {
    latestEditing.current = false
  }

  const displayResult = savedVariableT
    ? display(fetchResult(savedVariableT), formulaContext!).result
    : currentBlock.text
  const fallbackDisplayData: VariableDisplayData | undefined = displayResult
    ? {
        definition: displayResult,
        type: 'spreadsheet',
        result: { type: 'literal', result: displayResult }
      }
    : undefined
  const displayData: VariableDisplayData | undefined = savedVariableT
    ? dumpDisplayResultForDisplay(savedVariableT)
    : formulaContext?.findVariableDisplayDataById(rootId, formulaId) ?? fallbackDisplayData

  return (
    <div className="cell" style={{ ...(width ? { width: `${width}px` } : {}) }} onDoubleClick={handleEnterEdit}>
      <FormulaDisplay displayData={displayData} formulaType="spreadsheet" />
    </div>
  )
}
