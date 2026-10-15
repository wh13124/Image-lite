import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import type { ImageInfo } from '../lib/image'
import { FORMAT_LABELS } from '../lib/image'
import { formatBytes, formatCount } from '../lib/units'
import './FileSummary.css'

interface FileSummaryProps {
  info: ImageInfo
  previewUrl: string
  isLarge: boolean
  onReplace: (file: File) => void
  onRemove: () => void
}

function FileSummary({
  info,
  previewUrl,
  isLarge,
  onReplace,
  onRemove,
}: FileSummaryProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const openPicker = () => inputRef.current?.click()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onReplace(file)
    event.target.value = ''
  }

  return (
    <section className="panel file-summary" aria-label="已选择图片">
      <div className="file-summary-row">
        <img className="file-summary-thumb" src={previewUrl} alt={`${info.name} 缩略图`} />
        <div className="file-summary-meta">
          <p className="file-summary-name" title={info.name}>
            {info.name}
          </p>
          <div className="file-summary-badges">
            <span className="badge badge--accent">{FORMAT_LABELS[info.format]}</span>
            <span className="badge">{formatBytes(info.size)}</span>
            <span className="badge">
              {formatCount(info.width)} × {formatCount(info.height)} px
            </span>
            <span className="badge">{formatCount(info.pixels)} 像素</span>
          </div>
        </div>
      </div>

      {isLarge && (
        <p className="file-summary-hint">
          这张图片尺寸较大（超过 2000 万像素），压缩时可能需要更长时间。
        </p>
      )}

      <div className="file-summary-actions">
        <button className="btn btn-secondary" type="button" onClick={openPicker}>
          替换图片
        </button>
        <button className="btn btn-secondary" type="button" onClick={onRemove}>
          移除图片
        </button>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          tabIndex={-1}
          aria-hidden="true"
          onChange={handleChange}
        />
      </div>
    </section>
  )
}

export default FileSummary
