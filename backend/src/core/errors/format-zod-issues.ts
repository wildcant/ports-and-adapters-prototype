interface ZodIssueBase {
  code: string
  path: (string | number)[]
  message: string
}

interface InvalidTypeIssue extends ZodIssueBase {
  code: 'invalid_type'
  expected: string
}

interface InvalidValueIssue extends ZodIssueBase {
  code: 'invalid_value'
  values: unknown[]
}

interface UnrecognizedKeysIssue extends ZodIssueBase {
  code: 'unrecognized_keys'
  keys: string[]
}

interface TooSmallIssue extends ZodIssueBase {
  code: 'too_small'
  minimum: number
  inclusive: boolean
  origin: string
}

interface TooBigIssue extends ZodIssueBase {
  code: 'too_big'
  maximum: number
  inclusive: boolean
  origin: string
}

type ZodIssue =
  | InvalidTypeIssue
  | InvalidValueIssue
  | UnrecognizedKeysIssue
  | TooSmallIssue
  | TooBigIssue
  | ZodIssueBase

function formatPath(path: (string | number)[]): string {
  return path.join('.')
}

function formatIssue(issue: ZodIssue): string {
  const path = formatPath(issue.path)
  const prefix = path ? `${path}: ` : ''

  switch (issue.code) {
    case 'invalid_type': {
      const typed = issue as InvalidTypeIssue
      return `${prefix}Expected ${typed.expected}, received ${issue.message.match(/received (\w+)/)?.[1] ?? 'invalid value'}`
    }
    case 'invalid_value': {
      const typed = issue as InvalidValueIssue
      const options = typed.values.map((v) => `"${v}"`).join(' | ')
      return `${prefix}Expected one of ${options}`
    }
    case 'unrecognized_keys': {
      const typed = issue as UnrecognizedKeysIssue
      return `${prefix}Unrecognized keys: ${typed.keys.map((k) => `"${k}"`).join(', ')}`
    }
    case 'too_small': {
      const typed = issue as TooSmallIssue
      const op = typed.inclusive ? '>=' : '>'
      return `${prefix}Expected ${typed.origin} to have ${op}${typed.minimum} characters`
    }
    case 'too_big': {
      const typed = issue as TooBigIssue
      const op = typed.inclusive ? '<=' : '<'
      return `${prefix}Expected ${typed.origin} to have ${op}${typed.maximum} characters`
    }
    default:
      return `${prefix}${issue.message}`
  }
}

export function formatZodIssues(issues: unknown[]): string {
  return (issues as ZodIssue[]).slice(0, 3).map(formatIssue).join('; ')
}
