import { PAGE_SELECTOR } from '@/selectors/sidebar'
import { Locator } from '@playwright/test'
import { BasePage } from '../BasePage'

type ActionButton = 'Pin page' | 'Copy link' | 'Duplicate' | 'Rename' | 'Delete'

export class PageListPage extends BasePage {
  getPageSectionTitle(): Locator {
    return this.page.locator(PAGE_SELECTOR.pageSection)
  }

  getAddSubPageButton(index: number = 0): Locator {
    return this.page.locator(PAGE_SELECTOR.addSubPageButton(index))
  }

  getPageByIndex(index: number = 0): Locator {
    return this.page.locator(PAGE_SELECTOR.pageItem(index))
  }

  getSubPage(index: number = 0): Locator {
    return this.page.locator(PAGE_SELECTOR.pageIndent(index))
  }

  getMoreActionIcon(index: number = 0): Locator {
    return this.page.locator(PAGE_SELECTOR.moreActionIcon(index))
  }

  getMoreButtonByText(actionButton: ActionButton, index: number = 0): Locator {
    return this.page.locator(PAGE_SELECTOR.actionButton(actionButton, index))
  }

  getArrow(index: number = 0): Locator {
    return this.page.locator(PAGE_SELECTOR.arrow(index))
  }

  async clickPage(index: number = 0): Promise<void> {
    await this.waitForResponseWithAction('GetBlockInfo', this.getPageByIndex(index).click())
  }

  async expandArrow(index: number = 0): Promise<void> {
    const arrowClass = await this.getArrow(index).getAttribute('class')
    if (!arrowClass?.includes('-isExpanded-true')) {
      await this.getArrow(index).click()
    }
  }

  async addPage(): Promise<void> {
    await this.waitForResponseWithAction('GetPageBlocks', this.page.locator(PAGE_SELECTOR.addPageButton).click())
  }

  async addSubPage(index: number = 0): Promise<void> {
    await this.getPageByIndex(index).hover()
    await this.waitForResponseWithAction('GetPageBlocks', this.getAddSubPageButton(index).click())
    await this.expandArrow()
  }

  async removePage(index: number = 0): Promise<void> {
    await this.getPageByIndex(index).hover()
    await this.getMoreActionIcon(index).click()
    await this.waitForResponseWithAction('GetPageBlocks', this.getMoreButtonByText('Delete', index).click())
  }

  async renamePage(pageName: string, index: number = 0): Promise<void> {
    await this.getPageByIndex(index).hover()
    await this.getMoreActionIcon(index).click()
    await this.getMoreButtonByText('Rename', index).click()
    await this.page.fill(PAGE_SELECTOR.renameInput, pageName)
    await this.waitForResponseWithAction('GetPageBlocks', this.page.press(PAGE_SELECTOR.renameInput, 'Enter'))
  }
}