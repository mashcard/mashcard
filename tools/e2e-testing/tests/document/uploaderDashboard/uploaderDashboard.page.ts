import { Locator } from '@playwright/test'
import { CommonPage } from '@/tests/common/common.page'
import { TabType, UPLOADER_DASHBOARD_SELECTOR } from './uploaderDashboard.selector'

export class UploaderDashboardPage extends CommonPage {
  getTab(tabName: TabType): Locator {
    return this.page.locator(UPLOADER_DASHBOARD_SELECTOR.tabButton(tabName))
  }

  getUploadImageButton(): Locator {
    return this.page.locator(UPLOADER_DASHBOARD_SELECTOR.uploadImageButton)
  }

  getLinkInput(): Locator {
    return this.page.locator(UPLOADER_DASHBOARD_SELECTOR.linkInput)
  }

  getLinkSubmitButton(): Locator {
    return this.page.locator(UPLOADER_DASHBOARD_SELECTOR.linkSubmitButton)
  }

  getErrorTooltip(): Locator {
    return this.page.locator(UPLOADER_DASHBOARD_SELECTOR.invalidUrlTooltip)
  }

  getRemoveButton(): Locator {
    return this.page.locator(UPLOADER_DASHBOARD_SELECTOR.removeButton)
  }

  async switchTab(tabName: TabType): Promise<void> {
    await this.getTab(tabName).click()
  }

  async uploadImage(path: string): Promise<void> {
    await this.waitForResponseWithAction('blockCommit', this.getUploadImageButton().setInputFiles(path))
  }

  async pasteImageLink(link: string): Promise<void> {
    await this.getLinkInput().fill(link)
    await this.getLinkSubmitButton().click()
  }

  async remove(): Promise<void> {
    await this.getRemoveButton().click()
  }
}
