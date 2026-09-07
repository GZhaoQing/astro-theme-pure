import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = ({ cookies, redirect }) => {
  const clientId = import.meta.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return new Response(
      'Missing GITHUB_CLIENT_ID. Create a GitHub OAuth App and set GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET.',
      { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    )
  }

  const state = crypto.randomUUID()
  cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    path: '/',
    maxAge: 600,
    sameSite: 'lax'
  })

  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'repo,user',
    state
  })

  return redirect(`https://github.com/login/oauth/authorize?${params.toString()}`)
}
