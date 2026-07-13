import type { FormValues, TemplateField } from './types'

interface Props {
  fields: TemplateField[]
  values: FormValues
  showMissing: boolean
  onChange: (key: string, value: string) => void
}

/** 挖空欄位表單（預置範本與上傳自訂範本共用） */
export default function FieldsForm({ fields, values, showMissing, onChange }: Props) {
  return (
    <form className="fields" onSubmit={(e) => e.preventDefault()}>
      {fields.map((f) => {
        const isMissing = showMissing && f.required && !values[f.key]?.trim()
        return (
          <div key={f.key} className={`field ${isMissing ? 'field-missing' : ''}`}>
            <label className="field-label" htmlFor={`field-${f.key}`}>
              {f.label}
              {f.required && <span className="required-mark">＊必填</span>}
            </label>
            {f.type === 'textarea' ? (
              <textarea
                id={`field-${f.key}`}
                rows={6}
                value={values[f.key] ?? ''}
                placeholder={f.hint}
                onChange={(e) => onChange(f.key, e.target.value)}
              />
            ) : (
              <input
                id={`field-${f.key}`}
                type={f.type === 'date' ? 'date' : 'text'}
                value={values[f.key] ?? ''}
                placeholder={f.hint}
                onChange={(e) => onChange(f.key, e.target.value)}
              />
            )}
            {f.hint && <p className="field-hint">{f.hint}</p>}
            {isMissing && <p className="field-error">此欄位為必填</p>}
          </div>
        )
      })}
    </form>
  )
}
