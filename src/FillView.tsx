import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormValues, TemplateMeta } from './types'
import { loadDocx, type LoadedDocx } from './docxParse'
import { downloadFilledDocx } from './docxFill'
import { downloadPdf } from './pdf'
import { displayValue } from './format'
import { fakeCompanies } from './fakeCompanies'
import FieldsForm from './FieldsForm'
import PreviewDoc from './PreviewDoc'

interface Props {
  template: TemplateMeta
  docxUrl: string
  onBack: () => void
}

const emptyValues = (template: TemplateMeta): FormValues =>
  Object.fromEntries(template.fields.map((f) => [f.key, '']))

export default function FillView({ template, docxUrl, onBack }: Props) {
  const [docx, setDocx] = useState<LoadedDocx | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [values, setValues] = useState<FormValues>(() => emptyValues(template))
  const [showMissing, setShowMissing] = useState(false)
  const [busy, setBusy] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    loadDocx(docxUrl)
      .then((d) => !cancelled && setDocx(d))
      .catch((err) => !cancelled && setLoadError(String(err)))
    return () => {
      cancelled = true
    }
  }, [docxUrl])

  const missing = useMemo(
    () => template.fields.filter((f) => f.required && !values[f.key]?.trim()),
    [template, values],
  )

  const setField = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }))

  const applyFakeCompany = (label: string) => {
    const company = fakeCompanies.find((c) => c.label === label)
    if (!company) return
    setValues((v) => {
      const next = { ...v }
      for (const f of template.fields) {
        if (company.values[f.key] !== undefined) next[f.key] = company.values[f.key]
      }
      return next
    })
  }

  const restart = () => {
    if (window.confirm('確定要清空本次填寫的所有內容嗎？')) {
      setValues(emptyValues(template))
      setShowMissing(false)
    }
  }

  /** 匯出用的顯示值（date 轉中文日期） */
  const exportValues = (): FormValues =>
    Object.fromEntries(
      template.fields.map((f) => [f.key, displayValue(f, values[f.key] ?? '').trim()]),
    )

  const handlePdf = async () => {
    if (missing.length > 0) {
      setShowMissing(true)
      return
    }
    if (!previewRef.current) return
    setBusy(true)
    try {
      await downloadPdf(previewRef.current, `${template.name}.pdf`)
    } finally {
      setBusy(false)
    }
  }

  const handleDocx = () => {
    if (missing.length > 0) {
      setShowMissing(true)
      return
    }
    if (!docx) return
    downloadFilledDocx(docx.buffer, exportValues(), `${template.name}.docx`)
  }

  const hasCompanyFields = template.fields.some((f) =>
    fakeCompanies.some((c) => c.values[f.key] !== undefined),
  )

  return (
    <div className="fill-layout">
      <aside className="form-pane">
        <div className="form-pane-header">
          <h2 className="section-title">{template.name}</h2>
          <p className="form-pane-desc">{template.description}</p>
        </div>

        {hasCompanyFields && (
          <div className="fake-company">
            <label className="field-label" htmlFor="fake-company">
              一鍵帶入簽約對象（假資料）
            </label>
            <select
              id="fake-company"
              defaultValue=""
              onChange={(e) => {
                applyFakeCompany(e.target.value)
                e.target.value = ''
              }}
            >
              <option value="" disabled>
                選擇示範公司…
              </option>
              {fakeCompanies.map((c) => (
                <option key={c.label} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <FieldsForm
          fields={template.fields}
          values={values}
          showMissing={showMissing}
          onChange={setField}
        />

        <div className="actions">
          <button
            className="btn btn-primary"
            disabled={missing.length > 0 || !docx || busy}
            onClick={handlePdf}
            title={missing.length > 0 ? `尚有 ${missing.length} 個必填欄位未填` : undefined}
          >
            {busy ? '產生 PDF 中…' : '產生 PDF'}
          </button>
          <button className="btn" disabled={missing.length > 0 || !docx} onClick={handleDocx}>
            下載已填 DOCX
          </button>
          <button className="btn btn-ghost" onClick={restart}>
            重新開始
          </button>
          <button className="btn btn-ghost" onClick={onBack}>
            返回範本列表
          </button>
        </div>

        {missing.length > 0 && (
          <p className="missing-note">
            尚未填寫：{missing.map((f) => f.label).join('、')}
          </p>
        )}
      </aside>

      <section className="preview-pane">
        <div className="preview-pane-header">
          <span>正文預覽（唯讀，僅挖空值會更新）</span>
        </div>
        {loadError && <p className="error-banner">{loadError}</p>}
        {!loadError && !docx && <p className="loading">解析 DOCX 母稿中…</p>}
        {docx && (
          <div className="paper">
            <PreviewDoc
              ref={previewRef}
              paragraphs={docx.paragraphs}
              fields={template.fields}
              values={values}
            />
          </div>
        )}
      </section>
    </div>
  )
}
