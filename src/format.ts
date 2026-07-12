import type { TemplateField } from './types'

/** 將 date input 的 ISO 值（yyyy-mm-dd）轉為合約慣用的中文日期 */
export function displayValue(field: TemplateField, raw: string): string {
  if (field.type === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split('-').map(Number)
    return `${y} 年 ${m} 月 ${d} 日`
  }
  return raw
}
