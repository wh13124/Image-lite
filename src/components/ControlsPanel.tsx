import type { ImageFormat } from '../lib/image'
import { FORMAT_LABELS } from '../lib/image'
import type { CompressParams } from '../hooks/useCompress'
import './ControlsPanel.css'

const FORMAT_OPTIONS: ImageFormat[] = ['jpeg', 'png', 'webp']

interface ControlsPanelProps {
  params: CompressParams
  sourceFormat: ImageFormat | null
  canWebP: boolean
  onFormatChange: (format: ImageFormat) => void
  onQualityChange: (quality: number) => void
}

function ControlsPanel({
  params,
  sourceFormat,
  canWebP,
  onFormatChange,
  onQualityChange,
}: ControlsPanelProps) {
  const isPng = params.format === 'png'
  const isDisabled = sourceFormat === null
  const needsWhiteFill =
    params.format === 'jpeg' && sourceFormat !== null && sourceFormat !== 'jpeg'
  const formats = FORMAT_OPTIONS.filter((format) => format !== 'webp' || canWebP)

  return (
    <section className="panel" aria-labelledby="controls-title">
      <div className="panel-head">
        <h2 id="controls-title" className="panel-title">
          压缩参数
        </h2>
      </div>

      <div className="control-group">
        <label className="control-label" htmlFor="format-select">
          输出格式
        </label>
        <select
          id="format-select"
          className="control-select"
          value={params.format}
          disabled={isDisabled}
          onChange={(event) => onFormatChange(event.target.value as ImageFormat)}
        >
          {formats.map((format) => (
            <option key={format} value={format}>
              {FORMAT_LABELS[format]}
            </option>
          ))}
        </select>
        {needsWhiteFill && (
          <p className="control-note control-note--warn">
            转为 JPEG 时，透明区域将填充为白色
          </p>
        )}
      </div>

      <div className="control-group">
        <div className="control-label-row">
          <label className="control-label" htmlFor="quality-range">
            压缩质量
          </label>
          <span className="control-value">{isPng ? '无损' : `${params.quality}%`}</span>
        </div>
        <input
          id="quality-range"
          type="range"
          className="control-range"
          min={10}
          max={100}
          value={params.quality}
          disabled={isDisabled || isPng}
          onChange={(event) => onQualityChange(Number(event.target.value))}
        />
        {isPng ? (
          <p className="control-note">PNG 为无损编码，体积可能不变或增大</p>
        ) : (
          <p className="control-note">质量越低，文件越小，画质损失越大</p>
        )}
      </div>
    </section>
  )
}

export default ControlsPanel
