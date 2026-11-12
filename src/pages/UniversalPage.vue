<script setup lang="ts">
/**
 * UniversalPage — GENERIC page built purely from JSON
 * Loads GET /api/universal/client/page/{mid}/{key} via service-repo composable (ETag + last-good cache).
 * Navigation actions go through the SDUI NavigationPort wired to vue-router.
 */
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Fajrina from '@fajekrina/sdui/vue'
import type { FajrinaActionEvent, SduiPorts } from '@fajekrina/sdui'
import { useUniversalPage } from '../composables/useUniversalPage'
import { resolveTarget } from '../utils/route'

const route = useRoute()
const router = useRouter()
const { data, error, source, loadPage, submitAction } = useUniversalPage()

function currentMid(): string {
  const pm = route.params.merchantId as string | undefined
  const qMid = route.query.merchant as string | undefined
  return pm ?? qMid ?? 'merchant_demo'
}

watch(
  () => [route.params.merchantId, route.params.pageKey, route.query.merchant, route.query.page, route.path],
  async () => {
    const pm = route.params.merchantId as string | undefined
    const pk = route.params.pageKey as string | undefined
    const qMid = route.query.merchant as string | undefined
    const qKey = route.query.page as string | undefined
    const { mid, key, shouldRedirect } = resolveTarget(pm, pk, qMid, qKey, route.path)
    if (shouldRedirect) {
      router.replace(shouldRedirect)
      return
    }
    await loadPage(mid, key)
  },
  { immediate: true }
)

// SDUI never guesses URLs: the app's router is the NavigationPort
const ports = computed<SduiPorts>(() => ({
  navigation: {
    navigate: (target, params) => {
      const query: Record<string, string> = {}
      for (const [k, v] of Object.entries(params ?? {})) if (v != null) query[k] = String(v)
      router.push({ path: `/${currentMid()}/${target}`, query })
    },
    back: () => router.back(),
    openExternal: (href) => { window.open(href, '_blank', 'noopener') }
  }
}))

async function handleAction(ev: FajrinaActionEvent) {
  // navigate/back/toast/modal/externalLink are handled by the library (ports + UI store);
  // field errors are rendered by the library — only `submit` needs the backend.
  if (ev.behavior === 'blocked') { console.warn('[sdui] blocked action', ev.data); return }
  if (ev.behavior !== 'submit') return
  try {
    const json = await submitAction('submit', ev.data, ev.params ?? { target: ev.target ?? 'home' })
    if (json.success && (json.navigateTo || json.target)) router.push(`/${currentMid()}/${String(json.navigateTo ?? json.target)}`)
  } catch (e) {
    console.error(e)
  }
}
</script>

<template>
  <div v-if="error" class="alert alert-danger py-2 small m-3">{{ error }}</div>
  <div v-if="source === 'cache'" class="alert alert-warning py-2 small m-3">Offline — menampilkan versi tersimpan terakhir.</div>
  <Fajrina :data="data as never" :ports="ports" @action="handleAction" />
</template>
