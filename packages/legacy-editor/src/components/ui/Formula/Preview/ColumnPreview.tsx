import { ColumnType } from '@mashcard/formula'
import { FormulaSpreadsheet } from '../Render'

export interface ColumnPreviewProps {
  column: ColumnType
  rootId: string
}

export const ColumnPreview: React.FC<ColumnPreviewProps> = ({ column, rootId }) => {
  return (
    <div className="autocomplete-preview-column">
      <FormulaSpreadsheet spreadsheet={column.spreadsheet} columnIds={[column.columnId]} select={true} />
    </div>
  )
}
