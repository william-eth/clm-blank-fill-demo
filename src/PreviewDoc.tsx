import { forwardRef, Fragment, type ReactNode } from 'react'
import type { DocParagraph, FormValues, TemplateField } from './types'
import { displayValue } from './format'

interface Props {
  paragraphs: DocParagraph[]
  fields: TemplateField[]
  values: FormValues
}

const TOKEN_RE = /(\{\{[a-z0-9_]+\}\})/g

/** 把段落文字依 {{snake_case}} 切開，填入值或顯示待填佔位 */
function renderText(text: string, fields: TemplateField[], values: FormValues): ReactNode[] {
  return text.split(TOKEN_RE).map((part, i) => {
    const m = /^\{\{([a-z0-9_]+)\}\}$/.exec(part)
    if (!m) return part
    const key = m[1]
    const field = fields.find((f) => f.key === key)
    const raw = values[key] ?? ''
    if (field && raw.trim()) {
      // 使用者輸入的換行以 <br> 呈現（html2canvas 對 pre-wrap + CJK 有漏字 bug，
      // 因此預覽不使用 white-space: pre-wrap）
      const lines = displayValue(field, raw).split('\n')
      return (
        <span key={i} className="filled-value">
          {lines.map((line, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </span>
      )
    }
    return (
      <span key={i} className="pending-value">
        【{field ? `待填：${field.label}` : key}】
      </span>
    )
  })
}

/**
 * 唯讀正文預覽：條文來自 DOCX 母稿解析結果，使用者無法編輯；
 * 只有挖空值即時反映。長文以正常文件流 + pre-wrap 自動換行。
 */
const PreviewDoc = forwardRef<HTMLDivElement, Props>(({ paragraphs, fields, values }, ref) => {
  return (
    <div ref={ref} className="doc">
      {paragraphs.map((p, i) => {
        const content = p.text ? renderText(p.text, fields, values) : ' '
        if (p.style === 'title') {
          return (
            <h1 key={i} className="doc-title">
              {content}
            </h1>
          )
        }
        if (p.style === 'heading') {
          return (
            <h2 key={i} className="doc-heading">
              {content}
            </h2>
          )
        }
        return (
          <p key={i} className={`doc-para align-${p.align}`}>
            {content}
          </p>
        )
      })}
    </div>
  )
})

PreviewDoc.displayName = 'PreviewDoc'
export default PreviewDoc
