export type SubmitFormParams<T = undefined> = {
  onSuccess?: T extends undefined ? () => void : (params: T) => void
  onError?: (error: string) => void
  onSettled?: () => void
}
