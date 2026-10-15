import type { ImageFormat } from './image'

const MIME_BY_FORMAT: Record<ImageFormat, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

const EXT_BY_FORMAT: Record<ImageFormat, string> = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
}

export function extensionFor(format: ImageFormat): string {
  return EXT_BY_FORMAT[format]
}

export function canEncodeWebP(): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').startsWith('data:image/webp')
}

function formatFromMime(mime: string): ImageFormat | null {
  if (mime === 'image/jpeg') return 'jpeg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return null
}

export interface EncodeOptions {
  format: ImageFormat
  quality: number
}

export interface EncodeOutput {
  blob: Blob
  format: ImageFormat
  width: number
  height: number
  degraded: boolean
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}

export async function encodeImage(
  file: File,
  sourceFormat: ImageFormat,
  options: EncodeOptions,
): Promise<EncodeOutput> {
  const targetFormat = options.format
  const mimeType = MIME_BY_FORMAT[targetFormat]
  const quality = targetFormat === 'png' ? undefined : options.quality / 100

  const bitmap = await createImageBitmap(file)
  let canvas: HTMLCanvasElement | null = null

  try {
    const width = bitmap.width
    const height = bitmap.height

    canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('无法创建画布上下文')

    if (targetFormat === 'jpeg' && sourceFormat !== 'jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
    }

    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await canvasToBlob(canvas, mimeType, quality)
    if (!blob) throw new Error('图片编码失败')

    const actualFormat = formatFromMime(blob.type)
    if (!actualFormat) throw new Error('编码结果格式无法识别')

    return {
      blob,
      format: actualFormat,
      width,
      height,
      degraded: actualFormat !== targetFormat,
    }
  } finally {
    bitmap.close()
    if (canvas) {
      canvas.width = 0
      canvas.height = 0
    }
  }
}
