import { useState } from 'react'
import {
  clearCurrentAuthor,
  readCurrentAuthor,
  writeCurrentAuthor,
} from '../utils/currentAuthorStorage'
import { validateAuthor } from '../utils/validateAuthor'

type SetAuthorResult =
  | { ok: true }
  | { ok: false; error: string }

export function useCurrentAuthor() {
  const [author, setCurrentAuthor] = useState<string | null>(
    readCurrentAuthor,
  )

  function setAuthor(input: string): SetAuthorResult {
    const result = validateAuthor(input)

    if (!result.ok) {
      return result
    }

    writeCurrentAuthor(result.value)
    setCurrentAuthor(result.value)

    return { ok: true }
  }

  function clearAuthor() {
    clearCurrentAuthor()
    setCurrentAuthor(null)
  }

  return {
    author,
    setAuthor,
    clearAuthor,
    hasAuthor: author !== null,
  }
}
