import { SpreadsheetType } from '@mashcard/formula'
import { FormulaSpreadsheet } from '../Render'

export interface SpreadsheetPreviewProps {
  spreadsheet: SpreadsheetType
  rootId: string
}

export const SpreadsheetPreview: React.FC<SpreadsheetPreviewProps> = ({ spreadsheet, rootId }) => {
  return (
    <div className="autocomplete-preview-spreadsheet">
      <FormulaSpreadsheet spreadsheet={spreadsheet} />
    </div>
  )
}
