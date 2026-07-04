import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatQueryKeys } from '../api/chatQueryKeys'
import { sendMessage } from '../api/messagesApi'
import type {
  ChatMessage,
  CreateMessageInput,
} from '../api/chatTypes'
import { mergeMessages } from '../utils/mergeMessages'

export function useSendChatMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateMessageInput) => sendMessage(input),
    retry: false,
    onSuccess: (message) => {
      queryClient.setQueryData<ChatMessage[]>(
        chatQueryKeys.messages(),
        (existing = []) => mergeMessages(existing, [message]),
      )
    },
  })
}
