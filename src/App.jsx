import { useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import './App.css'

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

  return (
    <Layout eyebrow="App Service Builder / React" title="React Vite SPA is running">
      <p>
        This page was rendered by React from a production Vite static bundle.
      </p>

      <nav aria-label="Test routes">
        <Link className="button" to="/products/widget-1">
          Open the deep route
        </Link>
        <a href="/health.json">View static health</a>
        <a href="/version.json">View version metadata</a>
      </nav>

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
