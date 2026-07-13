import { useEffect, useMemo, useRef, useState } from 'react'
import { renderAsync } from 'docx-preview'
import type { FormValues, TemplateField } from './types'
import type { UploadedDoc } from './UploadView'
import { TOKEN_RE } from './normalizeDocx'
import { downloadFilledDocx } from './docxFill'
import { downloadPdf } from './pdf'
import { displayValue } from './format'
import FieldsForm from './FieldsForm'

interface Props {
  doc: UploadedDoc
  fields: TemplateField[]
  onBack: () => void
}

const emptyValues = (fields: TemplateField[]): FormValues =>
  Object.fromEntries(fields.map((f) => [f.key, '']))

/** 把 docx-preview 渲染結果中的 {{key}} 文字節點包成可更新的 span */
function wrapTokens(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const targets: Text[] = []
  let node: Node | null
  while ((node = walker.nextNode())) {
    if (node.textContent?.includes('{{')) targets.push(node as Text)
  }
  for (const textNode of targets) {
    const text = textNode.textContent ?? ''
    TOKEN_RE.lastIndex = 0
    if (!TOKEN_RE.test(text)) continue
    TOKEN_RE.lastIndex = 0
    const frag = document.createDocumentFragment()
    let last = 0
    let m: RegExpExecArray | null
    while ((m = TOKEN_RE.exec(text)) !== null) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)))
      const key = m[1].trim()
      if (key) {
        const span = document.createElement('span')
        span.dataset.blankKey = key
        frag.appendChild(span)
      } else {
        frag.appendChild(document.createTextNode(m[0]))
      }
      last = m.index + m[0].length
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)))
    textNode.replaceWith(frag)
  }
}

/** 依目前表單值更新所有挖空 span（值以 <br> 呈現換行，同預置範本策略） */
function updateTokens(root: HTMLElement, fields: TemplateField[], values: FormValues) {
  root.querySelectorAll<HTMLElement>('span[data-blank-key]').forEach((span) => {
    const key = span.dataset.blankKey!
    const field = fields.find((f) => f.key === key)
    const raw = values[key] ?? ''
    span.replaceChildren()
    if (field && raw.trim()) {
      span.className = 'filled-value'
      displayValue(field, raw)
        .split('\n')
        .forEach((line, i) => {
          if (i > 0) span.appendChild(document.createElement('br'))
          span.appendChild(document.createTextNode(line))
        })
    } else {
      span.className = 'pending-value'
      span.textContent = `【待填：${field?.label ?? key}】`
    }
  })
}

export default function CustomFillView({ doc, fields, onBack }: Props) {
  const [values, setValues] = useState<FormValues>(() => emptyValues(fields))
  const [showMissing, setShowMissing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [rendered, setRendered] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  // docx-preview 渲染一次，之後只更新挖空 span
  useEffect(() => {
    const container = previewRef.current
    if (!container) return
    let cancelled = false
    container.replaceChildren()
    renderAsync(doc.buffer, container, undefined, {
      inWrapper: false,
      ignoreWidth: true,
      ignoreHeight: true,
      breakPages: false,
      renderHeaders: false,
      renderFooters: false,
    })
      .then(() => {
        if (cancelled) return
        wrapTokens(container)
        setRendered(true)
      })
      .catch((err) => !cancelled && setRenderError(`預覽渲染失敗：${String(err)}`))
    return () => {
      cancelled = true
    }
  }, [doc.buffer])

  useEffect(() => {
    if (rendered && previewRef.current) updateTokens(previewRef.current, fields, values)
  }, [rendered, fields, values])

  const missing = useMemo(
    () => fields.filter((f) => f.required && !values[f.key]?.trim()),
    [fields, values],
  )

  const exportValues = (): FormValues =>
    Object.fromEntries(fields.map((f) => [f.key, displayValue(f, values[f.key] ?? '').trim()]))

  const handlePdf = async () => {
    if (missing.length > 0) {
      setShowMissing(true)
      return
    }
    if (!previewRef.current) return
    setBusy(true)
    try {
      await downloadPdf(previewRef.current, `${doc.name}.pdf`)
    } finally {
      setBusy(false)
    }
  }

  const handleDocx = () => {
    if (missing.length > 0) {
      setShowMissing(true)
      return
    }
    downloadFilledDocx(doc.buffer, exportValues(), `${doc.name}（已填）.docx`)
  }

  const restart = () => {
    if (window.confirm('確定要清空本次填寫的所有內容嗎？')) {
      setValues(emptyValues(fields))
      setShowMissing(false)
    }
  }

  return (
    <div className="fill-layout">
      <aside className="form-pane">
        <div className="form-pane-header">
          <h2 className="section-title">{doc.name}</h2>
          <p className="form-pane-desc">自訂範本：{fields.length} 個挖空欄位（僅存在瀏覽器中）</p>
        </div>

        <FieldsForm fields={fields} values={values} showMissing={showMissing} onChange={(k, v) => setValues((s) => ({ ...s, [k]: v }))} />

        <div className="actions">
          <button
            className="btn btn-primary"
            disabled={missing.length > 0 || !rendered || busy}
            onClick={handlePdf}
            title={missing.length > 0 ? `尚有 ${missing.length} 個必填欄位未填` : undefined}
          >
            {busy ? '產生 PDF 中…' : '產生 PDF'}
          </button>
          <button className="btn" disabled={missing.length > 0} onClick={handleDocx}>
            下載已填 DOCX
          </button>
          <button className="btn btn-ghost" onClick={restart}>
            重新開始
          </button>
          <button className="btn btn-ghost" onClick={onBack}>
            返回欄位設定
          </button>
        </div>

        {missing.length > 0 && (
          <p className="missing-note">尚未填寫：{missing.map((f) => f.label).join('、')}</p>
        )}
      </aside>

      <section className="preview-pane">
        <div className="preview-pane-header">
          <span>正文預覽（唯讀，僅挖空值會更新；由 docx-preview 渲染，非 Word 精確版面）</span>
        </div>
        {renderError && <p className="error-banner">{renderError}</p>}
        <div className="paper custom-preview">
          {!rendered && !renderError && <p className="loading">渲染 DOCX 預覽中…</p>}
          <div ref={previewRef} />
        </div>
      </section>
    </div>
  )
}
