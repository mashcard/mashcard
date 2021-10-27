import { TEST_ID_ENUM } from '@brickdoc/test-helper'

describe('linkBlock', () => {
  beforeEach(() => {
    cy.sessionMock({ email: 'cypress@brickdoc.com' })
  })

  describe('external link', () => {
    it('embeds link by input link', () => {
      cy.visit('/')
      cy.addBlock('embed')
      cy.findByTestId(TEST_ID_ENUM.editor.linkBlock.addButton.id).click()
      cy.findByTestId(TEST_ID_ENUM.uploader.Dashboard.modules.link.input.id).focus().type('https://www.brickdoc.com')
      cy.findByTestId(TEST_ID_ENUM.uploader.Dashboard.modules.link.button.id).click()
      cy.findByTestId(TEST_ID_ENUM.editor.linkBlock.link.id).should('exist')
    })

    it("deletes link block by click 'Delete' button", () => {
      cy.visit('/')
      cy.addBlock('embed')
      cy.findByTestId(TEST_ID_ENUM.editor.linkBlock.addButton.id).click()
      cy.findByTestId(TEST_ID_ENUM.uploader.Dashboard.modules.link.input.id).focus().type('https://www.brickdoc.com')
      cy.findByTestId(TEST_ID_ENUM.uploader.Dashboard.modules.link.button.id).click()
      cy.findByTestId(TEST_ID_ENUM.editor.linkBlock.link.id).realHover()
      cy.findByTestId(TEST_ID_ENUM.editor.linkBlock.menuButton.id).click()
      cy.findByTestId(TEST_ID_ENUM.editor.linkBlock.deleteButton.id).click()
      cy.get('.brk-modal-confirm-btns > .brk-btn:first').click()
      cy.findByTestId(TEST_ID_ENUM.editor.linkBlock.link.id).should('not.exist')
    })

    it('copies link by clicking Copy button', () => {
      cy.visit('/', {
        onBeforeLoad(win: Window): void {
          cy.spy(win.navigator.clipboard, 'writeText').as('copy')
        }
      })
      const link = 'https://www.brickdoc.com'
      cy.addBlock('embed')
      cy.findByTestId(TEST_ID_ENUM.editor.linkBlock.addButton.id).click()
      cy.findByTestId(TEST_ID_ENUM.uploader.Dashboard.modules.link.input.id).focus().type(link)
      cy.findByTestId(TEST_ID_ENUM.uploader.Dashboard.modules.link.button.id).click()
      cy.findByTestId(TEST_ID_ENUM.editor.linkBlock.link.id).realHover()
      cy.findByTestId(TEST_ID_ENUM.editor.linkBlock.menuButton.id).click()
      cy.findByTestId(TEST_ID_ENUM.editor.linkBlock.copyButton.id).click()
      cy.get('@copy').should('be.calledWithExactly', link)
    })

    it('opens link by click link block', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.stub(win, 'open')
        }
      })
      const link = 'https://www.brickdoc.com'
      cy.addBlock('embed')
      cy.findByTestId(TEST_ID_ENUM.editor.linkBlock.addButton.id).click()
      cy.findByTestId(TEST_ID_ENUM.uploader.Dashboard.modules.link.input.id).focus().type(link)
      cy.findByTestId(TEST_ID_ENUM.uploader.Dashboard.modules.link.button.id).click()
      cy.findByTestId(TEST_ID_ENUM.editor.linkBlock.link.id).click()
      cy.window().its('open').should('be.calledWithExactly', link, '_blank')
    })
  })

  // TODO: Failed on CI for no reason
  // eslint-disable-next-line jest/no-disabled-tests
  describe.skip('attachment file', () => {
    it('should upload attachment successfully', () => {
      cy.visit('/')
      cy.get('[contenteditable]').type('/embed')
      cy.get('button.slash-menu-item:first').click()
      cy.findByText('Embed anything').click()
      cy.findByText('Upload').click()
      cy.get('input[type=file]').attachFile('images/test.png')
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000)
      cy.findByText('test.png').should('exist')
    })
  })
})
