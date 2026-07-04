import { describe, expect, it } from 'vitest'
import { getOverlappedTimestamp } from './getOverlappedTimestamp'

describe('getOverlappedTimestamp', () => {
  it('subtracts one millisecond from an ISO timestamp', () => {
    expect(
      getOverlappedTimestamp('2026-07-04T10:00:00.000Z'),
    ).toBe('2026-07-04T09:59:59.999Z')
  })

  it('handles ISO timestamps with offsets', () => {
    expect(
      getOverlappedTimestamp('2026-07-04T12:00:00.001+02:00'),
    ).toBe('2026-07-04T10:00:00.000Z')
  })
})
