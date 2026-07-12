// 三份繁體中文示範公版範本的「單一事實來源」。
// generate-templates.mjs 會依此產生 public/templates/*.docx 與 index.json（metadata）。
//
// 段落 type 說明：
//   title   → Word「Title」樣式（置中大標）
//   heading → Word「Heading2」樣式（條文標題）
//   body    → 一般段落（兩端對齊）
//   center  → 置中段落
//   right   → 靠右段落
//   blank   → 空白段落（保留版面間距）
// 挖空標記一律使用 {{snake_case}}。

export const templates = [
  {
    id: 'nda',
    name: '保密合約（NDA）',
    description: '單向簡版保密合約：約定機密資訊之範圍、保密義務與存續期間。',
    file: 'nda.docx',
    fields: [
      {
        key: 'counterparty_name',
        label: '對方公司名稱',
        hint: '請輸入完整公司登記名稱，例如：範例科技股份有限公司',
        required: true,
        type: 'text',
      },
      {
        key: 'counterparty_tax_id',
        label: '對方統一編號',
        hint: '8 碼數字',
        required: true,
        type: 'text',
      },
      {
        key: 'effective_date',
        label: '生效日',
        hint: '本合約之生效日期',
        required: true,
        type: 'date',
      },
      {
        key: 'purpose',
        label: '合作目的',
        hint: '例如：評估雲端文件服務整合合作',
        required: true,
        type: 'text',
      },
      {
        key: 'confidential_scope',
        label: '保密資訊範圍',
        hint: '可填入長段落，說明雙方特別約定之機密資訊範圍；此欄位用於驗證長文自動換行。',
        required: true,
        type: 'textarea',
      },
    ],
    paragraphs: [
      { type: 'title', text: '保密合約書' },
      { type: 'blank', text: '' },
      {
        type: 'body',
        text: '本保密合約書（下稱「本合約」）由示範軟體股份有限公司（下稱「甲方」）與 {{counterparty_name}}（統一編號：{{counterparty_tax_id}}，下稱「乙方」）為進行 {{purpose}}（下稱「本目的」）之合作，就機密資訊之揭露與保護事宜，於 {{effective_date}} 共同締結，雙方同意條款如下：',
      },
      { type: 'heading', text: '第一條 機密資訊之定義' },
      {
        type: 'body',
        text: '本合約所稱機密資訊，指甲方因本目的所揭露、具潛在商業價值之一切資訊，包括但不限於財務資訊、營運計畫、產品規格、技術文件、研發資料、軟體程式、客戶名單、供應商名單及行銷策略。雙方特別約定之機密資訊範圍如下：{{confidential_scope}}',
      },
      { type: 'heading', text: '第二條 除外情形' },
      {
        type: 'body',
        text: '下列資訊不屬於機密資訊：(一) 揭露時已為乙方合法持有者；(二) 非因乙方之過失而已公開者；(三) 乙方於揭露前即已獨立開發且能舉證者；(四) 乙方自無保密義務之第三人合法取得且能舉證者；(五) 經甲方事前書面同意揭露者；(六) 依法令或法院、政府機關之命令而須揭露者。',
      },
      { type: 'heading', text: '第三條 保密義務' },
      {
        type: 'body',
        text: '乙方（即 {{counterparty_name}}）非經甲方事前書面同意，不得將機密資訊使用於本目的以外之用途，且僅得揭露予因本目的確有知悉必要之受僱人或代理人，並應確保其等遵守與本合約相同之保密義務。乙方應以善良管理人之注意義務保護機密資訊；如知悉機密資訊有遭洩漏之虞，應立即通知甲方並採取必要之補救措施。',
      },
      { type: 'heading', text: '第四條 合約期間' },
      {
        type: 'body',
        text: '本合約自生效日起算一年。本合約屆滿或終止後，乙方就已受領之機密資訊仍應負保密義務五年。',
      },
      { type: 'heading', text: '第五條 違約責任' },
      {
        type: 'body',
        text: '乙方違反本合約約定者，應賠償甲方因此所受之一切損害，包括但不限於律師費、訴訟費及因第三人請求所生之衍生費用。',
      },
      { type: 'heading', text: '第六條 準據法與管轄' },
      {
        type: 'body',
        text: '本合約以中華民國法律為準據法。因本合約所生之爭議，雙方同意以臺灣臺北地方法院為第一審管轄法院。',
      },
      { type: 'blank', text: '' },
      { type: 'body', text: '立合約書人' },
      { type: 'body', text: '甲方：示範軟體股份有限公司' },
      { type: 'body', text: '乙方：{{counterparty_name}}' },
      { type: 'body', text: '統一編號：{{counterparty_tax_id}}' },
      { type: 'blank', text: '' },
      { type: 'right', text: '中華民國 {{effective_date}}' },
    ],
  },
  {
    id: 'service',
    name: '服務合約（摘要版）',
    description: '中篇服務委託合約：服務內容、期間、報酬與智財、保密等約定。',
    file: 'service.docx',
    fields: [
      {
        key: 'counterparty_name',
        label: '受託方公司名稱',
        hint: '請輸入完整公司登記名稱',
        required: true,
        type: 'text',
      },
      {
        key: 'service_desc',
        label: '服務內容與範圍',
        hint: '可填入長段落，詳述服務項目、交付物與驗收標準；此欄位用於驗證長文自動換行。',
        required: true,
        type: 'textarea',
      },
      {
        key: 'fee_amount',
        label: '服務報酬（新臺幣）',
        hint: '例如：500,000',
        required: true,
        type: 'text',
      },
      {
        key: 'start_date',
        label: '合約起日',
        hint: '服務期間開始日',
        required: true,
        type: 'date',
      },
      {
        key: 'end_date',
        label: '合約迄日',
        hint: '服務期間屆滿日',
        required: true,
        type: 'date',
      },
    ],
    paragraphs: [
      { type: 'title', text: '服務合約書（摘要版）' },
      { type: 'blank', text: '' },
      {
        type: 'body',
        text: '示範軟體股份有限公司（下稱「甲方」）茲委託 {{counterparty_name}}（下稱「乙方」）提供服務，雙方同意條款如下：',
      },
      { type: 'heading', text: '第一條 服務內容' },
      {
        type: 'body',
        text: '乙方應依本合約提供之服務內容與範圍如下：{{service_desc}}',
      },
      { type: 'heading', text: '第二條 合約期間' },
      {
        type: 'body',
        text: '本合約期間自 {{start_date}} 起至 {{end_date}} 止。期滿如需展延，應由雙方另以書面合意之。',
      },
      { type: 'heading', text: '第三條 服務報酬與付款' },
      {
        type: 'body',
        text: '本合約服務報酬總額為新臺幣 {{fee_amount}} 元整（含稅）。乙方完成服務並經甲方驗收合格後，開立統一發票請款，甲方應於收受發票後三十日內給付。',
      },
      { type: 'heading', text: '第四條 智慧財產權' },
      {
        type: 'body',
        text: '乙方因履行本合約所完成之工作成果，其著作財產權及其他智慧財產權，自甲方付清報酬時起歸屬甲方所有。乙方並同意對甲方不行使著作人格權。',
      },
      { type: 'heading', text: '第五條 保密義務' },
      {
        type: 'body',
        text: '乙方因履行本合約而知悉或持有甲方之營業秘密或機密資訊者，非經甲方事前書面同意，不得洩漏予第三人或使用於本合約目的以外之用途。本條義務於本合約終止或屆滿後仍繼續有效。',
      },
      { type: 'heading', text: '第六條 合約終止' },
      {
        type: 'body',
        text: '任一方違反本合約約定，經他方以書面催告限期改善而屆期未改善者，他方得以書面通知終止本合約，並請求因此所受之損害賠償。',
      },
      { type: 'heading', text: '第七條 準據法與管轄' },
      {
        type: 'body',
        text: '本合約以中華民國法律為準據法。因本合約所生之爭議，雙方同意以臺灣臺北地方法院為第一審管轄法院。',
      },
      { type: 'blank', text: '' },
      { type: 'body', text: '立合約書人' },
      { type: 'body', text: '甲方：示範軟體股份有限公司' },
      { type: 'body', text: '乙方：{{counterparty_name}}' },
      { type: 'blank', text: '' },
      { type: 'right', text: '合約期間：{{start_date}} 至 {{end_date}}' },
    ],
  },
  {
    id: 'statement',
    name: '企業標誌使用聲明書',
    description: '短篇單向聲明書：聲明人同意示範軟體於行銷目的使用其企業標誌。',
    file: 'statement.docx',
    fields: [
      {
        key: 'declarant_name',
        label: '聲明人（公司）名稱',
        hint: '請輸入完整公司登記名稱',
        required: true,
        type: 'text',
      },
      {
        key: 'declaration_body',
        label: '聲明與授權內容',
        hint: '可填入長段落，說明授權使用之標誌項目、範圍與方式；此欄位用於驗證長文自動換行。',
        required: true,
        type: 'textarea',
      },
      {
        key: 'sign_date',
        label: '簽署日期',
        hint: '本聲明書之簽署日',
        required: true,
        type: 'date',
      },
    ],
    paragraphs: [
      { type: 'title', text: '聲明書' },
      { type: 'blank', text: '' },
      {
        type: 'body',
        text: '{{declarant_name}}（下稱「本公司」）同意示範軟體股份有限公司及其子公司與關係企業（以下統稱「示範集團公司」）於行銷、業務推廣及公關目的範圍內，得對外揭示本公司為示範集團公司之合作夥伴，並於該目的範圍內無償使用本公司之企業標誌（包含但不限於商標、企業名稱或標誌）。',
      },
      {
        type: 'body',
        text: '本公司之聲明與授權內容如下：{{declaration_body}}',
      },
      {
        type: 'body',
        text: '本公司如需終止本聲明書，應於終止日三十日前以書面通知示範集團公司。為此，特立此書為憑。',
      },
      { type: 'blank', text: '' },
      { type: 'body', text: '此致' },
      { type: 'body', text: '示範軟體股份有限公司' },
      { type: 'blank', text: '' },
      { type: 'body', text: '聲明人：{{declarant_name}}' },
      { type: 'body', text: '授權簽名人：＿＿＿＿＿＿＿＿＿＿（簽名）' },
      { type: 'blank', text: '' },
      { type: 'right', text: '{{sign_date}}' },
    ],
  },
]
