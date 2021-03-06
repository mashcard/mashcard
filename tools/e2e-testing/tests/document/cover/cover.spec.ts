import { UPLOADER_DATA } from '@/tests/document/uploaderDashboard/uploaderDashboard.data'
import { test, expect } from '@/fixtures'
import { DocumentTitlePage } from '@/tests/document/documentTitle/documentTitle.page'
import { PageTreePage } from '@/tests/sidebar/pageTree/pageTree.page'
import path from 'path'
import { INITIAL_PAGE } from '@/tests/common/common.data'
import { COMMON_SELECTORS } from '@/tests/common/common.selector'
import { CoverPage } from './cover.page'
import { CoverTab } from './cover.selector'

test.describe('Add Cover', () => {
  let cover: CoverPage
  let pageTree: PageTreePage
  let documentTitle: DocumentTitlePage

  test.beforeEach(async ({ api, page }) => {
    pageTree = new PageTreePage(page)
    documentTitle = new DocumentTitlePage(page)

    await api.removeAllPages()
    await api.createPage(INITIAL_PAGE)
    await api.pageReload()
    await pageTree.clickPage()
    cover = await documentTitle.openCoverPopup()
  })

  test.describe('Cover popup', async () => {
    test('Verify cover popup is in viewport', ({ pageExtend }) => {
      expect(pageExtend.isInViewPort(COMMON_SELECTORS.tooltip)).toBeTruthy()
    })

    test('Verify popup will be closed when click out of popup', async () => {
      await documentTitle.getArticle().click({ position: { x: 10, y: 10 } })

      await expect(cover.getTooltip()).not.toBeVisible()
    })

    test('Verify select cover will close popup when has not cover', async () => {
      await cover.addCover()

      await expect(cover.getTooltip()).not.toBeVisible()
    })

    test('Verify select cover will not close popup when has cover', async () => {
      await cover.addCover()
      await documentTitle.changeCover()

      await cover.addCover(1)

      await expect(cover.getTooltip()).toBeVisible()
    })
  })

  test.describe('Cover Tab', async () => {
    const ACTIVE_CLASS = /active/

    test('Verify focused on Unsplash Tab by default', async () => {
      await expect(cover.getTab(CoverTab.Unsplash)).toHaveClass(ACTIVE_CLASS)
    })

    test('Verify toggle Tab is working well', async () => {
      await cover.switchTab(CoverTab.Upload)

      await expect(cover.getTab(CoverTab.Unsplash)).not.toHaveClass(ACTIVE_CLASS)
      await expect(cover.getTab(CoverTab.Upload)).toHaveClass(ACTIVE_CLASS)

      await cover.switchTab(CoverTab.Link)

      await expect(cover.getTab(CoverTab.Upload)).not.toHaveClass(ACTIVE_CLASS)
      await expect(cover.getTab(CoverTab.Link)).toHaveClass(ACTIVE_CLASS)
    })
  })

  test.describe('Unsplash', async () => {
    test('Verify it will show responding image when search by name', async () => {
      await cover.searchImage('work')

      await expect(cover.getUnsplashImageByIndex()).toBeVisible()
    })

    test('Verify image can be added as cover', async () => {
      await cover.addCover()

      await expect(documentTitle.getPageCover()).toHaveAttribute('src', /https:*/)
    })
  })

  // CORS issue, blocked by: https://github.com/pleisto/corp/issues/1637
  test.skip('Upload an Image', async () => {
    test('Verify cover will be added when upload an image', async () => {
      await cover.switchTab(CoverTab.Upload)

      await cover.uploadImage(path.join(__dirname, './cover.data.jpg'))

      await expect(documentTitle.getPageCover()).toHaveAttribute('src', /https:*/)
    })
  })

  test.describe('Link', async () => {
    test('Verify will show error tooltip when paste invalid image url', async () => {
      await cover.switchTab(CoverTab.Link)
      await cover.pasteImageLink(UPLOADER_DATA.INVALID_URL)

      await expect(cover.getErrorTooltip()).toBeVisible()
    })

    test('Verify cover will be added when paste valid image url', async () => {
      await cover.switchTab(CoverTab.Link)
      await cover.pasteImageLink(UPLOADER_DATA.CORRECT_URL)

      await expect(documentTitle.getPageCover()).toHaveAttribute('src', /https:*/)
    })
  })

  test.describe('Cover Remove', async () => {
    test('Verify Remove button is not shown when no cover', async () => {
      await expect(cover.getRemoveButton()).not.toBeVisible()
    })

    test('Verify cover will be removed when click remove button', async () => {
      await cover.addCover()
      await documentTitle.changeCover()

      await cover.remove()

      await expect(cover.getTooltip()).not.toBeVisible()
      await expect(documentTitle.getPageCover()).not.toBeVisible()
    })
  })
})
