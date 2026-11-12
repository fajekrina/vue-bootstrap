/**
 * Composable — useUniversalPage (Vue best practice, slim)
 * No route watch — pages handle route via utils/route.ts
 */
import { ref, shallowRef } from 'vue'
import type { LoadResult } from '@fajekrina/sdui'
import { universalService, type UniversalService } from '../services/universalService'

export interface UseUniversalPageOptions {
  service?: UniversalService
}

export function useUniversalPage(opts: UseUniversalPageOptions = {}) {
  const service = opts.service ?? universalService

  const data = shallowRef<unknown>(null)
  const error = ref<string | null>(null)
  const source = ref<LoadResult['source'] | null>(null)
  const loading = ref(false)
  let abort: AbortController | null = null

  async function loadPage(mid: string, key: string) {
    abort?.abort()
    const ac = new AbortController()
    abort = ac
    loading.value = true
    const result = await service.loadPublishedPage(mid, key, ac.signal)
    if (ac.signal.aborted) return
    data.value = result.page
    source.value = result.source
    error.value = result.source === 'error' ? (result.errors[0]?.message ?? 'Failed to load page') : null
    loading.value = false
  }

  async function submitAction(action: string, dataPayload?: Record<string, unknown>, params?: Record<string, unknown>) {
    return service.submitAction({ action, data: dataPayload, params })
  }

  return { data, error, source, loading, loadPage, submitAction }
}
