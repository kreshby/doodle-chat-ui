import { CreateMessageInputSchema } from '../api/chatSchemas'

type AuthorValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string }

export function validateAuthor(author: string): AuthorValidationResult {
  const result = CreateMessageInputSchema.shape.author.safeParse(author)

  if (result.success) {
    return { ok: true, value: result.data }
  }

  const trimmedAuthor = author.trim()

  if (!trimmedAuthor) {
    return { ok: false, error: 'Enter your name.' }
  }

  if (trimmedAuthor.length > 50) {
    return {
      ok: false,
      error: 'Name must be 50 characters or fewer.',
    }
  }

  return {
    ok: false,
    error:
      'Use only A-Z letters, numbers, spaces, hyphens, and underscores.',
  }
}
