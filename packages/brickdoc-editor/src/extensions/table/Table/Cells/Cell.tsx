import React from 'react'
import { CellProps as ReactTableCellProps } from 'react-table'
import { SelectCell } from './SelectCell'
import { TextCell } from './TextCell'

export interface CellProps extends ReactTableCellProps<object> {}

export const Cell: React.FC<CellProps> = props => {
  switch (props.cell.column.columnType) {
    case 'text':
      return <TextCell {...props} />
    case 'select':
      return <SelectCell {...props} />
  }

  return null
}