export enum ErrorTypes {
  NOT_FOUND = 'not_found',
  INVALID_DATA = 'invalid_data',
  NOT_ALLOWED = 'not_allowed',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  CONFLICT = 'conflict',
  DUPLICATE_ERROR = 'duplicate_error',
  DB_ERROR = 'db_error',
  UNEXPECTED_STATE = 'unexpected_state',
  INVALID_ARGUMENT = 'invalid_argument',
}

export class AppError extends Error {
  __isAppError = true
  type: ErrorTypes
  code?: string
  date: Date

  constructor(opts: { type: ErrorTypes; message: string; code?: string }) {
    super(opts.message)
    this.type = opts.type
    this.code = opts.code
    this.date = new Date()
  }

  static Types = ErrorTypes

  static isError(err: unknown): err is AppError {
    return typeof err === 'object' && err !== null && '__isAppError' in err && (err as AppError).__isAppError === true
  }
}
