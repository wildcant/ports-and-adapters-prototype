import type { Column, InferInsertModel, InferSelectModel, SQL } from 'drizzle-orm'
import { and, asc, count, desc, eq, getTableColumns, isNull } from 'drizzle-orm'
import type { PgTable } from 'drizzle-orm/pg-core'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type { FindConfig, OperatorMap } from '../types/common.js'
import type { SharedContext } from '../types/shared-context.js'
import type { FilterRecord } from './build-filters.js'
import { buildFilters } from './build-filters.js'

type BaseColumns = {
  id: Column
  deleted_at: Column
}

/** Derive a type-safe filter shape from the entity's select model */
export type EntityFilters<T> = {
  [K in keyof T]?: T[K] | OperatorMap<T[K]> | T[K][] | null
} & {
  $and?: EntityFilters<T>[]
  $or?: EntityFilters<T>[]
}

export class BaseRepository<TTable extends PgTable & BaseColumns> {
  protected db: PostgresJsDatabase
  protected readonly table: TTable

  constructor(db: PostgresJsDatabase, table: TTable) {
    this.db = db
    this.table = table
  }

  // biome-ignore lint/suspicious/noExplicitAny: drizzle's dynamic query builder requires untyped access
  protected getClient(context?: SharedContext): any {
    return (context?.transaction as PostgresJsDatabase) ?? this.db
  }

  private buildWhere(
    filters?: EntityFilters<InferSelectModel<TTable>>,
    config?: FindConfig<InferSelectModel<TTable>>,
  ): SQL | undefined {
    const columns = getTableColumns(this.table)
    const parts: SQL[] = []

    if (!config?.withDeleted) {
      parts.push(isNull(this.table.deleted_at))
    }

    if (filters) {
      const filterSql = buildFilters(filters as FilterRecord, columns as Record<string, Column>)
      if (filterSql) parts.push(filterSql)
    }

    return parts.length ? and(...parts) : undefined
  }

  async find(
    filters?: EntityFilters<InferSelectModel<TTable>>,
    config?: FindConfig<InferSelectModel<TTable>>,
    context?: SharedContext,
  ): Promise<InferSelectModel<TTable>[]> {
    const client = this.getClient(context)
    const columns = getTableColumns(this.table)

    const selectObj = config?.select
      ? Object.fromEntries((config.select as string[]).map((k) => [k, columns[k]]).filter(([, v]) => v))
      : undefined

    let query = selectObj ? client.select(selectObj).from(this.table) : client.select().from(this.table)

    const where = this.buildWhere(filters, config)
    if (where) query = query.where(where)

    if (config?.order) {
      const clauses = Object.entries(config.order)
        .map(([key, dir]) => (columns[key] ? (dir === 'DESC' ? desc(columns[key]) : asc(columns[key])) : null))
        .filter(Boolean)
      if (clauses.length) query = query.orderBy(...clauses)
    }

    if (config?.take != null) query = query.limit(config.take)
    if (config?.skip != null) query = query.offset(config.skip)

    const rows = await query
    return rows as InferSelectModel<TTable>[]
  }

  async findById(
    id: string,
    config?: FindConfig<InferSelectModel<TTable>>,
    context?: SharedContext,
  ): Promise<InferSelectModel<TTable> | null> {
    const client = this.getClient(context)
    const columns = getTableColumns(this.table)

    const selectObj = config?.select
      ? Object.fromEntries((config.select as string[]).map((k) => [k, columns[k]]).filter(([, v]) => v))
      : undefined

    const idFilter = config?.withDeleted
      ? eq(this.table.id, id)
      : and(eq(this.table.id, id), isNull(this.table.deleted_at))

    const query = selectObj
      ? client.select(selectObj).from(this.table).where(idFilter)
      : client.select().from(this.table).where(idFilter)

    const rows = await query
    return (rows[0] as InferSelectModel<TTable>) ?? null
  }

  async findAndCount(
    filters?: EntityFilters<InferSelectModel<TTable>>,
    config?: FindConfig<InferSelectModel<TTable>>,
    context?: SharedContext,
  ): Promise<[InferSelectModel<TTable>[], number]> {
    const [rows, countResult] = await Promise.all([
      this.find(filters, config, context),
      this.countRows(filters, config, context),
    ])
    return [rows, countResult]
  }

  private async countRows(
    filters?: EntityFilters<InferSelectModel<TTable>>,
    config?: FindConfig<InferSelectModel<TTable>>,
    context?: SharedContext,
  ): Promise<number> {
    const client = this.getClient(context)

    let query = client.select({ count: count() }).from(this.table)

    const where = this.buildWhere(filters, config)
    if (where) query = query.where(where)

    const result = await query
    return result[0]?.count ?? 0
  }

  async create(data: InferInsertModel<TTable>, context?: SharedContext): Promise<InferSelectModel<TTable>> {
    const client = this.getClient(context)
    const rows = await client.insert(this.table).values(data).returning()
    return rows[0] as InferSelectModel<TTable>
  }

  async createMany(data: InferInsertModel<TTable>[], context?: SharedContext): Promise<InferSelectModel<TTable>[]> {
    if (data.length === 0) return []
    const client = this.getClient(context)
    const rows = await client.insert(this.table).values(data).returning()
    return rows as InferSelectModel<TTable>[]
  }

  async update(
    id: string,
    data: Partial<InferInsertModel<TTable>>,
    context?: SharedContext,
  ): Promise<InferSelectModel<TTable>> {
    const client = this.getClient(context)
    const rows = await client
      .update(this.table)
      .set(data)
      .where(and(eq(this.table.id, id), isNull(this.table.deleted_at)))
      .returning()
    if (!rows[0]) throw new Error(`Entity with id "${id}" not found`)
    return rows[0] as InferSelectModel<TTable>
  }

  async delete(id: string, context?: SharedContext): Promise<void> {
    const client = this.getClient(context)
    await client.delete(this.table).where(eq(this.table.id, id))
  }

  async softDelete(id: string, context?: SharedContext): Promise<void> {
    const client = this.getClient(context)
    const rows = await client
      .update(this.table)
      .set({ deleted_at: new Date() })
      .where(and(eq(this.table.id, id), isNull(this.table.deleted_at)))
      .returning()
    if (!rows[0]) throw new Error(`Entity with id "${id}" not found`)
  }

  async restore(id: string, context?: SharedContext): Promise<void> {
    const client = this.getClient(context)
    const rows = await client.update(this.table).set({ deleted_at: null }).where(eq(this.table.id, id)).returning()
    if (!rows[0]) throw new Error(`Entity with id "${id}" not found`)
  }
}
