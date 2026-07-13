import { useState } from 'react'
import type { TemplateField, FieldType } from './types'
import type { UploadedDoc } from './UploadView'
import { inferFields } from './inferField'

interface Props {
  doc: UploadedDoc
  onNext: (fields: TemplateField[]) => void
  onBack: () => void
}

/** 欄位設定：掃描結果逐欄編輯顯示名稱／提示／類型／必填 */
export default function FieldConfigView({ doc, onNext, onBack }: Props) {
  const [fields, setFields] = useState<TemplateField[]>(() => inferFields(doc.vars))

  const update = (idx: number, patch: Partial<TemplateField>) =>
    setFields((fs) => fs.map((f, i) => (i === idx ? { ...f, ...patch } : f)))

  const countOf = (key: string) => doc.vars.find((v) => v.key === key)?.count ?? 0

  return (
    <div className="config-view">
      <h2 className="section-title">欄位設定：{doc.name}</h2>
      <p className="form-pane-desc">
        掃描到 {fields.length} 個挖空欄位。可調整每個欄位的顯示名稱、提示文字、輸入類型與是否必填，
        完成後進入填寫。
      </p>

      {doc.warnings.length > 0 && (
        <div className="warning-banner">
          {doc.warnings.map((w, i) => (
            <p key={i}>⚠ {w}</p>
          ))}
        </div>
      )}

      <div className="config-table-wrap">
        <table className="config-table">
          <thead>
            <tr>
              <th>標記（出現次數）</th>
              <th>顯示名稱</th>
              <th>提示文字</th>
              <th>輸入類型</th>
              <th>必填</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f, i) => (
              <tr key={f.key}>
                <td>
                  <code>{`{{${f.key}}}`}</code>
                  <span className="config-count">×{countOf(f.key)}</span>
                </td>
                <td>
                  <input
                    value={f.label}
                    onChange={(e) => update(i, { label: e.target.value })}
                    aria-label={`${f.key} 顯示名稱`}
                  />
                </td>
                <td>
                  <input
                    value={f.hint}
                    placeholder="（選填）顯示於輸入框下方"
                    onChange={(e) => update(i, { hint: e.target.value })}
                    aria-label={`${f.key} 提示文字`}
                  />
                </td>
                <td>
                  <select
                    value={f.type}
                    onChange={(e) => update(i, { type: e.target.value as FieldType })}
                    aria-label={`${f.key} 輸入類型`}
                  >
                    <option value="text">單行文字</option>
                    <option value="textarea">多行長文</option>
                    <option value="date">日期</option>
                  </select>
                </td>
                <td className="config-required">
                  <input
                    type="checkbox"
                    checked={f.required}
                    onChange={(e) => update(i, { required: e.target.checked })}
                    aria-label={`${f.key} 必填`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="actions">
        <button
          className="btn btn-primary"
          disabled={fields.some((f) => !f.label.trim())}
          onClick={() => onNext(fields)}
        >
          開始填寫
        </button>
        <button className="btn btn-ghost" onClick={onBack}>
          重新上傳
        </button>
      </div>
      {fields.some((f) => !f.label.trim()) && (
        <p className="missing-note">每個欄位都需要顯示名稱</p>
      )}
    </div>
  )
}
