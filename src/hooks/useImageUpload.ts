import { useCallback, useEffect, useRef, useState } from 'react'
import type { ImageInfo } from '../lib/image'
import { MAX_PIXELS, LARGE_PIXELS, decodeAndPreview, detectFormat } from '../lib/image'

export type UploadStatus = 'empty' | 'reading' | 'ready' | 'error'

export type UploadErrorCode = 'unsupported' | 'too_large' | 'decode_failed'

export interface UploadError {
  code: UploadErrorCode
  message: string
}

const ERROR_MESSAGES: Record<UploadErrorCode, string> = {
  unsupported: '仅支持 JPEG、PNG、WebP 格式的图片',
  too_large: '图片像素超过 5000 万（50MP）上限，请换一张较小的图片',
  decode_failed: '无法读取这张图片，文件可能已损坏',
}

type UploadState =
  | { status: 'empty'; file: null; info: null; previewUrl: null; error: null; isLarge: false }
  | { status: 'reading'; file: null; info: null; previewUrl: null; error: null; isLarge: false }
  | { status: 'ready'; file: File; info: ImageInfo; previewUrl: string; error: null; isLarge: boolean }
  | { status: 'error'; file: null; info: null; previewUrl: null; error: UploadError; isLarge: false }

const INITIAL_STATE: UploadState = {
  status: 'empty',
  file: null,
  info: null,
  previewUrl: null,
  error: null,
  isLarge: false,
}

export interface UseImageUploadResult {
  state: UploadState
  processFile: (file: File) => Promise<void>
  remove: () => void
}

export function useImageUpload(): UseImageUploadResult {
  const [state, setState] = useState<UploadState>(INITIAL_STATE)
  const generationRef = useRef(0)
  const previewUrlRef = useRef<string | null>(null)

  const revokePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
  }, [])

  useEffect(() => {
    return revokePreview
  }, [revokePreview])

  const processFile = useCallback(
    async (file: File) => {
      const generation = ++generationRef.current
      revokePreview()
      setState({
        status: 'reading',
        file: null,
        info: null,
        previewUrl: null,
        error: null,
        isLarge: false,
      })

      const format = await detectFormat(file)
      if (generation !== generationRef.current) return

      if (!format) {
        setState({
          status: 'error',
          file: null,
          info: null,
          previewUrl: null,
          error: { code: 'unsupported', message: ERROR_MESSAGES.unsupported },
          isLarge: false,
        })
        return
      }

      try {
        const { width, height, previewUrl } = await decodeAndPreview(file)
        if (generation !== generationRef.current) {
          URL.revokeObjectURL(previewUrl)
          return
        }

        const pixels = width * height
        if (pixels > MAX_PIXELS) {
          URL.revokeObjectURL(previewUrl)
          setState({
            status: 'error',
            file: null,
            info: null,
            previewUrl: null,
            error: { code: 'too_large', message: ERROR_MESSAGES.too_large },
            isLarge: false,
          })
          return
        }

        previewUrlRef.current = previewUrl
        const info: ImageInfo = {
          name: file.name,
          format,
          size: file.size,
          width,
          height,
          pixels,
        }
        setState({
          status: 'ready',
          file,
          info,
          previewUrl,
          error: null,
          isLarge: pixels > LARGE_PIXELS,
        })
      } catch {
        if (generation !== generationRef.current) return
        setState({
          status: 'error',
          file: null,
          info: null,
          previewUrl: null,
          error: { code: 'decode_failed', message: ERROR_MESSAGES.decode_failed },
          isLarge: false,
        })
      }
    },
    [revokePreview],
  )

  const remove = useCallback(() => {
    generationRef.current += 1
    revokePreview()
    setState(INITIAL_STATE)
  }, [revokePreview])

  return { state, processFile, remove }
}
