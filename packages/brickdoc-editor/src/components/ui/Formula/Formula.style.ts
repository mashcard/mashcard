import { css, styled, keyframes } from '@brickdoc/design-system'

const rotation = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' }
})

export const BrickdocFormulaMenuPopover = css({
  display: 'inline'
})()

export const FormulaDivider = styled('div', {
  padding: '0 12px',
  background: '#f6f6f6',
  height: 1
})

export const FormulaResult = styled('div', {
  color: '@basic-color',
  margin: '12px 0',
  fontSize: '14px',
  lineHeight: '20px',
  fontFamily: "'Fira Code'",

  '.formula-result-error': {
    flexDirection: 'column',
    '.formula-result-error-type': {
      marginRight: 12,
      color: '#df5641'
    },
    '.formula-result-error-message': {
      color: '#bfbcc6'
    }
  },

  '.formula-result-ok': {
    '.formula-result-ok-equal': {
      marginRight: 12
    },
    '.formula-result-ok-icon': {
      float: 'right'
    }
  }
})

export const BrickdocFormulaMenu = styled('div', {
  minWidth: 600,
  width: 720,
  maxWidth: '100%',
  padding: '4px 0px 16px 0px',

  '.formula-menu-row': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,

    '.formula-menu-item': {
      flex: 1,

      '.formula-menu-field': {
        flex: 1,
        padding: 1
      }
    },

    '.formula-menu-item + .formula-menu-item': {
      marginLeft: 24
    },

    '.formula-menu-label': {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      fontWeight: 500
    }
  },

  '.formula-menu-footer': {
    position: 'relative',
    padding: '2rem 0 6px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',

    '.formula-menu-button': {
      height: 22,
      lineHeight: '16px',
      fontSize: 12
    },

    '.formula-menu-button + .formula-menu-button': {
      marginLeft: 12
    }
  }
})

export const BrickdocFormulaNormal = css({
  cursor: 'pointer',
  padding: '3px 8px',
  margin: '0 3px',
  borderRadius: 20,
  fontSize: 16,

  '.brickdoc-formula-normal-icon': {
    marginRight: 5
  }
})()

export const BrickdocFormulaBorderless = css({
  cursor: 'pointer',
  fontFamily: "'Fira Code'"
})()

export const BrickdocFormulaEmpty = css({
  "display": "inline-flex",
  "alignItems": "center",
  "justifyContent": "center",
  "background": "#f9f9f9",
  "borderRadius": 4,
  "width": 24,
  "height": 24,
  "cursor": "pointer",

  '.brickdoc-formula-empty-icon': {
    fontSize: 12,
    color: '#bfbcc6'
  }
})()

export const BrickdocFormulaPending = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  cursor: 'pointer',
  position: 'relative',

  '&::before': {
    content: ' ',
    border: '3px solid #FFFFFF',
    borderBottomColor: '#3E3E3E',
    borderRadius: '50%',
    display: 'inline-block',
    '-webkit-animation': `${rotation} 1s linear infinite`,
    animation: `${rotation} 1s linear infinite`,
    position: 'absolute',
    zIndex: 100,
    right: '0%',
    marginTop: -20,
    marginRight: -2
  },

  '.brickdoc-formula-pending-icon': {
    fontSize: 12,
    color: ' #bfbcc6'
  }
})()

export const BrickdocFormulaError = css({
  "display": "inline-flex",
  "alignItems": "center",
  "justifyContent": "center",
  "borderRadius": 4,
  "width": 24,
  "height": 24,
  "cursor": "pointer",
  "position": "relative",

  '&::before': {
    "content": " ",
    "border": "3px solid red",
    "borderRadius": 3,
    "position": "absolute",
    "zIndex": "1000",
    "right": "0%",
    "marginTop": -20,
    "marginRight": -2
  },

  '.brickdoc-formula-error-icon': {
    "fontSize": 12,
    "color": "#bfbcc6"
  }
})()