/** 一鍵帶入的假資料簽約對象（僅示範用，非真實公司） */
export interface FakeCompany {
  label: string
  values: Record<string, string>
}

export const fakeCompanies: FakeCompany[] = [
  {
    label: '範例科技股份有限公司',
    values: {
      counterparty_name: '範例科技股份有限公司',
      counterparty_tax_id: '12345678',
      declarant_name: '範例科技股份有限公司',
    },
  },
  {
    label: '測試雲端服務有限公司',
    values: {
      counterparty_name: '測試雲端服務有限公司',
      counterparty_tax_id: '87654321',
      declarant_name: '測試雲端服務有限公司',
    },
  },
]
