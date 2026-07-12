import { useEffect, useState } from 'react'
import type { TemplateIndex, TemplateMeta } from './types'
import FillView from './FillView'

const BASE = import.meta.env.BASE_URL

export default function App() {
  const [index, setIndex] = useState<TemplateIndex | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<TemplateMeta | null>(null)

  useEffect(() => {
    fetch(`${BASE}templates/index.json`, { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: TemplateIndex) => setIndex(data))
      .catch((err) => setError(`載入範本清單失敗：${String(err)}`))
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <h1 className="app-title">
            {selected ? (
              <button className="link-btn" onClick={() => setSelected(null)}>
                ← 公版合約挖空 Demo
              </button>
            ) : (
              '公版合約挖空 Demo'
            )}
          </h1>
          <p className="app-subtitle">
            驗證「DOCX 母稿 → 只填挖空 → 長文自動換行 → 下載 PDF」；資料不存檔，重新整理即清空。
          </p>
        </div>
      </header>

      <main className="app-main">
        {error && <p className="error-banner">{error}</p>}
        {!error && !index && <p className="loading">載入範本清單中…</p>}

        {index && !selected && (
          <section>
            <h2 className="section-title">選擇公版範本</h2>
            <div className="card-grid">
              {index.templates.map((t) => (
                <button key={t.id} className="template-card" onClick={() => setSelected(t)}>
                  <span className="template-card-name">{t.name}</span>
                  <span className="template-card-desc">{t.description}</span>
                  <span className="template-card-meta">
                    {t.fields.length} 個挖空欄位 · DOCX 母稿
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {selected && (
          <FillView
            key={selected.id}
            template={selected}
            docxUrl={`${BASE}templates/${selected.file}`}
            onBack={() => setSelected(null)}
          />
        )}
      </main>

      <footer className="app-footer">
        此為技術 Demo：PDF 由瀏覽器預覽轉出，版面精準度不等於 Microsoft Word；所有資料僅存在於本頁面，離開或重新整理即清空。
      </footer>
    </div>
  )
}
