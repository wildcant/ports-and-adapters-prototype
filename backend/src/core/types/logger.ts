export interface Logger {
  error(messageOrError: string | Error, error?: Error): void
  warn(message: string): void
  info(message: string): void
  http(message: string): void
  debug(message: string): void
  setLogLevel(level: string): void
  shouldLog(level: string): boolean
}
