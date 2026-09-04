import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AppLayout } from './layouts/AppLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { Dashboard } from './pages/Dashboard'
import { Home } from './pages/Home'
import { NewCheck } from './pages/NewCheck'
import { Records } from './pages/Records'
import { RecordWorkspace } from './pages/RecordWorkspace'
import { SampleReport } from './pages/SampleReport'
import { Settings } from './pages/Settings'
import { SignIn } from './pages/SignIn'

// A record is the route back to progress, results and evidence: these are states of one
// object, not disconnected tools. PRODUCT.md Navigation model.
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          {/* How It Works, Pricing and Trust are sections of the landing page now rather than
              routes of their own. The old paths are kept because they are linked from the README
              and from the deck, and they land on the section they named. */}
          <Route path="how-it-works" element={<Navigate to="/#how-it-works" replace />} />
          <Route path="pricing" element={<Navigate to="/#pricing" replace />} />
          <Route path="trust" element={<Navigate to="/#trust" replace />} />
          {/* The full sample stays a route: it is the working tool, filters and all, not a section. */}
          <Route path="sample" element={<SampleReport />} />
          <Route path="sign-in" element={<SignIn />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="new-check" element={<NewCheck />} />
          <Route path="records" element={<Records />} />
          <Route path="records/:id" element={<RecordWorkspace />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
