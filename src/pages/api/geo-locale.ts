import type { APIRoute } from 'astro'

import { getClientIp, lookupLocaleByIp, parseIp } from '@/utils/geo-locale'

export const prerender = false

export const GET: APIRoute = async ({ request, clientAddress }) => {
  let ip = getClientIp(request, clientAddress)
  if (import.meta.env.DEV) {
    const override = parseIp(new URL(request.url).searchParams.get('ip'))
    if (override) ip = override
  }

  const locale = await lookupLocaleByIp(ip)
  return new Response(JSON.stringify({ locale }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store'
    }
  })
}
