describe('tableBlock', () => {
  beforeEach(() => {
    cy.sessionMock({ email: 'cypress@brickdoc.com' })
  })

  it('should create a table block', () => {
    cy.visit('/')
    cy.get('[contenteditable]').type('/table')
    cy.get('button.slash-menu-item:first').click()
    cy.get('.brickdoc-table-block').should('exist')
  })

  it('should add new column', () => {
    cy.visit('/')
    cy.get('[contenteditable]').type('/table')
    cy.get('button.slash-menu-item:first').click()

    cy.get('.table-block-th:last > button').click()
    cy.findByText('Column1').should('exist')

    cy.get('.table-block-th:last > button').click()
    cy.findByText('Column2').should('exist')
  })

  it('should update column name', () => {
    cy.visit('/')
    cy.get('[contenteditable]').type('/table')
    cy.get('button.slash-menu-item:first').click()

    cy.get('.table-block-th:last > button').click()
    cy.findByText('Column1').click()
    cy.findAllByDisplayValue('Column1').focus().type('NewColumn')
    cy.findByText('NewColumn').should('exist')
  })

  it('should delete column', () => {
    cy.visit('/')
    cy.get('[contenteditable]').type('/table')
    cy.get('button.slash-menu-item:first').click()

    cy.get('.table-block-th:last-child > button').click()
    cy.findByText('Column1').click()
    cy.findByText('Delete').click()
    // confirm
    cy.get('.brk-btn-ok-btn').click()
    cy.findByText('Column1').should('not.exist')
  })

  it('should add new row', () => {
    cy.visit('/')
    cy.get('[contenteditable]').type('/table')
    cy.get('button.slash-menu-item:first').click()
    cy.get('.table-toolbar-add-button').click()

    cy.get('.table-block-tbody > .table-block-row:first').realHover()
    cy.get('.table-block-tbody > .table-block-row:first > .table-block-row-actions > button:first').click()
    cy.get('.table-block-row.active').should('exist')
  })

  it('should edit text cell', () => {
    cy.visit('/')
    cy.get('[contenteditable]').type('/table')
    cy.get('button.slash-menu-item:first').click()
    cy.get('.table-toolbar-add-button').click()

    cy.get('.table-block-text-cell:last').click()
    cy.focused().type('text')
    cy.findByTestId('table-text-overlay').click({ force: true })
    cy.get('.active > .table-block-text-cell').should('exist').should('contain.text', 'text')
  })

  it('should end text cell editing status by press enter', () => {
    cy.visit('/')
    cy.get('[contenteditable]').type('/table')
    cy.get('button.slash-menu-item:first').click()
    cy.get('.table-toolbar-add-button').click()

    cy.get('.table-block-text-cell:last').click()
    cy.focused().type('text{Enter}')
    cy.get('.active > .table-block-text-cell').should('exist').should('contain.text', 'text')
  })

  it('should change cell type to select', () => {
    cy.visit('/')
    cy.get('[contenteditable]').type('/table')
    cy.get('button.slash-menu-item:first').click()
    cy.get('.table-toolbar-add-button').click()

    cy.get('.table-block-th:last > button').click()
    cy.findByText('Column1').click()
    cy.findByText('Text').click()
    cy.findByText('Select').click()
    cy.get('.table-block-select-cell:last').click()
    cy.get('.table-block-select').should('exist')
  })

  it('should create new select option', () => {
    cy.visit('/')
    cy.get('[contenteditable]').type('/table')
    cy.get('button.slash-menu-item:first').click()
    cy.get('.table-toolbar-add-button').click()

    cy.get('.table-block-th:last > button').click()
    cy.findByText('Column1').click()
    cy.findByText('Text').click()
    cy.findByText('Select').click()
    cy.get('.table-block-select-cell:last').click()
    cy.focused().type('new option{Enter}')

    cy.get('.select-cell-option-item').should('have.length', 1)
  })

  it('should select option', () => {
    cy.visit('/')
    cy.get('[contenteditable]').type('/table')
    cy.get('button.slash-menu-item:first').click()
    cy.get('.table-toolbar-add-button').click()

    cy.get('.table-block-th:last > button').click()
    cy.findByText('Column1').click()
    cy.findByText('Text').click()
    cy.findByText('Select').click()
    cy.get('.table-block-select-cell:last').click()

    cy.focused().type('new option{Enter}')
    cy.focused().type('new option 2{Enter}')
    cy.findByText('new option').click()
    cy.findByTestId('table-select-overlay').click()
    cy.get('.active > .table-block-select-cell').should('exist').should('contain.text', 'new option')
  })

  it('should filter select option', () => {
    cy.visit('/')
    cy.get('[contenteditable]').type('/table')
    cy.get('button.slash-menu-item:first').click()
    cy.get('.table-toolbar-add-button').click()

    cy.get('.table-block-th:last > button').click()
    cy.findByText('Column1').click()
    cy.findByText('Text').click()
    cy.findByText('Select').click()
    cy.get('.table-block-select-cell:last').click()
    cy.focused().type('new option{Enter}')
    cy.focused().type('new option 2{Enter}')
    cy.focused().type('new option 2')
    cy.get('.select-cell-option-item').should('have.length', 1)
  })
})