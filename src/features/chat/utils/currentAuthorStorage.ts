export const CURRENT_AUTHOR_STORAGE_KEY = 'doodle-chat.currentAuthor'

export function readCurrentAuthor(): string | null {
  try {
    return globalThis.localStorage?.getItem(CURRENT_AUTHOR_STORAGE_KEY) ?? null
  } catch {
    return null
  }
}

export function writeCurrentAuthor(author: string): void {
  try {
    globalThis.localStorage?.setItem(CURRENT_AUTHOR_STORAGE_KEY, author)
  } catch {
    // Storage can be unavailable in restricted browser environments.
  }
}

export function clearCurrentAuthor(): void {
  try {
    globalThis.localStorage?.removeItem(CURRENT_AUTHOR_STORAGE_KEY)
  } catch {
    // Storage can be unavailable in restricted browser environments.
  }
}
