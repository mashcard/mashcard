import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { env } from 'process'
import { BrickdocBaseError } from '../../common/errors'
import { currentMigrator } from '../../cli/utils'

export const initCheckRegister = async (_app: NestFastifyApplication): Promise<void> => {
  // Check required environment variables are set
  const missedEnvVars = ['NODE_ENV', 'REDIS_URL', 'SECRET_KEY_SEED', 'DATABASE_URL_BASE', 'DATABASE_NAME'].filter(
    // eslint-disable-next-line no-prototype-builtins
    key => !env.hasOwnProperty(key)
  )
  if (missedEnvVars.length > 0) throw new BrickdocBaseError('apiSrv.core.MISSING_REQUIRED_ENVS', `${missedEnvVars}`)

  // Check pending db migrations
  const migrator = await currentMigrator()
  const pendingMigrations = await migrator.pending()
  if (pendingMigrations.length !== 0)
    throw new BrickdocBaseError('apiSrv.core.DB_MIGRATIONS_PENDING', `${pendingMigrations.map(m => m.name).join(', ')}`)
}
