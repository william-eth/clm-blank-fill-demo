import type { TemplateField } from './types'
import type { ScannedVar } from './normalizeDocx'

const DATE_RE = /(date|day|time|日期|時間|年月日|簽署日|生效日|起日|迄日)/i
const LONG_RE = /(desc|content|scope|body|detail|note|remark|address|spec|內容|範圍|說明|描述|備註|地址|條款|明細|事項)/i

/**
 * 依欄位名稱自動推斷 input 類型（使用者可於欄位設定頁修改）：
 * 名稱含日期字樣 → date；含長文字樣 → textarea；其餘 → text。
 */
export function inferFields(vars: ScannedVar[]): TemplateField[] {
  return vars.map(({ key }) => ({
    key,
    label: key,
    hint: '',
    required: true,
    type: DATE_RE.test(key) ? 'date' : LONG_RE.test(key) ? 'textarea' : 'text',
  }))
}
