export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`

  const units = ['KB', 'MB', 'GB']
  let value = bytes
  let unit = 'B'

  for (const next of units) {
    if (value < 1024) break
    value /= 1024
    unit = next
  }

  return `${parseFloat(value.toFixed(2))} ${unit}`
}

export function formatCount(value: number): string {
  return value.toLocaleString('zh-CN')
}
