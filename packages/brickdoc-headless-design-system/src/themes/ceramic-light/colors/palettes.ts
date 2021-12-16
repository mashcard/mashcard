import { generatePalette } from '../../../utilities'

export const Palettes = {
  white: '#fff',
  black: '#000',

  grey1: '#fcfcfa',
  grey2: '#f0f0f0',
  grey3: '#e0e0e0',
  grey4: '#d3d3d3',
  grey5: '#cacaca',
  grey6: '#8e8e8e',
  grey7: '#757575',
  grey8: '#616161',
  grey9: '#1c1c1e',

  /**
   * Red
   */
  ...generatePalette('red', '#d43730'),
  red7: '#b0160e',

  /**
   * Orange
   */
  ...generatePalette('orange', '#ff6d00'),
  orange1: '#fff5ed',
  orange9: '#933610',

  /**
   * Yellow
   */
  ...generatePalette('yellow', '#ffd84e'),
  yellow1: '#fffbf0',

  /**
   * Green
   */
  ...generatePalette('green', '#2cad94'),
  green1: '#edfffb',

  /**
   * Cyan
   */
  ...generatePalette('cyan', '#39b3e8'),
  cyan1: '#f8fbff',
  cyan9: '#095b85',

  /**
   * Blue
   */
  ...generatePalette('blue', '#2c5bff'),

  /**
   * Deep Purple
   */
  ...generatePalette('deepPurple', '#3a3642'),
  deepPurple9: '#0f0a15',

  /**
   * Purple
   */
  ...generatePalette('purple', '#5e35b1'),

  /**
   * Pink
   */
  ...generatePalette('pink', '#d81b60')
}