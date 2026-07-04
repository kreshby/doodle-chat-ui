import { describe, expect, it } from 'vitest'
import { formatMessageDate } from './formatMessageDate'

describe('formatMessageDate', () => {
  it('formats a known timestamp', () => {
    expect(formatMessageDate('2018-03-10T09:55:00')).toBe(
      '10 Mar 2018 9:55',
    )
  })

  it('handles an invalid timestamp', () => {
    expect(formatMessageDate('not-a-date')).toBe('Invalid date')
  })
})
