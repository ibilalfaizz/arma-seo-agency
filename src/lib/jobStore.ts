// In-memory store for job status
// In production, use Redis or a database
export interface JobStatus {
  id: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress?: number
  data?: any
  error?: string
  createdAt: number
}

export const jobStore = new Map<number, JobStatus>()

// Clean up old jobs (older than 1 hour)
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  jobStore.forEach((job, id) => {
    if (job.createdAt < oneHourAgo) {
      jobStore.delete(id)
    }
  })
}, 5 * 60 * 1000) // Run cleanup every 5 minutes
