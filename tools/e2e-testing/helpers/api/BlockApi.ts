import { blockCommitConverter } from '@/helpers/converter/blockCommitConverter'
import { APIResponse, Page } from '@playwright/test'
import { createBlockConverter } from '@/helpers/converter/createBlockConverter'
import { PageBlock } from '@/helpers/types/data.types'
import { GRAPHQL_GROUP } from './graphql'
import {
  BlockSoftDeleteInput,
  CreateBlockInput,
  InputType,
  OperationName,
  OptionsType,
  PageType
} from '@/helpers/types/graphql.types'
import { compareAttributeItem } from '../utils/sortByAttribute'

export class BlockApi {
  private readonly page
  private readonly request
  private readonly REQUEST_URL = '/$internal-apis/$graph'
  private readonly REQUEST_HEADER

  constructor(page: Page, csrfToken: string) {
    this.page = page
    this.request = page.request
    this.REQUEST_HEADER = {
      'x-csrf-token': csrfToken
    }
  }

  async getUsername(): Promise<string> {
    return await this.page.evaluate(() => (window as any).location.pathname.split('/')[1])
  }

  async pageReload(): Promise<void> {
    await this.page.reload({ waitUntil: 'networkidle' })
  }

  async post(options: OptionsType): Promise<APIResponse> {
    return await this.request.post(this.REQUEST_URL, options)
  }

  options(gqlQuery: string, operationName: OperationName, variables: InputType): OptionsType {
    return {
      data: {
        query: gqlQuery,
        operationName,
        variables
      },
      headers: this.REQUEST_HEADER
    }
  }

  async getBlocks(username: string): Promise<PageType[]> {
    const response = await this.post(
      this.options(GRAPHQL_GROUP.GET_PAGE_BLOCKS, 'GetPageBlocks', {
        domain: username
      })
    )
    return (await response.json()).data.pageBlocks
  }

  async removePage(variables: BlockSoftDeleteInput): Promise<void> {
    await this.post(this.options(GRAPHQL_GROUP.BLOCK_SOFT_DELETE, 'blockSoftDelete', variables))
  }

  async removeAllPages(options?: { isHardDeleted?: boolean; isSorted?: boolean }): Promise<void> {
    const isHardDeleted = options?.isHardDeleted ?? true
    const isSorted = options?.isSorted ?? false

    const username = await this.getUsername()
    const pages = (await this.getBlocks(username)).sort(compareAttributeItem)

    isSorted
      ? await this.orderRemoveAllPage(pages, isHardDeleted)
      : await this.outOfOrderRemoveAllPage(pages, isHardDeleted)
  }

  async orderRemoveAllPage(pages: PageType[], isHardDeleted: boolean): Promise<void> {
    for (let index = 0; index < pages.length; index++) {
      const page = pages[index]

      if (!page.parentId) {
        await this.removePage({ input: { id: page.id, hardDelete: isHardDeleted } })
      }
    }
  }

  async outOfOrderRemoveAllPage(pages: PageType[], isHardDeleted: boolean): Promise<void> {
    await Promise.all(
      pages.map(page =>
        !page.parentId ? this.removePage({ input: { id: page.id, hardDelete: isHardDeleted } }) : undefined
      )
    )
  }

  async createPage(page: PageBlock, parentId?: string): Promise<void> {
    const username = await this.getUsername()
    const id = await this.createPageApi(createBlockConverter(page, username, parentId))
    await this.blockCommit(page, id)
    if (page.children) {
      for (const child of page.children) {
        await this.createPage(child, id)
      }
    }
  }

  async createPageTree(pageTree: PageBlock[]): Promise<void> {
    for (const page of pageTree) {
      await this.createPage(page)
    }
  }

  async createPageApi(variables: CreateBlockInput): Promise<string> {
    const response = await this.post(this.options(GRAPHQL_GROUP.CREATE_BLOCK, 'blockCreate', variables))
    return (await response.json()).data.blockCreate.id
  }

  async blockCommit(page: PageBlock, id: string): Promise<void> {
    const variables = blockCommitConverter(page, id)
    await this.post(this.options(GRAPHQL_GROUP.BLOCK_COMMIT, 'blockCommit', variables))
  }

  async getTrashBlock(username: string, search: string = ''): Promise<PageType[]> {
    const response = await this.post(
      this.options(GRAPHQL_GROUP.GET_TRASH_BLOCKS, 'GetTrashBlocks', {
        domain: username,
        search
      })
    )
    return (await response.json()).data.trashBlocks
  }

  async removeAllTrashPages(): Promise<void> {
    const username = await this.getUsername()
    const pages = (await this.getTrashBlock(username)).map(page => page.id)

    await this.post(this.options(GRAPHQL_GROUP.BLOCK_HARD_DELETE, 'blockHardDelete', { input: { ids: pages } }))
  }
}
