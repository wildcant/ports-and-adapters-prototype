import { AppError, ErrorTypes } from './app-error.js'

interface PgError {
  code?: string
  detail?: string
  constraint_name?: string
  column?: string
  table_name?: string
}

function isPgError(err: unknown): err is PgError & Error {
  return err instanceof Error && 'code' in err
}

function getConstraintInfo(detail?: string): string {
  if (!detail) return ''
  // "Key (email)=(foo@bar.com) already exists."
  const match = detail.match(/Key \(([^)]+)\)=\(([^)]+)\)/)
  if (match) return `${match[1]} = ${match[2]}`
  return detail
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
      const info = getConstraintInfo(err.detail)
      const constraint = err.constraint_name ? ` (constraint: ${err.constraint_name})` : ''
      throw new AppError({
        type: ErrorTypes.INVALID_DATA,
        message: info ? `Already exists: ${info}${constraint}` : `Already exists${constraint}`,
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
      console.error('Undefined column:', err.message)
      throw new AppError({
        type: ErrorTypes.INVALID_DATA,
        message: 'Invalid field referenced',
      })
    }
    default:
      throw err
  }
}
