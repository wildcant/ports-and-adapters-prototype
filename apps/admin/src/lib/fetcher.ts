import qs from 'qs'
import { env } from '#/env'

export const fetcher = async <T>({
  url,
  method,
  params,
  data,
  headers,
  signal,
}: {
  url: string
  method: string
  params?: Record<string, unknown> | undefined
  data?: unknown
  headers?: Record<string, string> | undefined
  signal?: AbortSignal | undefined
}): Promise<T> => {
  const target = new URL(url, env.VITE_BACKEND_URL)

  if (params) {
    target.search = qs.stringify(params, { skipNulls: true })
  }

  const init: RequestInit = { method }
  if (data) {
    init.headers = { 'Content-Type': 'application/json', ...headers }
    init.body = JSON.stringify(data)
  } else if (headers) {
    init.headers = headers
  }
  if (signal) init.signal = signal

  const response = await fetch(target, init)

  if (!response.ok) {
    throw new Error(`${method} ${url} failed: ${response.status}`)
  }

  if ([204, 205, 304].includes(response.status)) return {} as T
  return response.json()
}

export type ErrorType<E> = E
export type BodyType<B> = B
