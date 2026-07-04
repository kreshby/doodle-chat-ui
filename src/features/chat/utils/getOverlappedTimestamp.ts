export function getOverlappedTimestamp(timestamp: string): string {
  return new Date(new Date(timestamp).getTime() - 1).toISOString()
}
