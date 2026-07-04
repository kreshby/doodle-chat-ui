import type { ChatMessage } from '../api/chatTypes'
import { sortMessages } from './sortMessages'

export function mergeMessages(
  existing: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  const messagesById = new Map(
    existing.map((message) => [message._id, message]),
  )

  incoming.forEach((message) => messagesById.set(message._id, message))

  return sortMessages([...messagesById.values()])
}
