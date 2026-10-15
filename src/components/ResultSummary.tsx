import type { ImageFormat } from '../lib/image'
import { FORMAT_LABELS } from '../lib/image'
import { extensionFor } from '../lib/encode'
import type { CompressState } from '../hooks/useCompress'
import { formatBytes, formatCount } from '../lib/units'
import './ResultSummary.css'

interface ResultSummaryProps {
  sourceFormat: ImageFormat | null
  compressState: CompressState
  onRetry: () => void
}

function ResultSummary({ sourceFormat, compressState, onRetry }: ResultSummaryProps) {
  const { status } = compressState

  if (status === 'idle') {
    return (
      <section className="panel" aria-labelledby="result-title">
        <div className="panel-head">
          <h2 id="result-title" className="panel-title">
            压缩结果
          </h2>
        </div>
        <p className="result-note">上传图片后自动压缩，此处将展示真实体积变化</p>
      </section>
    )
  }

  if (status === 'working') {
    return (
      <section className="panel" aria-labelledby="result-title">
        <div className="panel-head">
          <h2 id="result-title" className="panel-title">
            压缩结果
          </h2>
        </div>
        <div className="result-loading" role="status">
          <span className="result-spinner" aria-hidden="true" />
          <span>正在压缩…</span>
        </div>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="panel" aria-labelledby="result-title">
        <div className="panel-head">
          <h2 id="result-title" className="panel-title">
            压缩结果
          </h2>
        </div>
        <p className="result-error" role="alert">
          {compressState.message}
        </p>
        <button className="btn btn-secondary result-retry" type="button" onClick={onRetry}>
          重试
        </button>
      </section>
    )
  }

  const { result } = compressState
  const isIncrease = result.savedBytes < 0
  const isLosslessPng = sourceFormat === 'png' && result.format === 'png'

  const handleDownload = () => {
    const baseName = result.name.replace(/\.[^.]+$/, '') || 'image'
    const url = URL.createObjectURL(result.blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${baseName}.${extensionFor(result.format)}`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return (
    <section className="panel" aria-labelledby="result-title">
      <div className="panel-head">
        <h2 id="result-title" className="panel-title">
          压缩结果
        </h2>
      </div>

      <dl className="result-stats">
        <div className="result-stat">
          <dt className="result-stat-label">原始大小</dt>
          <dd className="result-stat-value">{formatBytes(result.originalSize)}</dd>
        </div>
        <div className="result-stat">
          <dt className="result-stat-label">压缩后</dt>
          <dd className="result-stat-value">{formatBytes(result.outputSize)}</dd>
        </div>
        <div className="result-stat">
          <dt className="result-stat-label">{isIncrease ? '增大了' : '节省了'}</dt>
          <dd
            className={`result-stat-value${isIncrease ? ' result-stat-value--increase' : ''}`}
          >
            {formatBytes(Math.abs(result.savedBytes))} ·{' '}
            {Math.abs(result.savedPercent).toFixed(1)}%
          </dd>
        </div>
        <div className="result-stat">
          <dt className="result-stat-label">输出格式</dt>
          <dd className="result-stat-value">{FORMAT_LABELS[result.format]}</dd>
        </div>
        <div className="result-stat">
          <dt className="result-stat-label">输出尺寸</dt>
          <dd className="result-stat-value">
            {formatCount(result.width)} × {formatCount(result.height)} px
          </dd>
        </div>
      </dl>

      {isIncrease && (
        <p className="result-note result-note--warn">
          压缩后体积增大了 {formatBytes(Math.abs(result.savedBytes))}
          ，该格式与质量设置无法进一步减小文件。
        </p>
      )}

      {isLosslessPng && (
        <p className="result-note">PNG 为无损编码，体积不保证变小。</p>
      )}

      {result.degraded && (
        <p className="result-note result-note--warn">
          浏览器未按所选格式编码，实际输出为 {FORMAT_LABELS[result.format]}。
        </p>
      )}

      <button className="btn btn-primary result-download" type="button" onClick={handleDownload}>
        下载压缩图片
      </button>
    </section>
  )
}

export default ResultSummary
