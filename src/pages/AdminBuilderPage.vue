<script setup lang="ts">
/**
 * AdminBuilderPage — the @fajekrina/sdui Studio on universal-service spec screens.
 * Pick a screen (or start a new one), edit it, Save draft / Publish. The action editor
 * offers this app's allow-lists (screen keys, request and link names) — names, never URLs.
 */
import { ref, watch } from 'vue'
import SduiBuilder, { EditorDocument } from '@fajekrina/sdui/builder/vue'
import { createScreenService, blankScreen, SCREEN_KEY } from '../services/screenService'
import { DEFAULT_MERCHANT, DEFAULT_SCREEN, ENDPOINTS, LINKS, assetURL } from '../sdui/config'

const REQUESTS = Object.keys(ENDPOINTS)
const LINK_NAMES = Object.keys(LINKS)

const service = createScreenService()
const doc = new EditorDocument()
const merchantId = ref(DEFAULT_MERCHANT)
const screens = ref<string[]>([])
const current = ref('')
const notice = ref('')

async function refresh() {
  try { screens.value = await service.list(merchantId.value) } catch (e) { notice.value = `Daftar screen gagal dimuat: ${(e as Error).message}` }
}

async function open(key: string) {
  try {
    doc.importJSON(await service.open(merchantId.value, key) as object)
    current.value = key
    notice.value = ''
  } catch (e) { notice.value = `Gagal membuka ${key}: ${(e as Error).message}` }
}

watch(merchantId, async () => {
  current.value = ''
  await refresh()
  // open the default screen once the list arrives
  if (screens.value.length) await open(screens.value.includes(DEFAULT_SCREEN) ? DEFAULT_SCREEN : screens.value[0]!)
}, { immediate: true })

function create() {
  const key = prompt('Key screen baru (huruf/angka/_, diawali huruf):', 'promoBanner')?.trim()
  if (!key) return
  if (!SCREEN_KEY.test(key)) { notice.value = 'Key tidak valid: huruf/angka/_ dan diawali huruf'; return }
  if (screens.value.includes(key)) { notice.value = `Screen "${key}" sudah ada`; return }
  service.forget(key)
  doc.importJSON(blankScreen(key))
  current.value = key
  notice.value = `Screen baru "${key}" — belum tersimpan`
}

// Studio shows "Saved ✔" / "Save failed: …"; an error thrown here is the failure message
async function onSave(payload: unknown) {
  const result = await service.save(merchantId.value, payload)
  current.value = result.key
  notice.value = result.unchanged ? 'Tidak ada perubahan' : ''
  await refresh()
}
async function onPublish(payload: unknown) {
  const result = await service.publish(merchantId.value, payload)
  current.value = result.key
  notice.value = result.unchanged ? `Sudah terpublikasi (v${result.sequence})` : `Terpublikasi v${result.sequence} — buka /${merchantId.value}/${result.key}`
  await refresh()
}
</script>

<template>
  <div class="d-flex flex-column vh-100 bg-light">
    <div class="d-flex flex-wrap align-items-center gap-2 border-bottom bg-white px-3 py-2 small">
      <strong>Builder</strong>
      <input v-model.trim="merchantId" class="form-control form-control-sm w-auto" aria-label="merchantId" />
      <select :value="current" class="form-select form-select-sm w-auto" aria-label="Screen" @change="open(($event.target as HTMLSelectElement).value)">
        <option v-for="k in screens" :key="k" :value="k">{{ k }}</option>
        <option v-if="current && !screens.includes(current)" :value="current">{{ current }} (baru)</option>
      </select>
      <button class="btn btn-primary btn-sm" @click="create">Screen baru</button>
      <span class="text-secondary">{{ notice }}</span>
      <a v-if="current" class="ms-auto" :href="`/${merchantId}/${current}`" target="_blank" rel="noreferrer">Lihat di klien →</a>
    </div>
    <div class="flex-grow-1 p-2" style="min-height: 0">
      <SduiBuilder
        :document="doc"
        :title="current ? `${merchantId} / ${current}` : merchantId"
        :screens="screens"
        :requests="REQUESTS"
        :links="LINK_NAMES"
        :assetURL="assetURL"
        :onSave="onSave"
        :onPublish="onPublish"
      />
    </div>
  </div>
</template>
