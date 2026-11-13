import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { stripVTControlCharacters } from 'node:util'
import { checkHealth } from './src/health.js'

test('static health checks file serving and rejects unhealthy or unrelated responses', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/health.json')
    assert.equal(options.cache, 'no-store')
    return new Response('{"status":"ok","app":"app-service-builder-react"}')
  })
  assert.match(await checkHealth(), /file serving, not a running backend/)
  for (const response of [
    new Response('Unavailable', { status: 503 }),
    new Response('{"status":"ok","app":"another-app"}'),
    new Response('not JSON'),
  ]) {
    globalThis.fetch.mock.mockImplementation(async () => response)
    await assert.rejects(checkHealth())
  }
  globalThis.fetch.mock.mockImplementation(async () => { throw new TypeError('offline') })
  await assert.rejects(checkHealth(), /offline/)
})

test('single component retains Vite detection and root routing', async () => {
  const manifest = await readFile(new URL('./builder.yaml', import.meta.url), 'utf8')
  assert.equal(manifest.replaceAll('\r\n', '\n'), `components:
  - name: site
    path: /
`)
})

test('build contains only the static site and public metadata', async () => {
  const entries = await readdir(new URL('./dist/', import.meta.url))
  assert.deepEqual(entries.sort(), ['assets', 'brand', 'health.json', 'index.html', 'version.json'])

  const health = JSON.parse(await readFile(new URL('./dist/health.json', import.meta.url), 'utf8'))
  const version = JSON.parse(await readFile(new URL('./dist/version.json', import.meta.url), 'utf8'))
  assert.deepEqual(health, { status: 'ok', app: 'app-service-builder-react' })
  assert.deepEqual(version, {
    app: 'app-service-builder-react',
    version: '1.0.0',
    framework: 'React 19 with Vite 8',
  })

  const assets = await readdir(new URL('./dist/assets/', import.meta.url))
  assert.ok(assets.some((name) => name.endsWith('.js')))
  assert.ok(assets.some((name) => name.endsWith('.css')))
  assert.ok(assets.every((name) => /^[\w-]+\.(js|css)$/.test(name)))
})

test('production preview serves SPA routes, assets, and JSON', { timeout: 20000 }, async (t) => {
  const preview = spawn(process.execPath, [
    fileURLToPath(new URL('./node_modules/vite/bin/vite.js', import.meta.url)),
    'preview', '--host', '127.0.0.1', '--port', '0', '--strictPort',
  ], {
    cwd: new URL('.', import.meta.url),
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const closed = new Promise((resolve) => preview.once('close', resolve))
  t.after(async () => {
    if (preview.exitCode === null && preview.signalCode === null) {
      preview.kill('SIGTERM')
    }
    await closed
  })

  const origin = await new Promise((resolve, reject) => {
    let output = ''
    const timeout = setTimeout(() => reject(new Error(`Preview did not become ready: ${output}`)), 10000)
    const finish = (error, url) => {
      clearTimeout(timeout)
      if (error) reject(error)
      else resolve(url)
    }
    preview.once('error', (error) => finish(error))
    preview.once('close', (code) => finish(new Error(`Preview exited (${code}): ${output}`)))
    preview.stderr.on('data', (chunk) => { output += chunk.toString() })
    preview.stdout.on('data', (chunk) => {
      output += chunk.toString()
      const url = stripVTControlCharacters(output).match(/http:\/\/127\.0\.0\.1:\d+\//)?.[0]
      if (url) finish(null, url)
    })
  })

  const root = await fetch(origin)
  assert.equal(root.status, 200)
  assert.match(root.headers.get('content-type'), /text\/html/)
  const html = await root.text()
  assert.match(html, /<title>App Service Builder: React sample<\/title>/)
  assert.match(html, /<div id="root"><\/div>/)
  assert.doesNotMatch(html, /\/src\/|node_modules/)

  for (const route of ['/products/widget-1', '/unknown-client-route']) {
    const response = await fetch(new URL(route, origin))
    assert.equal(response.status, 200)
    assert.equal(await response.text(), html)
  }

  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((match) => match[1])
  const styles = [...html.matchAll(/<link\b[^>]*\bhref="([^"]+\.css)"/g)].map((match) => match[1])
  assert.equal(scripts.length, 1)
  assert.equal(styles.length, 2)
  for (const [asset, contentType] of [
    ...scripts.map((asset) => [asset, /javascript/]),
    ...styles.map((asset) => [asset, /text\/css/]),
    ['/brand/builder.svg', /image\/svg\+xml/],
    ['/brand/react.png', /image\/png/],
  ]) {
    assert.match(asset, /^\/(?:assets\/[\w-]+\.(?:js|css)|brand\/[\w.-]+\.(?:css|svg|png))$/)
    const response = await fetch(new URL(asset, origin))
    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type'), contentType)
    assert.ok((await response.arrayBuffer()).byteLength > 0)
  }

  for (const [path, expected] of [
    ['/health.json', { status: 'ok', app: 'app-service-builder-react' }],
    ['/version.json', {
      app: 'app-service-builder-react',
      version: '1.0.0',
      framework: 'React 19 with Vite 8',
    }],
  ]) {
    const response = await fetch(new URL(path, origin))
    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type'), /application\/json/)
    assert.deepEqual(await response.json(), expected)
  }
})
