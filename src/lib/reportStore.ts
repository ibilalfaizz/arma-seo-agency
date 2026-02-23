type ReportStatus = 'pending' | 'complete' | 'error'

interface ReportEntry {
  status: ReportStatus
  data?: any
  error?: string
  updatedAt: number
}

const store = new Map<number, ReportEntry>()

export const markReportPending = (id: number, meta?: Record<string, unknown>) => {
  store.set(id, { status: 'pending', data: meta, updatedAt: Date.now() })
}

export const markReportComplete = (id: number, data: any) => {
  store.set(id, { status: 'complete', data, updatedAt: Date.now() })
}

export const markReportError = (id: number, error: string) => {
  store.set(id, { status: 'error', error, updatedAt: Date.now() })
}

export const getReportStatus = (id: number) => {
  return store.get(id)
}
