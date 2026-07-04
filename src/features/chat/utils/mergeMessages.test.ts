import { describe, expect, it } from 'vitest'
import type { ChatMessage } from '../api/chatTypes'
import { mergeMessages } from './mergeMessages'

const existing: ChatMessage[] = [
  {
    _id: '2',
    message: 'Original',
    author: 'Ada',
    createdAt: '2026-07-04T11:00:00.000Z',
  },
  {
    _id: '1',
    message: 'First',
    author: 'Ada',
    createdAt: '2026-07-04T10:00:00.000Z',
  },
]

describe('mergeMessages', () => {
  it('deduplicates by _id and replaces existing messages with incoming ones', () => {
    const replacement = {
      ...existing[0],
      message: 'Replacement',
    }

    const result = mergeMessages(existing, [replacement])

    expect(result).toHaveLength(2)
    expect(result.find(({ _id }) => _id === '2')).toBe(replacement)
  })

  it('returns sorted messages', () => {
    const incoming: ChatMessage = {
      _id: '0',
      message: 'Oldest',
      author: 'Grace',
      createdAt: '2026-07-04T09:00:00.000Z',
    }

    expect(mergeMessages(existing, [incoming]).map(({ _id }) => _id)).toEqual([
      '0',
      '1',
      '2',
    ])
  })
})
