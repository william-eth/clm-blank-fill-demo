import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { saveAs } from 'file-saver'

/**
 * 以 docxtemplater 將表單值填入 DOCX 母稿並觸發下載，
 * 證明母稿仍是 Word 檔、挖空以 {{snake_case}} 標記維護。
 */
export function downloadFilledDocx(buffer: ArrayBuffer, data: Record<string, string>, filename: string): void {
  const zip = new PizZip(buffer)
  const doc = new Docxtemplater(zip, {
    delimiters: { start: '{{', end: '}}' },
    linebreaks: true,
    paragraphLoop: true,
    // 自訂範本可能有選填欄位留空：未提供值的標記輸出為空字串
    nullGetter: () => '',
  })
  doc.render(data)
  const blob = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }) as Blob
  saveAs(blob, filename)
}
