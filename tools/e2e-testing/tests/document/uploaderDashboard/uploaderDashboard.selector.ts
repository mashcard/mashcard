import { CoverTab } from '@/tests/document/cover/cover.selector'
import { IconTab } from '@/tests/document/icon/icon.selector'

export type TabType = IconTab | CoverTab

export const UPLOADER_DASHBOARD_SELECTOR = {
  tabButton: (tab: TabType) => `.uploader-dashboard-navbar button:has-text("${tab}")`,
  uploadImageButton: '.dashboard-upload-file-input',
  linkInput: 'div[data-testid=uploader-dashboard-modules-link-input] input',
  linkSubmitButton: '[data-testid=uploader-dashboard-modules-link-button]',
  invalidUrlTooltip: 'span:has-text("Invalid image url")',
  removeButton: '.uploader-dashboard-action-buttons button:has-text("Remove")'
}
