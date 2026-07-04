import { describe, expect, it } from 'vitest'
import { isOwnMessage } from './isOwnMessage'

describe('isOwnMessage', () => {
  it('returns true for matching authors', () => {
    expect(isOwnMessage('Ada', 'Ada')).toBe(true)
  })

  it('returns false when the current author is null', () => {
    expect(isOwnMessage('Ada', null)).toBe(false)
  })

  it('trims both authors before comparing them', () => {
    expect(isOwnMessage('  Ada ', ' Ada  ')).toBe(true)
  })
})
