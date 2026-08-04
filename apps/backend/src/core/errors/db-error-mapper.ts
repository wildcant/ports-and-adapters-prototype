import { AppError, ErrorTypes } from './app-error.js'

interface PgError {
  code?: string
  detail?: string
  // biome-ignore lint/style/useNamingConvention: Postgres wire protocol field name
  constraint_name?: string
  column?: string
  // biome-ignore lint/style/useNamingConvention: Postgres wire protocol field name
  table_name?: string
}

function isPgError(err: unknown): err is PgError & Error {
  return err instanceof Error && 'code' in err
}

const getConstraintInfo = (err: PgError) => {
  const detail = err.detail
  if (!detail) {
    return null
  }

  const [keys, values] = detail.match(/\([^(]*\)/g) || []

  if (!keys || !values) {
    return null
  }

  return {
    table: err.table_name?.split('_').join(' ') ?? 'unknown',
    keys: keys
      .substring(1, keys.length - 1)
      .split(',')
      .map((k) => k.trim()),
    values: values
      .substring(1, values.length - 1)
      .split(',')
      .map((v) => v.trim()),
  }
}

export function dbErrorMapper(err: unknown): never {
  if (AppError.isError(err)) {
    throw err
  }

  if (!isPgError(err)) {
    throw err
  }

  switch (err.code) {
    // unique_violation
    case '23505': {
      const info = getConstraintInfo(err)
      const message = info
        ? `${info.table}: ${info.keys.map((k, i) => `${k} "${info.values[i] ?? ''}"`).join(', ')} already exists`
        : 'Already exists'
      throw new AppError({
        type: ErrorTypes.DUPLICATE_ERROR,
        message,
      })
    }
    // not_null_violation
    case '23502': {
      const column = err.column || 'unknown'
      throw new AppError({
        type: ErrorTypes.INVALID_DATA,
        message: `Cannot be null: ${column}`,
      })
    }
    // foreign_key_violation
    case '23503': {
      throw new AppError({
        type: ErrorTypes.NOT_FOUND,
        message: 'Referenced entity does not exist',
      })
    }
    // undefined_column
    case '42703': {
      throw new AppError({
        type: ErrorTypes.INVALID_DATA,
        message: 'Invalid field referenced',
      })
    }
    default:
      throw err
  }
}
