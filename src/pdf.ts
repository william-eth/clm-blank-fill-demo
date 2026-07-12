import html2pdf from 'html2pdf.js'

/**
 * 對預覽容器產生 A4 PDF 並下載（完全在瀏覽器內進行，不上傳伺服器）。
 * 採 html2canvas 光柵化策略：繁體中文以系統字型繪製後轉入 PDF，
 * 不需嵌入中文字型檔；代價是 PDF 內文字不可選取（README 已說明取捨）。
 */
export async function downloadPdf(element: HTMLElement, filename: string): Promise<void> {
  await html2pdf()
    .set({
      margin: [14, 16, 16, 16],
      filename,
      image: { type: 'jpeg', quality: 0.96 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        // html2canvas 的已知 bug：inline 元素（挖空 span）跨行折行時，
        // 同一行的純文字節點會被丟失。產 PDF 前先把挖空 span 攤平成
        // 純文字（保留 <br>），段落變成純文字流即可正確渲染；
        // 同時 PDF 也因此不帶填寫高亮，更接近簽署／歸檔版型。
        onclone: (clonedDoc: Document) => {
          clonedDoc.querySelectorAll('.filled-value, .pending-value').forEach((span) => {
            const parent = span.parentNode
            if (!parent) return
            while (span.firstChild) parent.insertBefore(span.firstChild, span)
            parent.removeChild(span)
          })
        },
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      // avoid 需涵蓋一般段落，否則跨頁段落會被光柵切到半個字；
      // 跨頁的整段改推到下一頁（超過一頁高的段落仍無法避免切割）
      pagebreak: { mode: ['css', 'legacy'], avoid: ['h1', 'h2', '.doc-heading', '.doc-para'] },
    })
    .from(element)
    .save()
}
