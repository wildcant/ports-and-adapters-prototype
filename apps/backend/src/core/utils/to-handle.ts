export const toHandle = (value: string): string => {
  let handle = value
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (!handle) {
    handle = `product-${Math.random().toString(36).substring(2, 8)}`
  }

  return handle
}
