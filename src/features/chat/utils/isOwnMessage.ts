export function isOwnMessage(
  messageAuthor: string,
  currentAuthor: string | null,
): boolean {
  const normalizedCurrentAuthor = currentAuthor?.trim()

  if (!normalizedCurrentAuthor) {
    return false
  }

  return messageAuthor.trim() === normalizedCurrentAuthor
}
