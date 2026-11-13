import { useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import './App.css'
import { checkHealth } from './health'

const appInfo = {
  app: 'app-service-builder-react',
  version: '1.0.0',
  framework: 'React 19 with Vite 8',
  deploymentMarker: import.meta.env.VITE_DEPLOYMENT_MARKER ?? 'local',
  buildMarker: import.meta.env.VITE_BUILD_MARKER ?? 'local',
}

function Layout({ eyebrow, title, children }) {
  return (
    <main>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children}
    </main>
  )
}

function Home() {
  const [count, setCount] = useState(0)
  const [checking, setChecking] = useState(false)
  const [health, setHealth] = useState('Check the static health file without leaving this page.')

  async function refreshHealth() {
    setChecking(true)
    setHealth('Checking /health.json…')
    try {
      setHealth(await checkHealth())
    } catch {
      setHealth('Static health check failed. Retry, or inspect /health.json and your static host configuration.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <Layout eyebrow="App Service Builder / React" title="React Vite SPA is running">
      <p>
        This sample renders in your browser with React and Vite.
      </p>

      <nav aria-label="Test routes">
        <Link className="button" to="/products/widget-1">
          Open the deep route
        </Link>
        <button className="secondary" type="button" disabled={checking} onClick={refreshHealth}>
          {checking ? 'Checking health…' : 'Check static health'}
        </button>
        <a href="/version.json">View version JSON</a>
      </nav>
      <p className="health-result" role="status">{health}</p>

      <button
        className="counter"
        type="button"
        onClick={() => setCount((current) => current + 1)}
      >
        Interaction count: {count}
      </button>

      <section aria-labelledby="deployment-heading">
        <h2 id="deployment-heading">Deployment details</h2>
        <dl>
          <div>
            <dt>Application</dt>
            <dd>
              {appInfo.app} {appInfo.version}
            </dd>
          </div>
          <div>
            <dt>Framework</dt>
            <dd>{appInfo.framework}</dd>
          </div>
          <div>
            <dt>Deployment</dt>
            <dd>{appInfo.deploymentMarker}</dd>
          </div>
          <div>
            <dt>Build setting</dt>
            <dd>{appInfo.buildMarker}</dd>
          </div>
        </dl>
      </section>
      <details>
        <summary>Customize this sample</summary>
        <p>In your fork, edit the home page in <code>src/App.jsx</code> and the styles in
          <code> src/App.css</code>. Commit your changes and deploy your fork through your Builder App.</p>
      </details>
      <nav className="documentation" aria-label="Documentation">
        <a href="https://react.dev/">Framework documentation</a>
        <a href="https://builderapps.azure.com/docs/">App Service Builder documentation</a>
      </nav>
    </Layout>
  )
}

function Product() {
  return (
    <Layout eyebrow="Client-side deep-link test" title="Widget 1">
      <p>
        This React Router route proves that navigation and direct requests to a
        nested SPA path work when the host serves the SPA shell.
      </p>
      <nav>
        <Link className="button" to="/">
          Return home
        </Link>
      </nav>
    </Layout>
  )
}

function NotFound() {
  return (
    <Layout eyebrow="Client-side 404" title="Page not found">
      <p>
        The static host returned the SPA shell, and React Router handled this
        unknown route.
      </p>
      <nav>
        <Link className="button" to="/">
          Return home
        </Link>
      </nav>
    </Layout>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products/widget-1" element={<Product />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
