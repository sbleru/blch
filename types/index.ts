export interface Human {
  name: string
  nameKana: string
  description: string
  kaigou: string
  kaigouKana: string
  zanpakuto: string
  zanpakutoKana: string
  bankai: string
  bankaiKana: string
  groupCode: GroupCode
  attribute1: string
  kaigou2: string
  kaigou2Kana: string
  zanpakuto2: string
  zanpakuto2Kana: string
  bankai2: string
  bankai2Kana: string
}

export type GroupCode = 'gotei13'|'espada'|'visored'|'other'|'all'