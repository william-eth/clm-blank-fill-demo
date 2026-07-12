export type FieldType = 'text' | 'textarea' | 'date'

export interface TemplateField {
  key: string
  label: string
  hint: string
  required: boolean
  type: FieldType
}

export interface TemplateMeta {
  id: string
  name: string
  description: string
  file: string
  fields: TemplateField[]
}

export interface TemplateIndex {
  templates: TemplateMeta[]
}

/** 從 DOCX 解析出的一個段落（唯讀條文） */
export interface DocParagraph {
  style: 'title' | 'heading' | 'normal'
  align: 'left' | 'center' | 'right' | 'justify'
  text: string
}

export type FormValues = Record<string, string>
