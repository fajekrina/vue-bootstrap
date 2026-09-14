/**
 * Route utils — resolve merchant/page from params + query fallback
 */
import { DEFAULT_MERCHANT, DEFAULT_PAGE } from '../types/universal'

export function resolveTarget(
  paramMid: string | undefined,
  paramKey: string | undefined,
  queryMid: string | undefined,
  queryKey: string | undefined,
  pathname: string
): { mid: string; key: string; shouldRedirect: string | null } {
  const mid = paramMid ?? queryMid ?? DEFAULT_MERCHANT
  const key = paramKey ?? queryKey ?? DEFAULT_PAGE

  if (!paramMid && !paramKey && !queryMid && !queryKey && pathname === '/') {
    return { mid, key, shouldRedirect: `/${mid}/${key}` }
  }
  if (paramMid && !paramKey && !queryKey && pathname === `/${paramMid}`) {
    return { mid, key, shouldRedirect: `/${mid}/${key}` }
  }
  return { mid, key, shouldRedirect: null }
}
