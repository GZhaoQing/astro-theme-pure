import type { APIRoute } from 'astro'

export const prerender = false

function htmlPage(script: string) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Logging in…</title>
  </head>
  <body>
    <p>Completing GitHub login…</p>
    <script>
      ${script}
    </script>
  </body>
</html>`
}

function postToOpener(message: string) {
  return htmlPage(`
    (function () {
      function receiveMessage(event) {
        window.opener.postMessage(${JSON.stringify(message)}, event.origin)
        window.removeEventListener('message', receiveMessage, false)
      }
      window.addEventListener('message', receiveMessage, false)
      window.opener.postMessage('authorizing:github', '*')
    })()
  `)
}

export const GET: APIRoute = async ({ url, cookies }) => {
  const clientId = import.meta.env.GITHUB_CLIENT_ID
  const clientSecret = import.meta.env.GITHUB_CLIENT_SECRET
  const code = url.searchParams.get('code')
  const returnedState = url.searchParams.get('state')
  const expectedState = cookies.get('oauth_state')?.value

  cookies.delete('oauth_state', { path: '/' })

  const fail = (message: string) =>
    new Response(
      postToOpener(`authorization:github:error:${JSON.stringify({ message, provider: 'github' })}`),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )

  if (!clientId || !clientSecret) {
    return fail('Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET')
  }
  if (!code) {
    return fail('Missing OAuth code')
  }
  if (!expectedState || returnedState !== expectedState) {
    return fail('Invalid OAuth state')
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    })

    const body = await response.json()
    if (!response.ok || body.error || !body.access_token) {
      return fail(body.error_description || body.error || 'GitHub OAuth failed')
    }

    const success = `authorization:github:success:${JSON.stringify({
      token: body.access_token,
      provider: 'github'
    })}`

    return new Response(postToOpener(success), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  } catch {
    return fail('GitHub OAuth request failed')
  }
}
