import { describe, expect, it } from 'vitest'
import type { ChatMessage } from '../api/chatTypes'
import { sortMessages } from './sortMessages'

const messages: ChatMessage[] = [
  {
    _id: 'b',
    message: 'Later',
    author: 'Ada',
    createdAt: '2026-07-04T11:00:00.000Z',
  },
  {
    _id: 'c',
    message: 'Same time, second id',
    author: 'Ada',
    createdAt: '2026-07-04T10:00:00.000Z',
  },
  {
    _id: 'a',
    message: 'Same time, first id',
    author: 'Ada',
    createdAt: '2026-07-04T10:00:00.000Z',
  },
]

describe('sortMessages', () => {
  it('sorts oldest-first and tie-breaks by _id', () => {
    expect(sortMessages(messages).map(({ _id }) => _id)).toEqual([
      'a',
      'c',
      'b',
    ])
  })

  it('does not mutate the original array', () => {
    const originalOrder = messages.map(({ _id }) => _id)

    expect(sortMessages(messages)).not.toBe(messages)
    expect(messages.map(({ _id }) => _id)).toEqual(originalOrder)
  })
})
