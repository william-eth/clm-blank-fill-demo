import PizZip from 'pizzip'

/** 掃描到的挖空變數 */
export interface ScannedVar {
  key: string
  count: number
}

export interface NormalizedDocx {
  /** run 合併正規化後的 DOCX（供 docx-preview 渲染與 docxtemplater 填值） */
  buffer: ArrayBuffer
  vars: ScannedVar[]
  warnings: string[]
}

/** 挖空標記：{{...}}，內容不可含大括號與換行，長度上限 80 */
export const TOKEN_RE = /\{\{([^{}\n]{1,80}?)\}\}/g

/** 合法的欄位 key：中日韓文字、英數、底線、連字號（頭尾空白會先修剪） */
const VALID_KEY_RE = /^[\w㐀-䶿一-鿿豈-﫿-]+$/

const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * 上傳的任意 DOCX：
 * 1. 驗證確實是 Word 檔（zip + word/document.xml）。
 * 2. run 合併正規化——Word 會因拼字檢查、輸入法等把 {{標記}} 拆散成多個
 *    text run，這裡把每個跨 run 的標記合併回單一 <w:t>，
 *    docx-preview 的文字節點與 docxtemplater 的填值才抓得到完整標記。
 * 3. 掃描全部 {{key}} 變數與出現次數，並回報防呆警告。
 */
export function normalizeAndScan(raw: ArrayBuffer, fileSize: number): NormalizedDocx {
  if (fileSize > MAX_FILE_SIZE) throw new Error('檔案超過 10MB 上限')

  let zip: PizZip
  try {
    zip = new PizZip(raw)
  } catch {
    throw new Error('無法解析檔案：請確認是 .docx（Word 2007+）格式')
  }
  const docFile = zip.file('word/document.xml')
  if (!docFile) throw new Error('不是有效的 Word 檔（找不到 word/document.xml）')

  const dom = new DOMParser().parseFromString(docFile.asText(), 'application/xml')
  if (dom.getElementsByTagName('parsererror').length > 0) {
    throw new Error('DOCX 內容解析失敗')
  }

  const warnings: string[] = []
  const counts = new Map<string, number>()

  const paragraphs = dom.getElementsByTagName('w:p')
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i]
    const tNodes = Array.from(p.getElementsByTagName('w:t'))
    if (tNodes.length === 0) continue

    const texts = tNodes.map((t) => t.textContent ?? '')
    const full = texts.join('')
    if (!full.includes('{{')) {
      if (full.includes('}}')) warnings.push(`發現疑似未配對的「}}」：「${snippet(full)}」`)
      continue
    }

    // 每個字元屬於哪個 w:t
    const owners: number[] = []
    texts.forEach((text, idx) => {
      for (let c = 0; c < text.length; c++) owners.push(idx)
    })

    // 找出所有標記；跨 run 的標記把整段字元「搬到」起始 run
    const targetOf = owners.slice()
    let m: RegExpExecArray | null
    let matched = 0
    TOKEN_RE.lastIndex = 0
    while ((m = TOKEN_RE.exec(full)) !== null) {
      matched++
      const start = m.index
      const end = start + m[0].length
      for (let c = start; c < end; c++) targetOf[c] = owners[start]

      const key = m[1].trim()
      if (!key) {
        warnings.push('發現空白標記 {{ }}，已忽略——標記內需填欄位名稱')
        continue
      }
      if (!VALID_KEY_RE.test(key)) {
        warnings.push(`欄位名稱「${key}」含空白或特殊符號，可能無法正確填值，建議只用中文、英數與底線`)
      }
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    const openCount = (full.match(/\{\{/g) ?? []).length
    if (openCount > matched) {
      warnings.push(`發現疑似未閉合的「{{」標記：「${snippet(full)}」`)
    }

    // 依 targetOf 重寫各 w:t 的文字（未涉及標記的段落不變）
    const rebuilt = texts.map(() => '')
    for (let c = 0; c < full.length; c++) rebuilt[targetOf[c]] += full[c]
    tNodes.forEach((t, idx) => {
      if ((t.textContent ?? '') !== rebuilt[idx]) {
        t.textContent = rebuilt[idx]
        t.setAttribute('xml:space', 'preserve')
      }
    })
  }

  // 頁首頁尾不在支援範圍，若含標記要提醒
  for (const name of Object.keys(zip.files)) {
    if (/^word\/(header|footer)\d*\.xml$/.test(name) && zip.file(name)!.asText().includes('{{')) {
      warnings.push('頁首／頁尾中的 {{ }} 標記不支援，將不會被填值')
      break
    }
  }

  const vars = Array.from(counts.entries()).map(([key, count]) => ({ key, count }))

  zip.file('word/document.xml', new XMLSerializer().serializeToString(dom))
  const buffer = zip.generate({ type: 'arraybuffer' }) as ArrayBuffer

  return { buffer, vars, warnings: Array.from(new Set(warnings)) }
}

function snippet(text: string): string {
  const at = text.indexOf('{{') >= 0 ? text.indexOf('{{') : text.indexOf('}}')
  const s = text.slice(Math.max(0, at - 10), at + 20)
  return s.length < text.length ? `…${s}…` : s
}
