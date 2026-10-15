export type ImageFormat = 'jpeg' | 'png' | 'webp'

export interface ImageInfo {
  name: string
  format: ImageFormat
  size: number
  width: number
  height: number
  pixels: number
}

export const FORMAT_LABELS: Record<ImageFormat, string> = {
  jpeg: 'JPEG',
  png: 'PNG',
  webp: 'WebP',
}

export const MAX_PIXELS = 50_000_000
export const LARGE_PIXELS = 20_000_000

const PREVIEW_MAX_DIMENSION = 1600

const JPEG_MAGIC = [0xff, 0xd8, 0xff]
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((byte, index) => bytes[index] === byte)
}

export async function detectFormat(file: File): Promise<ImageFormat | null> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())

  if (startsWith(bytes, JPEG_MAGIC)) return 'jpeg'
  if (startsWith(bytes, PNG_MAGIC)) return 'png'

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && // R
    bytes[1] === 0x49 && // I
    bytes[2] === 0x46 && // F
    bytes[3] === 0x46 && // F
    bytes[8] === 0x57 && // W
    bytes[9] === 0x45 && // E
    bytes[10] === 0x42 && // B
    bytes[11] === 0x50 // P
  ) {
    return 'webp'
  }

  return null
}

export interface PreviewResult {
  width: number
  height: number
  previewUrl: string
}

export async function decodeAndPreview(file: File): Promise<PreviewResult> {
  const bitmap = await createImageBitmap(file)

  try {
    const { width, height } = bitmap
    const scale = Math.min(1, PREVIEW_MAX_DIMENSION / Math.max(width, height))
    const previewWidth = Math.max(1, Math.round(width * scale))
    const previewHeight = Math.max(1, Math.round(height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = previewWidth
    canvas.height = previewHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('无法创建画布上下文')

    ctx.drawImage(bitmap, 0, 0, previewWidth, previewHeight)

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('生成预览失败'))),
        'image/png',
      )
    })

    return { width, height, previewUrl: URL.createObjectURL(blob) }
  } finally {
    bitmap.close()
  }
}
