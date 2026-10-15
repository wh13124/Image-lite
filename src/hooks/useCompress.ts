import { useCallback, useEffect, useRef, useState } from 'react'
import type { ImageFormat } from '../lib/image'
import { encodeImage } from '../lib/encode'

const DEBOUNCE_MS = 200

export interface CompressParams {
  format: ImageFormat
  quality: number
}

export interface CompressResult {
  blob: Blob
  previewUrl: string
  format: ImageFormat
  width: number
  height: number
  name: string
  originalSize: number
  outputSize: number
  savedBytes: number
  savedPercent: number
  degraded: boolean
}

export type CompressState =
  | { status: 'idle' }
  | { status: 'working' }
  | { status: 'done'; result: CompressResult }
  | { status: 'error'; message: string }

function getErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  if (/memory|allocation|too large|exceed|decode/i.test(message)) {
    return '内存不足或图片过大，无法完成压缩，请尝试尺寸更小的图片'
  }
  return '图片压缩失败，请重试'
}

export interface UseCompressResult {
  params: CompressParams
  state: CompressState
  setFormat: (format: ImageFormat) => void
  setQuality: (quality: number) => void
  retry: () => void
}

export function useCompress(
  file: File | null,
  sourceFormat: ImageFormat | null,
  canWebP: boolean,
): UseCompressResult {
  const [params, setParams] = useState<CompressParams>({ format: 'jpeg', quality: 80 })
  const [state, setState] = useState<CompressState>({ status: 'idle' })
  const [retryCount, setRetryCount] = useState(0)
  const generationRef = useRef(0)
  const resultUrlRef = useRef<string | null>(null)

  const revokeResultUrl = useCallback(() => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current)
      resultUrlRef.current = null
    }
  }, [])

  useEffect(() => {
    return revokeResultUrl
  }, [revokeResultUrl])

  useEffect(() => {
    generationRef.current += 1
    revokeResultUrl()

    if (!file || !sourceFormat) {
      setState({ status: 'idle' })
      return
    }

    const defaultFormat: ImageFormat =
      sourceFormat === 'webp' && !canWebP ? 'png' : sourceFormat
    setState({ status: 'idle' })
    setParams({ format: defaultFormat, quality: 80 })
  }, [file, sourceFormat, canWebP, revokeResultUrl])

  useEffect(() => {
    if (!file || !sourceFormat) return

    const generation = ++generationRef.current
    revokeResultUrl()
    setState({ status: 'working' })

    const timer = window.setTimeout(async () => {
      try {
        const output = await encodeImage(file, sourceFormat, params)
        if (generation !== generationRef.current) return

        const previewUrl = URL.createObjectURL(output.blob)
        resultUrlRef.current = previewUrl

        const originalSize = file.size
        const outputSize = output.blob.size
        const savedBytes = originalSize - outputSize
        const savedPercent = originalSize > 0 ? (savedBytes / originalSize) * 100 : 0

        setState({
          status: 'done',
          result: {
            blob: output.blob,
            previewUrl,
            format: output.format,
            width: output.width,
            height: output.height,
            name: file.name,
            originalSize,
            outputSize,
            savedBytes,
            savedPercent,
            degraded: output.degraded,
          },
        })
      } catch (error) {
        if (generation !== generationRef.current) return
        setState({ status: 'error', message: getErrorMessage(error) })
      }
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [file, sourceFormat, params, retryCount, revokeResultUrl])

  const setFormat = useCallback((format: ImageFormat) => {
    setParams((prev) => ({ ...prev, format }))
  }, [])

  const setQuality = useCallback((quality: number) => {
    setParams((prev) => ({ ...prev, quality }))
  }, [])

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1)
  }, [])

  return { params, state, setFormat, setQuality, retry }
}
