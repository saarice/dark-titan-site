import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// BrowserRouter, NOT HashRouter: the landing's section nav lives on #hash
// anchors (Nav, pillar rails, footer), and a HashRouter would hijack them as
// routes. Deep links on GitHub Pages survive via the dist/404.html copy of
// index.html (see the build script).
const DocsPage = lazy(() => import('./docs/DocsPage.tsx'))

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={BASE}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/docs/*"
          element={
            <Suspense fallback={null}>
              <DocsPage />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
