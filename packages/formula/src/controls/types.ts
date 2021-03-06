import { FormulaInterpreter } from '../grammar'
import { CodeFragmentVisitor } from '../grammar/codeFragment'
import {
  ColumnId,
  ColumnName,
  FormulaControlType,
  BaseFunctionContext,
  NamespaceId,
  uuid,
  VariableMetadata,
  ContextInterface,
  VariableDisplayData,
  AnyTypeResult,
  CodeFragment,
  ErrorMessage,
  FormulaType,
  SpreadsheetId,
  NameDependencyWithKind,
  EventDependency,
  FindKey,
  FormulaEventPayload
} from '../type'

export interface ControlType {
  _formulaContext: ContextInterface
  _meta: VariableMetadata
  kind: FormulaControlType
  disabled: boolean
  persistence: () => ControlInitializer
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ControlInitializer {}
export interface ButtonType extends ControlType {
  kind: 'Button'
  name: string
  fn: AnyTypeResult<'Function'>
  onClick?: VoidFunction
}

export interface BlockInitializer {
  id: NamespaceId
  name: string
}

type handleInterpretType = (interpreter: FormulaInterpreter, name: string) => Promise<AnyTypeResult>
export type getEventDependencyInput = { rowKey?: string; columnKey?: string } & (
  | {
      rowKey: string
    }
  | { columnKey: string }
  | {}
)

type getEventDependency = ({ rowKey, columnKey }: getEventDependencyInput) => EventDependency<FormulaEventPayload<any>>
export interface handleCodeFragmentsResult {
  errors: ErrorMessage[]
  firstArgumentType: FormulaType | undefined
  codeFragments: CodeFragment[]
}
type handleCodeFragmentsType = (
  visitor: CodeFragmentVisitor,
  name: string,
  rhsCodeFragments: CodeFragment[]
) => handleCodeFragmentsResult
export interface BlockType {
  id: NamespaceId
  _formulaContext: ContextInterface
  name: (pageId: NamespaceId) => string
  nameDependency: () => NameDependencyWithKind
  cleanup: () => Promise<void>
  persistence: () => BlockInitializer
  handleCodeFragments: handleCodeFragmentsType
  handleInterpret: handleInterpretType
}

export interface Column {
  columnId: ColumnId
  spreadsheetId: SpreadsheetId
  name: ColumnName
  title: string | undefined
  displayIndex: string
  index: number
  sort: number
}

export interface ColumnType extends Column {
  spreadsheet: SpreadsheetType
  namespaceId: NamespaceId
  findKey: FindKey
  logic: boolean
  display: () => string
  key: () => string
  handleCodeFragments: handleCodeFragmentsType
  handleInterpret: handleInterpretType
  eventDependency: getEventDependency
  newCell: (cell: Cell, rowKey: string) => CellType
  cells: () => Cell[]
}

export interface Row {
  spreadsheetId: SpreadsheetId
  rowId: uuid
  rowIndex: number
}

export interface RowType extends Row {
  spreadsheet: SpreadsheetType
  namespaceId: NamespaceId
  findKey: FindKey
  listCells: () => Cell[]
  logic: boolean
  display: () => string
  key: () => string
  newCell: (cell: Cell, columnKey: string) => CellType
  handleCodeFragments: handleCodeFragmentsType
  handleInterpret: handleInterpretType
  eventDependency: getEventDependency
}

export interface RangeType {
  spreadsheetId: SpreadsheetId
  columnSize: number
  rowSize: number
  rowIds: uuid[]
  columnIds: uuid[]
  startCell: Cell
  endCell: Cell
}

export interface Cell {
  namespaceId: NamespaceId
  spreadsheetId: SpreadsheetId
  cellId: uuid
  columnId: ColumnId
  rowId: uuid
  variableId: uuid
  columnIndex: number
  rowIndex: number
  value: string
}

export type CellVia = ['column' | 'row', FindKey, string]

export interface CellType extends Cell {
  spreadsheet: SpreadsheetType
  _cell: Cell
  via: CellVia
  columnKey: string
  rowKey: string
  eventDependency: getEventDependency
  getValue: () => string
}

export interface SpreadsheetInitializer {
  spreadsheetId: SpreadsheetId
  namespaceId: NamespaceId
  ctx: BaseFunctionContext
  dynamic: boolean
  name: string
  columns: Column[]
  rows: Row[]
  getCell: ({
    rowId,
    columnId,
    rowIndex,
    columnIndex
  }: {
    rowId: uuid
    columnId: uuid
    rowIndex: number
    columnIndex: number
  }) => Cell
}

export interface SpreadsheetDynamicPersistence {
  spreadsheetId: SpreadsheetId
  namespaceId: NamespaceId
  spreadsheetName: string
  columns: Column[]
  rows: Row[]
  cells: Cell[]
}

export interface SpreadsheetAllPersistence {
  spreadsheetId: SpreadsheetId
  namespaceId: NamespaceId
  rowCount: number
  columnCount: number
  persistence?: SpreadsheetDynamicPersistence
}

export interface SpreadsheetType {
  _formulaContext: ContextInterface
  spreadsheetId: SpreadsheetId
  namespaceId: NamespaceId
  namespaceName: (pageId: NamespaceId) => string
  dynamic: boolean
  cleanup: () => void
  persistence?: SpreadsheetDynamicPersistence
  handleCodeFragments: handleCodeFragmentsType
  handleInterpret: handleInterpretType
  eventDependency: getEventDependency
  nameDependency: () => NameDependencyWithKind
  columnCount: () => number
  rowCount: () => number
  name: () => string
  listColumns: () => Column[]
  listRows: () => Row[]
  listCells: ({ rowId, columnId }: { rowId?: uuid; columnId?: uuid }) => Cell[]
  findCellValue: ({ rowId, columnId }: { rowId: uuid; columnId: uuid }) => string | undefined
  findCellDisplayData: ({ rowId, columnId }: { rowId: uuid; columnId: uuid }) => VariableDisplayData | undefined
  findRow: (key: FindKey) => RowType | undefined
  findColumn: (key: FindKey) => ColumnType | undefined
  toArray: () => string[][]
  toRecord: () => Array<Record<string, AnyTypeResult<'string'>>>
  persistAll: () => SpreadsheetAllPersistence
}

export interface ButtonInitializer extends ControlInitializer {
  name: string
  fn: AnyTypeResult<'Function'>
}

export interface SwitchType extends ControlType {
  kind: 'Switch'
  checked: boolean
  fn: AnyTypeResult<'Function'>
  onChange?: (bool: boolean) => void
}

export interface SwitchInitializer extends ControlInitializer {
  checked: boolean
  fn: AnyTypeResult<'Function'>
}
