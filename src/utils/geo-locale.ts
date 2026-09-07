import type { Locale } from '@/i18n'

const ZH_COUNTRIES = new Set(['CN', 'HK', 'MO', 'TW'])
const LOOKUP_MS = 2000

export function localeFromCountry(code?: string | null): Locale {
  return code && ZH_COUNTRIES.has(code.toUpperCase()) ? 'zh' : 'en'
}

/** Parse a single IP from a header value or query param. Rejects hostnames to avoid SSRF. */
export function parseIp(raw?: string | null): string | null {
  if (!raw) return null
  let ip = raw.trim()
  if (!ip) return null
  if (ip.startsWith('[') && ip.includes(']')) {
    ip = ip.slice(1, ip.indexOf(']'))
  } else if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7)
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(ip)) {
    ip = ip.replace(/:\d+$/, '')
  }
  if (isIpv4(ip) || isIpv6(ip)) return ip
  return null
}

export function isPrivateIp(ip: string): boolean {
  if (ip.startsWith('::ffff:')) ip = ip.slice(7)
  if (isIpv4(ip)) {
    const [a, b] = ip.split('.').map(Number)
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    )
  }
  const lower = ip.toLowerCase()
  if (lower === '::1' || lower === '::') return true
  if (lower.startsWith('fe80:')) return true
  const first = Number.parseInt(lower.split(':', 1)[0] || '0', 16)
  // fc00::/7 unique local
  return (first & 0xfe00) === 0xfc00
}

export function getClientIp(request: Request, clientAddress?: string): string | null {
  const candidates: string[] = []
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    for (const part of forwarded.split(',')) {
      const ip = parseIp(part)
      if (ip) candidates.push(ip)
    }
  }
  for (const header of ['cf-connecting-ip', 'true-client-ip', 'x-real-ip'] as const) {
    const ip = parseIp(request.headers.get(header))
    if (ip) candidates.push(ip)
  }
  const fromAstro = parseIp(clientAddress)
  if (fromAstro) candidates.push(fromAstro)

  return candidates.find((ip) => !isPrivateIp(ip)) ?? candidates[0] ?? null
}

export async function lookupLocaleByIp(
  ip: string | null,
  fallback: Locale = 'en'
): Promise<Locale> {
  if (!ip || isPrivateIp(ip)) return fallback
  const code = (await lookupIpApi(ip)) ?? (await lookupIpWho(ip))
  return code ? localeFromCountry(code) : fallback
}

function isIpv4(ip: string): boolean {
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false
    const n = Number(part)
    return n >= 0 && n <= 255 && String(n) === part
  })
}

function isIpv6(ip: string): boolean {
  if (!/^[0-9a-fA-F:]+$/.test(ip) || !ip.includes(':')) return false
  if (ip.split('::').length > 2) return false
  const groups = ip.split(':').filter(Boolean)
  return groups.length <= 8 && groups.every((g) => g.length <= 4)
}

async function lookupIpApi(ip: string): Promise<string | null> {
  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode`,
      { signal: AbortSignal.timeout(LOOKUP_MS) }
    )
    if (!res.ok) return null
    const data = (await res.json()) as { status?: string; countryCode?: string }
    if (data.status === 'success' && data.countryCode) return data.countryCode
  } catch {
    /* timeout or network */
  }
  return null
}

async function lookupIpWho(ip: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://ipwho.is/${encodeURIComponent(ip)}?fields=country_code,success`,
      { signal: AbortSignal.timeout(LOOKUP_MS) }
    )
    if (!res.ok) return null
    const data = (await res.json()) as { success?: boolean; country_code?: string }
    if (data.success !== false && data.country_code) return data.country_code
  } catch {
    /* timeout or network */
  }
  return null
}
