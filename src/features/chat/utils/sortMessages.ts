import type { ChatMessage } from '../api/chatTypes'

export function sortMessages(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort(
    (first, second) =>
      first.createdAt.localeCompare(second.createdAt) ||
      first._id.localeCompare(second._id),
  )
}
