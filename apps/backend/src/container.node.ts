/** Node entry point — singleton connection pool, winston logger. */

import postgres from 'postgres'
import { bootstrapContainer } from './container.js'
import { createNodeDbProvider } from './core/db/node-provider.js'
import { WinstonLogger } from './core/logger/winston-logger.js'
import { env } from './env.js'

const client = postgres(env.DATABASE_URL, { prepare: false })
const dbProvider = createNodeDbProvider(client)
const logger = new WinstonLogger()

export const container = await bootstrapContainer({ logger, dbProvider })
