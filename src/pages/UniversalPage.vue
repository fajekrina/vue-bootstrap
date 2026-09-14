<script setup lang="ts">
/**
 * UniversalPage — GENERIC page built purely from JSON demo
 * Hits API GET /api/universal/client/page/{mid}/{key} only via service-repo composable
 */
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Fajrina from '@fajekrina/sdui/vue'
import { useUniversalPage } from '../composables/useUniversalPage'
import { resolveTarget } from '../utils/route'

type FajrinaEvent = { behavior?: string; action?: string; target?: string; data?: Record<string, unknown>; params?: Record<string, unknown> }

const route = useRoute()
const router = useRouter()
const { data, error, loadPage, submitAction } = useUniversalPage()

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

async function handleAction(ev: Record<string, unknown>) {
  const beh = (ev as FajrinaEvent).behavior
  const tgt = (ev as FajrinaEvent).target
  const act = (ev as FajrinaEvent).action
  const mid = currentMid()
  if (beh === 'navigate' && tgt) {
    router.push(`/${mid}/${tgt}`)
    return
  }
  if (beh || act) {
    try {
      const json = await submitAction(beh ?? act ?? '', (ev as FajrinaEvent).data, (ev as FajrinaEvent).params ?? { target: tgt ?? 'home' })
      const ok = Boolean((json as Record<string, unknown>).success)
      if (ok && ((json as Record<string, unknown>).navigateTo || (json as Record<string, unknown>).target)) {
        const t = String(((json as Record<string, unknown>).navigateTo ?? (json as Record<string, unknown>).target) as string)
        router.push(`/${mid}/${t}`)
      }
    } catch (e) {
      console.error(e)
    }
  }
}
</script>

<template>
<!--  <div style="min-height:100vh; background:#ffffff; color:#0f172a;">-->
<!--    <div class="container" style="max-width:1100px; padding:24px;">-->
      <div v-if="error" class="alert alert-danger py-2 small">{{ error }}</div>
      <Fajrina :data="data as unknown as never" @action="handleAction" />
<!--    </div>-->
<!--  </div>-->
</template>
