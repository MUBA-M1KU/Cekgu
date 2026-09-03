import { BrowserRouter, Route, Routes } from 'react-router'
import { AppLayout } from './layouts/AppLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { AcceptableUse } from './pages/AcceptableUse'
import { Dashboard } from './pages/Dashboard'
import { Home } from './pages/Home'
import { HowItWorks } from './pages/HowItWorks'
import { NewCheck } from './pages/NewCheck'
import { Pricing } from './pages/Pricing'
import { Privacy } from './pages/Privacy'
import { Records } from './pages/Records'
import { RecordWorkspace } from './pages/RecordWorkspace'
import { SampleReport } from './pages/SampleReport'
import { Settings } from './pages/Settings'
import { SignIn } from './pages/SignIn'
import { Terms } from './pages/Terms'
import { Trust } from './pages/Trust'

// A record is the route back to progress, results and evidence: these are states of one
// object, not disconnected tools. PRODUCT.md Navigation model.
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="sample" element={<SampleReport />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="trust" element={<Trust />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="acceptable-use" element={<AcceptableUse />} />
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
