import type { Column, InferInsertModel, InferSelectModel, SQL } from 'drizzle-orm'
import { and, asc, count, desc, eq, getTableColumns, inArray, isNull } from 'drizzle-orm'
import type { PgTable } from 'drizzle-orm/pg-core'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { AppError, ErrorTypes } from '../errors/app-error.js'
import { dbErrorMapper } from '../errors/db-error-mapper.js'
import type { FindConfig, OperatorMap } from '../types/common.js'
import type { Context } from '../types/context.js'
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

export function BaseRepository<TTable extends PgTable & BaseColumns>(table: TTable) {
  type Select = InferSelectModel<TTable>
  type Insert = InferInsertModel<TTable>

  class Repository {
    #db: PostgresJsDatabase
    protected readonly table: TTable = table

    constructor({ db }: { db: PostgresJsDatabase }) {
      this.#db = db
    }

    // biome-ignore lint/suspicious/noExplicitAny: drizzle's dynamic query builder requires untyped access
    protected getClient(context?: Context): any {
      return (context?.transaction as PostgresJsDatabase) ?? this.#db
    }

    private buildWhere(filters?: EntityFilters<Select>, config?: FindConfig<Select>): SQL | undefined {
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

    async find(filters?: EntityFilters<Select>, config?: FindConfig<Select>, context?: Context): Promise<Select[]> {
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
      return rows as Select[]
    }

    async findById(id: string, config?: FindConfig<Select>, context?: Context): Promise<Select | null> {
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
      return (rows[0] as Select) ?? null
    }

    async findByIdOrFail(id: string, config?: FindConfig<Select>, context?: Context): Promise<Select> {
      const entity = await this.findById(id, config, context)
      if (!entity) {
        throw new AppError({
          type: ErrorTypes.NOT_FOUND,
          message: `Entity with id "${id}" not found`,
        })
      }
      return entity
    }

    async findAndCount(
      filters?: EntityFilters<Select>,
      config?: FindConfig<Select>,
      context?: Context,
    ): Promise<[Select[], number]> {
      const [rows, countResult] = await Promise.all([
        this.find(filters, config, context),
        this.countRows(filters, config, context),
      ])
      return [rows, countResult]
    }

    private async countRows(
      filters?: EntityFilters<Select>,
      config?: FindConfig<Select>,
      context?: Context,
    ): Promise<number> {
      const client = this.getClient(context)

      let query = client.select({ count: count() }).from(this.table)

      const where = this.buildWhere(filters, config)
      if (where) query = query.where(where)

      const result = await query
      return result[0]?.count ?? 0
    }

    async create(data: Insert, context?: Context): Promise<Select> {
      const client = this.getClient(context)
      const rows = await client.insert(this.table).values(data).returning()
      return rows[0] as Select
    }

    async createMany(data: Insert[], context?: Context): Promise<Select[]> {
      if (data.length === 0) return []
      const client = this.getClient(context)
      const rows = await client.insert(this.table).values(data).returning()
      return rows as Select[]
    }

    async update(ids: string[], data: Partial<Insert>, context?: Context): Promise<Select[]> {
      if (ids.length === 0) return []
      const client = this.getClient(context)
      const rows = await client
        .update(this.table)
        .set(data)
        .where(and(inArray(this.table.id, ids), isNull(this.table.deleted_at)))
        .returning()
      return rows as Select[]
    }

    async delete(ids: string[], context?: Context): Promise<void> {
      if (ids.length === 0) return
      const client = this.getClient(context)
      await client.delete(this.table).where(inArray(this.table.id, ids))
    }

    async softDelete(ids: string[], context?: Context): Promise<void> {
      if (ids.length === 0) return
      const client = this.getClient(context)
      await client
        .update(this.table)
        .set({ deleted_at: new Date() })
        .where(and(inArray(this.table.id, ids), isNull(this.table.deleted_at)))
    }

    async restore(ids: string[], context?: Context): Promise<void> {
      if (ids.length === 0) return
      const client = this.getClient(context)
      await client.update(this.table).set({ deleted_at: null }).where(inArray(this.table.id, ids))
    }
  }

  return new Proxy(Repository, {
    construct(Target, args, newTarget) {
      const instance = Reflect.construct(Target, args, newTarget)
      return new Proxy(instance, {
        get(target, prop, receiver) {
          const val = Reflect.get(target, prop, receiver)
          if (typeof val !== 'function') return val
          return (...fnArgs: unknown[]) => {
            const result = (val as (...a: unknown[]) => unknown).apply(target, fnArgs)
            if (result instanceof Promise) {
              return result.catch(dbErrorMapper)
            }
            return result
          }
        },
      })
    },
  })
}
