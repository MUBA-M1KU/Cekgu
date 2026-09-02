import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from '../env'

export const pool = new Pool({ connectionString: env.databaseUrl, max: 10 })

export const db = drizzle(pool)
