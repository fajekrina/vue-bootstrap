<script setup lang="ts">
import { ref, watch } from 'vue'
import FajrinaBuilder from '@fajekrina/sdui/builder/vue'
import { universalMerchantRepository } from '../repositories/universalRepository'
type UniversalComponent = Record<string, unknown> & { id: string; type?: string }

const merchantId = ref('merchant_demo')
const pageKey = ref('')
const data = ref<unknown>(null)
const status = ref('')
const pages = ref<string[]>([])
const registry = ref<Record<string, {props?: Record<string, unknown>}>|undefined>(undefined)
fetch('/universal/components.json').then(r=>r.ok?r.json():null).then(j=>{ if(j?.components) registry.value=j.components; else if(j) registry.value=j as never }).catch(()=>{})

async function loadPages(mid: string) {
  try {
    const res = await universalMerchantRepository.listPages(mid)
    const list = res.pages ?? []
    pages.value = list
    if (!pageKey.value && list.includes('home')) pageKey.value='home'
    else if (!pageKey.value && list.length) pageKey.value=list[0]
    else if (pageKey.value && !list.includes(pageKey.value) && list.includes('home')) {
      // keep draft temp (unsaved) — will show empty, hilang saat refresh karena tidak di list
    }
  } catch { pages.value=[] }
}
watch(merchantId, (mid)=> loadPages(mid), { immediate: true })

watch([merchantId, pageKey], async ([mid, key]) => {
  if (!key) return
  if (pages.value.length && !pages.value.includes(key)) {
    data.value = { layout: { components: [] } } as unknown
    return
  }
  try { data.value = await universalMerchantRepository.getDraft(mid, key) } catch {}
})

async function handleNew() {
  const input = prompt('Nama page baru (huruf/angka/_/-):','my-page')
  if (!input) return
  const key = input.trim()
  if (!key) { status.value='PageKey wajib diisi'; setTimeout(()=>status.value='',3000); return }
  if (!/^[a-z0-9_-]+$/i.test(key)) { status.value='PageKey hanya huruf/angka/_/-'; setTimeout(()=>status.value='',3000); return }
  try {
    const { pages: list } = await universalMerchantRepository.listPages(merchantId.value)
    if (list.includes(key)) { status.value=`PageKey "${key}" sudah ada`; setTimeout(()=>status.value='',3000); return }
  } catch {}
  try {
    const existing = await universalMerchantRepository.getDraft(merchantId.value, key).catch(()=>null)
    if (existing && (existing as unknown as {layout?:unknown})?.layout) { status.value=`PageKey "${key}" sudah ada`; setTimeout(()=>status.value='',3000); return }
  } catch {}
  pageKey.value = key
  data.value = { layout: { components: [] } } as unknown
  status.value = `Draft baru "${key}" — belum tersimpan (hilang saat refresh)`
  setTimeout(()=>status.value='',3000)
}

async function onSave(payload: { components: UniversalComponent[] }) {
  let key = pageKey.value.trim()
  if (!key) {
    const input = prompt('pageKey baru:', 'my-page')
    if (!input) { status.value='Save gagal: pageKey wajib diisi'; setTimeout(()=>status.value='',3000); return }
    key = input.trim()
    if (!key) { status.value='Save gagal: pageKey wajib diisi'; setTimeout(()=>status.value='',3000); return }
  }
  if (!/^[a-z0-9_-]+$/i.test(key)) { status.value='Save gagal: pageKey hanya huruf/angka/_/-'; setTimeout(()=>status.value='',3000); return }
  const isNew = !pages.value.includes(key)
  if (isNew) {
    try {
      const { pages: list } = await universalMerchantRepository.listPages(merchantId.value)
      if (list.includes(key)) { status.value=`Save gagal: pageKey "${key}" sudah ada`; setTimeout(()=>status.value='',3000); return }
    } catch {}
  }
  try {
    await universalMerchantRepository.save(merchantId.value, key, payload.components as unknown[])
    pageKey.value = key
    data.value = { layout: { components: payload.components } } as unknown
    status.value = 'Saved ✔ ' + key
    setTimeout(() => (status.value = ''), 3000)
    loadPages(merchantId.value)
  } catch (e) { status.value = 'Save failed: ' + String((e as Error).message); setTimeout(()=>status.value='',3000) }
}

async function onPublish(payload: { components: UniversalComponent[] }) {
  const key = pageKey.value.trim()
  if (!key) { status.value = 'Publish gagal: pageKey wajib diisi — Save dulu'; setTimeout(()=>status.value='',3000); return }
  try {
    const existing = await universalMerchantRepository.getDraft(merchantId.value, key).catch(()=>null)
    if (!existing) { status.value=`Publish gagal: pageKey "${key}" belum ada — Save dulu`; setTimeout(()=>status.value='',3000); return }
  } catch {}
  try {
    await universalMerchantRepository.publish(merchantId.value, key)
    status.value = 'Published ✔ ' + key
    setTimeout(() => (status.value = ''), 3000)
  } catch (e) { status.value = 'Publish failed: ' + String((e as Error).message); setTimeout(()=>status.value='',3000) }
  try { data.value = await universalMerchantRepository.getDraft(merchantId.value, key) } catch {}
}
</script>

<template>
  <div style="height:100vh;display:flex;flex-direction:column;">
    <div style="display:flex;gap:8px;padding:8px;background:#1a1f35;align-items:center;flex-wrap:wrap;">
      <input v-model="merchantId" placeholder="merchantId" style="height:28px;border-radius:6px;border:1px solid #2c3354;background:#0f1220;color:#e6e9f5;padding:0 8px;font-size:13px;" />
      <select v-model="pageKey" style="height:28px;border-radius:6px;border:1px solid #2c3354;background:#0f1220;color:#e6e9f5;padding:0 8px;font-size:13px;min-width:180px;">
        <option v-for="p in pages" :key="p" :value="p">{{ p }}</option>
        <option v-if="pageKey && !pages.includes(pageKey)" :value="pageKey">{{ pageKey }} (draft)</option>
        <option v-if="!pages.length" value="">(no pages)</option>
      </select>
      <button @click="handleNew" style="height:28px;padding:0 12px;border-radius:6px;border:1px solid #6c8cff;background:#6c8cff;color:#fff;cursor:pointer;font-size:13px;">New</button>
      <span style="font-size:11px;color:#9aa3c7;">default home • draft hilang saat refresh jika belum save</span>
      <span style="margin-left:auto;font-size:12px;color:#3ad29f;">{{ status }}</span>
      <a href="/" style="font-size:12px;color:#6c8cff;">Home →</a>
    </div>
    <div style="flex:1;min-height:0;">
      <FajrinaBuilder :data="data as never" :registry="registry" :pages="pages" :merchantId="merchantId" :pageKey="pageKey" @save="onSave" @publish="onPublish" @change="(v: unknown)=> data = v" />
    </div>
  </div>
</template>
