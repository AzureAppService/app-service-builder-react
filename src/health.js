export async function checkHealth() {
  const response = await fetch('/health.json', { cache: 'no-store', signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new Error('HTTP health failure')
  const body = await response.json()
  if (body.status !== 'ok' || body.app !== 'app-service-builder-react') throw new Error('Unexpected health response')
  return 'Static health file is reachable. This checks file serving, not a running backend or Azure deployment status.'
}
