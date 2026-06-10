import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import App from "./App.tsx";

const DocsPage = lazy(() => import("./docs/DocsPage.tsx"));

/** The route tree: the landing at "/", the lazy-loaded product docs at "/docs/*". */
export default function AppRoutes() {
  return (
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
  );
}
