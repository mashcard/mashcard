import { createFunctionClause, RecordResult } from '../../types'

/**
 * @source
 */
export const spreadsheetToRecordArray = createFunctionClause({
  name: 'toRecordArray',
  async: false,
  pure: true,
  lazy: false,
  persist: false,
  acceptError: false,
  effect: false,
  examples: [{ input: '=123', output: { type: 'Array', result: [], subType: 'void' } }],
  description: 'Converts the spreadsheet to a record.',
  group: 'core',
  args: [{ name: 'spreadsheet', type: 'Spreadsheet' }],
  returns: 'Array',
  testCases: [],
  chain: true,
  reference: (ctx, { result: spreadsheet }) => {
    return {
      type: 'Array',
      subType: 'Record',
      result: spreadsheet.toRecord().map<RecordResult>(row => ({ type: 'Record', subType: 'string', result: row }))
    }
  }
})