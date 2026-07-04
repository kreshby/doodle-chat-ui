import { request } from '../../../shared/api/httpClient'
import {
  ChatMessageSchema,
  CreateMessageInputSchema,
  GetMessagesParamsSchema,
} from './chatSchemas'
import type {
  ChatMessage,
  CreateMessageInput,
  GetMessagesParams,
} from './chatTypes'

export async function getMessages(
  params: GetMessagesParams = {},
): Promise<ChatMessage[]> {
  const validatedParams = GetMessagesParamsSchema.parse(params)
  const query = new URLSearchParams()

  if (validatedParams.limit !== undefined) {
    query.set('limit', String(validatedParams.limit))
  }
  if (validatedParams.after !== undefined) {
    query.set('after', validatedParams.after)
  }
  if (validatedParams.before !== undefined) {
    query.set('before', validatedParams.before)
  }

  const queryString = query.toString()
  const data = await request<unknown>(
    `/messages${queryString ? `?${queryString}` : ''}`,
  )

  return ChatMessageSchema.array().parse(data)
}

export async function sendMessage(
  input: CreateMessageInput,
): Promise<ChatMessage> {
  const validatedInput = CreateMessageInputSchema.parse(input)
  const data = await request<unknown>('/messages', {
    method: 'POST',
    body: JSON.stringify(validatedInput),
  })

  return ChatMessageSchema.parse(data)
}
