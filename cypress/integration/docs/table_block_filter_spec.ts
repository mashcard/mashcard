describe('tableBlockFilter', () => {
  beforeEach(() => {
    cy.sessionMock({ email: 'cypress@brickdoc.com' })

    cy.visit('/')
    cy.get('[contenteditable]').type('/table')
    cy.get('button.slash-menu-item:first').click()

    // add new column
    cy.get('.table-block-th:last > button').click()
    // change to select type
    cy.findByText('Column1').click()
    cy.findByText('Text').click()
    cy.findByText('Select').click({ force: true })

    cy.get('.table-toolbar-add-button').click()

    cy.get('.table-block-select-cell:last').click()
    // add new select option
    cy.focused().type('new option 2{Enter}')
    cy.focused().type('new option{Enter}')
    cy.findByTestId('table-select-overlay').click()
    // edit text cell
    cy.get('.table-block-text-cell:last').click()
    cy.focused().type('text')
    cy.findByTestId('table-text-overlay').click({ force: true })

    // add row 2
    cy.get('.table-block-tbody > .table-block-row:first').realHover()
    cy.get('.table-block-tbody > .table-block-row:first > .table-block-row-actions > button:first').click()
    // edit text cell
    cy.get('.table-block-text-cell:last').click()
    cy.focused().type('text2')
    cy.findByTestId('table-text-overlay').click({ force: true })
    // pick select option
    cy.get('.table-block-select-cell:last').click()
    cy.findByText('new option 2').click()
    cy.findByTestId('table-select-overlay').click({ force: true })
  })

  it('should allow three level nested filter group', () => {
    cy.findByText('Filter').click()
    cy.findByText('Add a Filter').click()
    cy.findByText('Add a filter group').click()
    cy.get('.table-toolbar-item-group-panel.cascade .table-toolbar-item-footer-button').click()
    cy.findAllByText('Add a filter group').click({ multiple: true, force: true })
    cy.get('.table-toolbar-item-group-panel.cascade .table-toolbar-item-group-panel .table-toolbar-item-footer-button').click()
    cy.findAllByText('Add a filter group').click({ multiple: true, force: true })
    cy.get(
      '.table-toolbar-item-group-panel.cascade .table-toolbar-item-group-panel .table-toolbar-item-group-panel .table-toolbar-item-footer-button'
    ).click()
    cy.findByText('Add a filter group').should('not.exist')
  })

  it('should remove filter option', () => {
    cy.findByText('Filter').click()
    cy.findByText('Add a Filter').click()
    cy.findByText('Add a filter').click()

    cy.get('.table-toolbar-item-option').should('have.length', 1)

    cy.get('.table-toolbar-item-option > button').click()
    cy.findByText('Remove').click()

    cy.get('.table-toolbar-item-option').should('have.length', 0)
  })

  it('should duplicate filter option', () => {
    cy.findByText('Filter').click()
    cy.findByText('Add a Filter').click()
    cy.findByText('Add a filter').click()

    cy.get('.table-toolbar-item-option').should('have.length', 1)

    cy.get('.table-toolbar-item-option > button').click()
    cy.findByText('Duplicate').click()

    cy.get('.table-toolbar-item-option').should('have.length', 2)
  })

  it('should filter data by combining filter options', () => {
    cy.get('.table-block-tbody > .table-block-row').should('have.length', 2)

    cy.findByText('Filter').click()
    cy.findByText('Add a Filter').click()
    cy.findByText('Add a filter').click()
    cy.get('.table-toolbar-item-option-select:first').click()
    cy.focused().type('{Enter}')

    cy.get('.table-toolbar-item-option-select:last').click()
    cy.focused().type('Is{Enter}')
    cy.findByPlaceholderText('Value').type('text2')

    cy.findByText('Add a Filter').click()
    cy.findByText('Add a filter').click()

    // And
    cy.get('.table-toolbar-item-option:nth-of-type(2) > .table-toolbar-item-option-select:nth-of-type(2)').click()
    cy.focused().type('Column1{Enter}')
    cy.get('.table-toolbar-item-option:nth-of-type(2) > .table-toolbar-item-option-select:nth-of-type(3)').click()
    cy.focused().type('Is{Enter}')
    cy.get('.table-toolbar-item-option:nth-of-type(2) > .table-toolbar-item-option-select:nth-of-type(4)').click()
    cy.focused().type('new option 2{Enter}')

    cy.get('.table-block-tbody > .table-block-row').should('have.length', 1)
    cy.get('.table-block-tbody > .table-block-row .table-block-text-cell').should('contain.text', 'text2')
    cy.get('.table-block-tbody > .table-block-row .table-block-select-cell').should('contain.text', 'new option 2')

    // Or
    cy.get('.table-toolbar-item-option:nth-of-type(2) > .table-toolbar-item-option-head-select').click()
    cy.findByText('Or').click()
    cy.get('.table-toolbar-item-option:nth-of-type(2) > .table-toolbar-item-option-select:nth-of-type(3)').click()
    cy.focused().type('Is not{Enter}')

    cy.get('.table-block-tbody > .table-block-row').should('have.length', 2)
  })

  it('should filter text data', () => {
    cy.get('.table-block-tbody > .table-block-row').should('have.length', 2)

    cy.findByText('Filter').click()
    cy.findByText('Add a Filter').click()
    cy.findByText('Add a filter').click()
    cy.get('.table-toolbar-item-option-select:first').click()
    cy.focused().type('{Enter}')

    // Is
    cy.get('.table-toolbar-item-option-select:last').click()
    cy.focused().type('Is{Enter}')
    cy.findByPlaceholderText('Value').type('text')

    cy.get('.table-block-tbody > .table-block-row').should('have.length', 1)
    cy.get('.table-block-tbody > .table-block-row .table-block-text-cell').should('contain.text', 'text')

    // Is not
    cy.get('.table-toolbar-item-option-select:last').click()
    cy.focused().type('Is not{Enter}')

    cy.get('.table-block-tbody > .table-block-row').should('have.length', 1)
    cy.get('.table-block-tbody > .table-block-row .table-block-text-cell').should('contain.text', 'text2')

    // Contains
    cy.get('.table-toolbar-item-option-select:last').click()
    cy.focused().type('Contains{Enter}')

    cy.get('.table-block-tbody > .table-block-row').should('have.length', 2)

    // Does not contain
    cy.get('.table-toolbar-item-option-select:last').click()
    cy.focused().type('Does not contain{Enter}')

    cy.get('.table-block-tbody > .table-block-row').should('have.length', 0)

    // Starts with
    cy.get('.table-toolbar-item-option-select:last').click()
    cy.focused().type('Starts with{Enter}')

    cy.get('.table-block-tbody > .table-block-row').should('have.length', 2)

    // Ends with
    cy.get('.table-toolbar-item-option-select:last').click()
    cy.focused().type('Ends with{Enter}')

    cy.get('.table-block-tbody > .table-block-row').should('have.length', 1)
    cy.get('.table-block-tbody > .table-block-row .table-block-text-cell').should('contain.text', 'text')

    // Is empty
    cy.get('.table-toolbar-item-option-select:last').click()
    cy.focused().type('Is empty{Enter}')

    cy.get('.table-block-tbody > .table-block-row').should('have.length', 0)

    // Is not empty
    cy.get('.table-toolbar-item-option-select:last').click()
    cy.focused().type('Is not empty{Enter}')

    cy.get('.table-block-tbody > .table-block-row').should('have.length', 2)
  })

  it('should filter select data', () => {
    cy.get('.table-block-tbody > .table-block-row').should('have.length', 2)

    cy.findByText('Filter').click()
    cy.findByText('Add a Filter').click()
    cy.findByText('Add a filter').click()
    cy.get('.table-toolbar-item-option-select:first').click()
    cy.focused().type('Column1{Enter}')

    // Is
    cy.get('.table-toolbar-item-option-select:nth-of-type(2)').click()
    cy.focused().type('Is{Enter}')
    cy.get('.table-toolbar-item-option-select:nth-of-type(3)').click()
    cy.focused().type('new option 2{Enter}')

    cy.get('.table-block-tbody > .table-block-row').should('have.length', 1)
    cy.get('.table-block-tbody > .table-block-row .table-block-select-cell').should('contain.text', 'new option 2')

    // Is
    cy.get('.table-toolbar-item-option-select:nth-of-type(2)').click()
    cy.focused().type('Is not{Enter}')

    cy.get('.table-block-tbody > .table-block-row').should('have.length', 1)
    cy.get('.table-block-tbody > .table-block-row .table-block-select-cell').should('contain.text', 'new option')

    // Is empty
    cy.get('.table-toolbar-item-option-select:nth-of-type(2)').click()
    cy.focused().type('Is empty{Enter}')

    cy.get('.table-block-tbody > .table-block-row').should('have.length', 0)

    // Is not empty
    cy.get('.table-toolbar-item-option-select:nth-of-type(2)').click()
    cy.focused().type('Is not empty{Enter}')

    cy.get('.table-block-tbody > .table-block-row').should('have.length', 2)
  })
})