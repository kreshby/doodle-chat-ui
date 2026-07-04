import { describe, expect, it } from 'vitest'
import {
  CreateMessageInputSchema,
  GetMessagesParamsSchema,
} from './chatSchemas'

describe('CreateMessageInputSchema', () => {
  it('trims message and author', () => {
    expect(
      CreateMessageInputSchema.parse({
        message: '  Hello there  ',
        author: '  Ada  ',
      }),
    ).toEqual({ message: 'Hello there', author: 'Ada' })
  })

  it.each([
    ['an empty message', { message: '   ', author: 'Ada' }],
    ['a message over 500 characters', { message: 'a'.repeat(501), author: 'Ada' }],
    ['an empty author', { message: 'Hello', author: '   ' }],
    ['an author over 50 characters', { message: 'Hello', author: 'a'.repeat(51) }],
    ['invalid author characters', { message: 'Hello', author: 'Ada!' }],
  ])('rejects %s', (_description, input) => {
    expect(() => CreateMessageInputSchema.parse(input)).toThrow()
  })

  it('accepts supported author characters', () => {
    expect(
      CreateMessageInputSchema.parse({
        message: 'Hello',
        author: 'Ada_2 - Grace',
      }).author,
    ).toBe('Ada_2 - Grace')
  })
})

describe('GetMessagesParamsSchema', () => {
  it.each([1, 1000])('accepts limit %i', (limit) => {
    expect(GetMessagesParamsSchema.parse({ limit })).toEqual({ limit })
  })

  it.each([0, 1001])('rejects limit %i', (limit) => {
    expect(() => GetMessagesParamsSchema.parse({ limit })).toThrow()
  })

  it('rejects after and before together', () => {
    expect(() =>
      GetMessagesParamsSchema.parse({
        after: '2026-07-04T10:00:00.000Z',
        before: '2026-07-04T11:00:00.000Z',
      }),
    ).toThrow()
  })

  it.each(['after', 'before'] as const)('accepts valid ISO %s', (parameter) => {
    const value = '2026-07-04T10:00:00.000Z'

    expect(GetMessagesParamsSchema.parse({ [parameter]: value })).toEqual({
      [parameter]: value,
    })
  })
})
