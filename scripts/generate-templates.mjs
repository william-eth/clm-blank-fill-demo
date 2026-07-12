// 依 templates-def.mjs 產生三份繁體中文示範 DOCX（公版母稿）與 index.json（metadata）。
// 執行：npm run templates（build 前會自動執行）
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'
import { templates } from './templates-def.mjs'

const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/templates')

const EAST_ASIA_FONT = '微軟正黑體'

function buildParagraph(p) {
  const font = { ascii: 'Calibri', eastAsia: EAST_ASIA_FONT, hAnsi: 'Calibri' }
  switch (p.type) {
    case 'title':
      return new Paragraph({
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text: p.text, bold: true, size: 36, font, color: '000000' })],
      })
    case 'heading':
      return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
        children: [new TextRun({ text: p.text, bold: true, size: 26, font, color: '000000' })],
      })
    case 'blank':
      return new Paragraph({ children: [] })
    default: {
      const alignment =
        p.type === 'center'
          ? AlignmentType.CENTER
          : p.type === 'right'
            ? AlignmentType.RIGHT
            : AlignmentType.JUSTIFIED
      return new Paragraph({
        alignment,
        spacing: { after: 120, line: 320 },
        // 挖空標記 {{snake_case}} 必須保持在同一個 run 內，
        // docxtemplater 與前端解析才不會遇到被 Word 拆散的標記。
        children: [new TextRun({ text: p.text, size: 24, font })],
      })
    }
  }
}

async function main() {
  await mkdir(outDir, { recursive: true })

  for (const t of templates) {
    const doc = new Document({
      creator: 'clm-blank-fill-demo',
      title: t.name,
      sections: [
        {
          properties: {
            page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
          },
          children: t.paragraphs.map(buildParagraph),
        },
      ],
    })
    const buffer = await Packer.toBuffer(doc)
    const file = path.join(outDir, t.file)
    await writeFile(file, buffer)
    console.log(`✓ ${t.file} (${buffer.length} bytes)`)
  }

  // metadata：卡片列表 + 每個挖空欄位的 key／顯示名稱／提示／必填／input 類型
  const index = {
    templates: templates.map(({ id, name, description, file, fields }) => ({
      id,
      name,
      description,
      file,
      fields,
    })),
  }
  await writeFile(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2) + '\n')
  console.log('✓ index.json')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
