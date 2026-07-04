import { env } from '../config/env'
import { ApiError } from './ApiError'

function getErrorMessage(details: unknown, status: number): string {
  if (typeof details !== 'object' || details === null) {
    return `Request failed with status ${status}`
  }

  const response = details as {
    message?: unknown
    error?: { message?: unknown } | string
  }
  const message =
    typeof response.message === 'string'
      ? response.message
      : typeof response.error === 'object' && response.error !== null
        ? response.error.message
        : undefined

  if (typeof message === 'string') {
    return message
  }

  if (Array.isArray(message)) {
    return message
      .map((issue) =>
        typeof issue === 'object' &&
        issue !== null &&
        'message' in issue &&
        typeof issue.message === 'string'
          ? issue.message
          : String(issue),
      )
      .join(', ')
  }

  return `Request failed with status ${status}`
}

export async function request<TResponse>(
  path: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${env.apiToken}`)

  if (options.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers,
  })
  const text = await response.text()
  let details: unknown

  if (text) {
    try {
      details = JSON.parse(text)
    } catch {
      details = text
    }
  }

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(details, response.status),
      response.status,
      details,
    )
  }

  return details as TResponse
}
