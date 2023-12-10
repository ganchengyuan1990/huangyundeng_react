
export type FormFileOut = { id: string, fname: string, url: string }
export type FormValueIn = string | boolean
export type FormValueOut = string | boolean | FormFileOut

export type FformModel = {
  id: string | number
  submitTime?: Date
  auditTime?: Date
  status?: 'editing' | 'auditing' | 'confirmed'
  values: Record<string, FormValueOut>
  formInterface: {
    name: string,
    columns: {
      key: string,
      name: string,
      tip?: string,
      valueType: 'primary_string' | 'string' | 'boolean' | 'file'
    }[]
  }
}
