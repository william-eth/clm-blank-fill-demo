import PizZip from 'pizzip'
import type { DocParagraph } from './types'

export interface LoadedDocx {
  paragraphs: DocParagraph[]
  /** 原始 DOCX 內容，供 docxtemplater 填值下載用 */
  buffer: ArrayBuffer
}

/**
 * 下載公版 DOCX 並解析 word/document.xml，取出唯讀條文段落。
 * Demo 僅處理本專案產生器輸出的結構（Title / Heading2 / 一般段落 + 對齊），
 * 正式系統應以完整的 DOCX 掃描服務處理任意公版。
 */
export async function loadDocx(url: string): Promise<LoadedDocx> {
  // no-cache：每次向伺服器重新驗證（ETag），避免 GitHub Pages 的
  // max-age 快取讓使用者在範本更新後仍拿到舊 DOCX
  const res = await fetch(url, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`無法載入範本（HTTP ${res.status}）`)
  const buffer = await res.arrayBuffer()

  const zip = new PizZip(buffer)
  const xmlFile = zip.file('word/document.xml')
  if (!xmlFile) throw new Error('DOCX 內找不到 word/document.xml')

  const dom = new DOMParser().parseFromString(xmlFile.asText(), 'application/xml')
  const paragraphs: DocParagraph[] = []

  const pNodes = dom.getElementsByTagName('w:p')
  for (let i = 0; i < pNodes.length; i++) {
    const p = pNodes[i]

    const styleVal = p.getElementsByTagName('w:pStyle')[0]?.getAttribute('w:val') ?? ''
    const style: DocParagraph['style'] =
      styleVal === 'Title' ? 'title' : styleVal.startsWith('Heading') ? 'heading' : 'normal'

    const jc = p.getElementsByTagName('w:jc')[0]?.getAttribute('w:val') ?? ''
    const align: DocParagraph['align'] =
      jc === 'center' ? 'center' : jc === 'right' || jc === 'end' ? 'right' : jc === 'both' ? 'justify' : 'left'

    let text = ''
    const tNodes = p.getElementsByTagName('w:t')
    for (let j = 0; j < tNodes.length; j++) text += tNodes[j].textContent ?? ''

    paragraphs.push({ style, align, text })
  }

  return { paragraphs, buffer }
}
