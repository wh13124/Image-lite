import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import type { UploadError, UploadStatus } from '../hooks/useImageUpload'
import './UploadZone.css'

interface UploadZoneProps {
  status: Exclude<UploadStatus, 'ready'>
  error: UploadError | null
  onFile: (file: File) => void
}

function UploadZone({ status, error, onFile }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const isReading = status === 'reading'

  const openPicker = () => {
    if (isReading) return
    inputRef.current?.click()
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onFile(file)
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    setIsDragging(false)
    if (isReading) return
    const file = event.dataTransfer?.files?.[0]
    if (file) onFile(file)
  }

  return (
    <section
      className={`upload-zone${isDragging ? ' upload-zone--dragging' : ''}`}
      aria-label="图片上传区"
      onDragOver={(event) => {
        event.preventDefault()
        if (!isReading) setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="upload-zone-inner">
        {isReading ? (
          <>
            <span className="upload-zone-spinner" aria-hidden="true" />
            <p className="upload-zone-or">正在读取图片…</p>
          </>
        ) : (
          <>
            <svg
              className="upload-zone-icon"
              viewBox="0 0 24 24"
              width="40"
              height="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="9" cy="9" r="1.6" />
              <path d="M4 17l4.5-4.5 3 3L15 12l5 5" />
            </svg>
            <button className="btn btn-primary" type="button" onClick={openPicker}>
              选择图片
            </button>
            <p className="upload-zone-or">或拖拽图片到此处</p>
            <p className="upload-zone-hint">支持 JPEG · PNG · WebP，单张不超过 50MP</p>
          </>
        )}

        {error && (
          <p className="upload-zone-error" role="alert">
            {error.message}
          </p>
        )}

        <input
          ref={inputRef}
          className="upload-zone-input"
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

export default UploadZone
