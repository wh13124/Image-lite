import { useMemo } from 'react'
import Header from './components/Header'
import UploadZone from './components/UploadZone'
import FileSummary from './components/FileSummary'
import ControlsPanel from './components/ControlsPanel'
import ResultSummary from './components/ResultSummary'
import { useImageUpload } from './hooks/useImageUpload'
import { useCompress } from './hooks/useCompress'
import { canEncodeWebP } from './lib/encode'
import './App.css'

function App() {
  const { state, processFile, remove } = useImageUpload()
  const canWebP = useMemo(() => canEncodeWebP(), [])

  const file = state.status === 'ready' ? state.file : null
  const sourceFormat = state.status === 'ready' ? state.info.format : null
  const compress = useCompress(file, sourceFormat, canWebP)

  return (
    <div className="app">
      <Header />

      <main className="app-main container">
        <section className="hero" aria-labelledby="hero-title">
          <p className="hero-eyebrow">本地图片压缩 · 无上传</p>
          <h1 id="hero-title" className="hero-title">
            让图片更轻，画质如初。
          </h1>
          <p className="hero-subtitle">
            在浏览器本地压缩 JPEG、PNG、WebP 图片，减少文件体积、保留视觉品质。
            你的图片不会离开设备。
          </p>
        </section>

        {state.status === 'ready' ? (
          <FileSummary
            info={state.info}
            previewUrl={state.previewUrl}
            isLarge={state.isLarge}
            onReplace={processFile}
            onRemove={remove}
          />
        ) : (
          <UploadZone status={state.status} error={state.error} onFile={processFile} />
        )}

        <section className="workspace" aria-label="压缩工作区">
          <div
            className={`workspace-preview${
              state.status === 'ready' ? ' workspace-preview--ready' : ''
            }`}
            aria-label="原图与压缩结果对比"
          >
            {state.status === 'ready' ? (
              <>
                <div className="preview-pane">
                  <span className="preview-pane-label">原图</span>
                  <img
                    className="workspace-image"
                    src={state.previewUrl}
                    alt={`${state.info.name} 原图预览`}
                  />
                </div>
                <div className="preview-pane">
                  <span className="preview-pane-label">压缩后</span>
                  {compress.state.status === 'done' ? (
                    <img
                      className="workspace-image"
                      src={compress.state.result.previewUrl}
                      alt="压缩后预览"
                    />
                  ) : compress.state.status === 'working' ? (
                    <div className="preview-pending" role="status">
                      正在压缩…
                    </div>
                  ) : compress.state.status === 'error' ? (
                    <div className="preview-pending preview-pending--error">压缩失败</div>
                  ) : (
                    <div className="preview-pending">等待压缩</div>
                  )}
                </div>
              </>
            ) : (
              <>
                <span className="workspace-preview-label">压缩预览</span>
                <p className="workspace-placeholder">
                  上传图片后在此显示原图与压缩结果对比
                </p>
              </>
            )}
          </div>
          <div className="workspace-side">
            <ControlsPanel
              params={compress.params}
              sourceFormat={sourceFormat}
              canWebP={canWebP}
              onFormatChange={compress.setFormat}
              onQualityChange={compress.setQuality}
            />
            <ResultSummary
              sourceFormat={sourceFormat}
              compressState={compress.state}
              onRetry={compress.retry}
            />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span className="footer-brand">ImageLite</span>
          <span className="footer-note">
            图片仅在本地浏览器处理，不会上传到任何服务器
          </span>
        </div>
      </footer>
    </div>
  )
}

export default App
