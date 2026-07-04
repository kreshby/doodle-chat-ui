import { z } from 'zod'

export const ChatMessageSchema = z.object({
  _id: z.string(),
  message: z.string(),
  author: z.string(),
  createdAt: z.iso.datetime({ offset: true }),
})

export const CreateMessageInputSchema = z.object({
  message: z.string().trim().min(1).max(500),
  author: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .regex(/^[\w\s-]+$/),
})

export const GetMessagesParamsSchema = z
  .object({
    limit: z.number().int().min(1).max(1000).optional(),
    after: z.iso.datetime({ offset: true }).optional(),
    before: z.iso.datetime({ offset: true }).optional(),
  })
  .refine(({ after, before }) => !(after && before), {
    message: 'after and before cannot both be provided',
  })

export const ValidationIssueSchema = z.object({
  field: z.string(),
  message: z.string(),
})
