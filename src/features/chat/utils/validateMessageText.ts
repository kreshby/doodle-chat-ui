export type MessageTextValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string }

export function validateMessageText(
  input: string,
): MessageTextValidationResult {
  const value = input.trim()

  if (!value) {
    return { ok: false, error: 'Enter a message.' }
  }

  if (value.length > 500) {
    return {
      ok: false,
      error: 'Message must be 500 characters or fewer.',
    }
  }

  return { ok: true, value }
}
