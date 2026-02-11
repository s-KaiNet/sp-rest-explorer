import { create } from 'zustand'
import type { AppStatus } from '@/lib/metadata/types'

interface AppState {
  status: AppStatus
  error: string | null
  setStatus: (status: AppStatus, error?: string) => void
}

export const useAppStore = create<AppState>()((set) => ({
  status: 'idle',
  error: null,
  setStatus: (status, error) => set({ status, error: error ?? null }),
}))
