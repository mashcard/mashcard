import * as fs from 'fs'
import * as path from 'path'
import { BrowserContext } from '@playwright/test'
import { FixtureReturnType } from '@/helpers/types/fixture.types'
import { generateUUID } from '@/helpers/utils/uuid'

const istanbulCLIOutput = path.join(process.cwd(), '.nyc_output')

export function coverageFixture(): FixtureReturnType<BrowserContext> {
  return async ({ context }, use): Promise<void> => {
    await context.addInitScript(() =>
      window.addEventListener('beforeunload', () =>
        (window as any).collectIstanbulCoverage(JSON.stringify((window as any).__coverage__))
      )
    )
    await fs.promises.mkdir(istanbulCLIOutput, { recursive: true })
    await context.exposeFunction('collectIstanbulCoverage', (coverageJSON: string) => {
      if (coverageJSON)
        fs.writeFileSync(path.join(istanbulCLIOutput, `playwright_coverage_${generateUUID()}.json`), coverageJSON)
    })
    await use(context)
    for (const page of context.pages()) {
      await page.evaluate(() => (window as any).collectIstanbulCoverage(JSON.stringify((window as any).__coverage__)))
    }
  }
}
