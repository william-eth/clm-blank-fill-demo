import { useEffect, useState } from 'react'
import type { TemplateField, TemplateIndex, TemplateMeta } from './types'
import FillView from './FillView'
import UploadView, { type UploadedDoc } from './UploadView'
import FieldConfigView from './FieldConfigView'
import CustomFillView from './CustomFillView'

const BASE = import.meta.env.BASE_URL

type Route =
  | { view: 'list' }
  | { view: 'preset'; template: TemplateMeta }
  | { view: 'upload' }
  | { view: 'config'; doc: UploadedDoc }
  | { view: 'customFill'; doc: UploadedDoc; fields: TemplateField[] }

export default function App() {
  const [index, setIndex] = useState<TemplateIndex | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [route, setRoute] = useState<Route>({ view: 'list' })

  useEffect(() => {
    fetch(`${BASE}templates/index.json`, { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: TemplateIndex) => setIndex(data))
      .catch((err) => setError(`載入範本清單失敗：${String(err)}`))
  }, [])

  const goHome = () => setRoute({ view: 'list' })

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <h1 className="app-title">
            {route.view !== 'list' ? (
              <button className="link-btn" onClick={goHome}>
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

        {index && route.view === 'list' && (
          <section>
            <h2 className="section-title">選擇公版範本</h2>
            <div className="card-grid">
              {index.templates.map((t) => (
                <button
                  key={t.id}
                  className="template-card"
                  onClick={() => setRoute({ view: 'preset', template: t })}
                >
                  <span className="template-card-name">{t.name}</span>
                  <span className="template-card-desc">{t.description}</span>
                  <span className="template-card-meta">
                    {t.fields.length} 個挖空欄位 · DOCX 母稿
                  </span>
                </button>
              ))}
              <button
                className="template-card upload-card"
                onClick={() => setRoute({ view: 'upload' })}
              >
                <span className="template-card-name">＋ 上傳自訂範本</span>
                <span className="template-card-desc">
                  上傳已用 {'{{欄位名稱}}'} 標好挖空的 DOCX，設定欄位後填寫並下載 PDF。
                </span>
                <span className="template-card-meta">檔案僅在瀏覽器處理，不上傳伺服器</span>
              </button>
            </div>
          </section>
        )}

        {route.view === 'preset' && (
          <FillView
            key={route.template.id}
            template={route.template}
            docxUrl={`${BASE}templates/${route.template.file}`}
            onBack={goHome}
          />
        )}

        {route.view === 'upload' && (
          <UploadView onLoaded={(doc) => setRoute({ view: 'config', doc })} onBack={goHome} />
        )}

        {route.view === 'config' && (
          <FieldConfigView
            doc={route.doc}
            onNext={(fields) => setRoute({ view: 'customFill', doc: route.doc, fields })}
            onBack={() => setRoute({ view: 'upload' })}
          />
        )}

        {route.view === 'customFill' && (
          <CustomFillView
            doc={route.doc}
            fields={route.fields}
            onBack={() => setRoute({ view: 'config', doc: route.doc })}
          />
        )}
      </main>

      <footer className="app-footer">
        此為技術 Demo：PDF 由瀏覽器預覽轉出，版面精準度不等於 Microsoft Word；所有資料僅存在於本頁面，離開或重新整理即清空。
      </footer>
    </div>
  )
}
