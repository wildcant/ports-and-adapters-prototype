import { container } from '../container.js'

type RouteHandler = (req: never) => Promise<{ status: number; json: unknown }>

type ExtractJson<H> = H extends (req: never) => Promise<{ json: infer J }> ? J : never

type RequestMapping = (data: Record<string, never>) => {
  params?: Record<string, string>
  query?: Record<string, string | string[]>
  body?: unknown
}

export const apiCall =
  <H extends RouteHandler>(handler: H, map?: RequestMapping) =>
  async (args?: { data?: unknown }): Promise<ExtractJson<H>> => {
    const mapped = map ? map(args?.data as never) : { body: args?.data }
    const result = await handler({
      scope: container.createScope(),
      params: mapped.params ?? {},
      query: mapped.query ?? {},
      body: mapped.body,
    } as never)
    return result.json as ExtractJson<H>
  }
