/**
 * Composable — useUniversalPage (Vue best practice, slim)
 * No route watch — pages handle route via utils/route.ts
 */
import { ref } from 'vue'
import { universalService, type UniversalService } from '../services/universalService'

export interface UseUniversalPageOptions {
  service?: UniversalService
}

export function useUniversalPage(opts: UseUniversalPageOptions = {}) {
  const service = opts.service ?? universalService

  const data = ref<unknown>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)

  async function loadPage(mid: string, key: string) {
    loading.value = true
    error.value = null
    try {
      const page = await service.getPublishedPage(mid, key)
      data.value = page
    } catch (e) {
      const msg = String((e as Error).message)
      error.value = msg
      data.value = service.toErrorPage(msg) as unknown
    } finally {
      loading.value = false
    }
  }

  async function submitAction(action: string, dataPayload?: Record<string, unknown>, params?: Record<string, unknown>) {
    return service.submitAction({ action, data: dataPayload, params })
  }

  return {
    data,
    error,
    loading,
    loadPage,
    submitAction
  }
}
