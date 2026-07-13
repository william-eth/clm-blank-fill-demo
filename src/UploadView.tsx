import { useRef, useState } from 'react'
import { normalizeAndScan, type NormalizedDocx } from './normalizeDocx'

export interface UploadedDoc extends NormalizedDocx {
  /** 原始檔名（去除 .docx），作為之後 PDF／DOCX 下載檔名 */
  name: string
}

interface Props {
  onLoaded: (doc: UploadedDoc) => void
  onBack: () => void
}

/** 上傳自訂 DOCX：標記說明 + 選檔 + 掃描結果防呆 */
export default function UploadView({ onLoaded, onBack }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleFile = async (file: File) => {
    setError(null)
    if (!file.name.toLowerCase().endsWith('.docx')) {
      setError('請選擇 .docx 檔案（Word 2007 以上格式；不支援 .doc）')
      return
    }
    setBusy(true)
    try {
      const raw = await file.arrayBuffer()
      const result = normalizeAndScan(raw, file.size)
      if (result.vars.length === 0) {
        setError(
          '這份文件裡找不到任何 {{欄位名稱}} 挖空標記。請先在 Word 中於要填寫處輸入標記（見下方說明）後再上傳。',
        )
        return
      }
      onLoaded({ ...result, name: file.name.replace(/\.docx$/i, '') })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="upload-view">
      <h2 className="section-title">上傳自訂範本（DOCX）</h2>
      <p className="form-pane-desc">
        檔案只在你的瀏覽器中處理，不會上傳到任何伺服器；離開或重新整理即清空。
      </p>

      <div className="upload-box">
        <input
          ref={inputRef}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
        <button className="btn btn-primary" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? '解析中…' : '選擇 DOCX 檔案'}
        </button>
        <button className="btn btn-ghost" onClick={onBack}>
          返回範本列表
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <div className="help-card">
        <h3>如何在 Word 裡標挖空？</h3>
        <ol>
          <li>
            在 Word 文件中要讓使用者填寫的位置，輸入雙大括號標記：
            <code>{'{{對方公司名稱}}'}</code>、<code>{'{{effective_date}}'}</code>。
            中文、英文、數字、底線都可以當欄位名稱。
          </li>
          <li>
            <strong>同名標記＝同一欄位</strong>：文件中多處出現 <code>{'{{對方公司名稱}}'}</code>，
            填一次就會全部帶入。
          </li>
          <li>
            系統會依名稱自動推斷輸入類型（下一步可修改）：
            名稱含「日期／date」→ 日期選擇器；含「內容、範圍、說明、備註、地址／desc」→ 多行長文；
            其餘為單行文字。
          </li>
          <li>上傳後可再逐欄調整顯示名稱、提示文字、輸入類型與是否必填。</li>
        </ol>
        <h3>限制</h3>
        <ul>
          <li>頁首、頁尾、文字方塊內的標記不支援。</li>
          <li>標記內請勿換行或使用大括號；建議整個標記一次輸入完，避免被 Word 拆散（系統會盡量自動修復）。</li>
          <li>檔案上限 10MB；預覽與 PDF 為瀏覽器渲染，版面精準度不等於 Microsoft Word。</li>
        </ul>
      </div>
    </div>
  )
}
