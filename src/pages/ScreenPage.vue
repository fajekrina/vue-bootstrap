<script setup lang="ts">
/**
 * ScreenPage — any spec screen of universal-service, rendered by the @fajekrina/sdui engine.
 * Route: /:merchantId/:screenKey?param=… — query params become the screen's seed data
 * (navigate params such as seatId), so `{{seatId}}` resolves.
 * Before each screen the version manifest is refreshed, so a just-published release shows.
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SduiScreen } from '@fajekrina/sdui/vue'
import type { SduiProps } from '@fajekrina/sdui'
import { createSduiEngine } from '../sdui/engine'
import { DEFAULT_MERCHANT, DEFAULT_SCREEN } from '../sdui/config'

const route = useRoute()
const router = useRouter()
const merchantId = computed(() => String(route.params.merchantId ?? DEFAULT_MERCHANT))
const screenKey = computed(() => String(route.params.screenKey ?? DEFAULT_SCREEN))
const seed = computed(() => Object.fromEntries(Object.entries(route.query).map(([k, v]) => [k, String(Array.isArray(v) ? v[0] : v ?? '')])))

function toQuery(params: SduiProps): Record<string, string> {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== null && typeof v !== 'object').map(([k, v]) => [k, String(v)]))
}

const engine = computed(() => createSduiEngine({
  merchantId: merchantId.value,
  navigate: (key, params) => { void router.push({ path: `/${merchantId.value}/${key}`, query: toQuery(params) }) }
}))

const ready = ref(false)
watch([engine, screenKey], () => {
  ready.value = false
  engine.value.refreshManifest().catch((e) => console.warn('[sdui] manifest', e)).finally(() => { ready.value = true })
}, { immediate: true })
</script>

<template>
  <div class="min-vh-100 bg-light">
    <nav class="navbar bg-white border-bottom px-4 py-2 small">
      <strong>SDUI Demo · Vue + Bootstrap</strong>
      <span class="text-secondary ms-3">{{ merchantId }} / {{ screenKey }}</span>
      <a href="/admin/builder" class="ms-auto">Builder →</a>
    </nav>
    <main class="container" style="max-width: 960px">
      <SduiScreen v-if="ready" :key="`${merchantId}/${screenKey}/${JSON.stringify(seed)}`" :engine="engine" :source="{ key: screenKey }" :seed="seed" />
    </main>
  </div>
</template>
