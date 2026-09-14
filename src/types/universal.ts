/**
 * Types — re-export Universal SDUI types from fajrina-sdui (agnostic)
 * Avoid vue-tsc namespace issue by using local type alias where needed
 */
export const DEFAULT_MERCHANT = 'merchant_demo'
export const DEFAULT_PAGE = 'home'

export type RouteParams = {
  merchantId?: string
  pageKey?: string
}
