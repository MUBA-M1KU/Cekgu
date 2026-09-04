import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import type { RecordDetail } from '../../shared/types'
import { getSample } from '../api'
import { Hero } from './home/Hero'
import { HowItWorksSection } from './home/HowItWorksSection'
import { PricingSection } from './home/PricingSection'
import { SampleSection } from './home/SampleSection'
import { TrustBand } from './home/TrustBand'
import { TrustSection } from './home/TrustSection'
import { VerdictBand } from './home/VerdictBand'

// One page, four anchors. How It Works, Sample Report, Pricing and Trust and Privacy were four
// routes; a visitor who has never heard of Cekgu should not have to navigate to find out what it
// does. /sample is still its own route because the full record is a tool rather than a section.
//
// The sample is fetched once here and shared by the hero card and the worked example below, so
// both show the real record rather than a fixture and the page makes one request rather than two.
export function Home() {
  const [record, setRecord] = useState<RecordDetail | null>(null)
  const { hash } = useLocation()

  useEffect(() => {
    // A landing page that cannot reach the API is still a landing page. Both consumers reserve
    // their space and degrade to a quiet line, so a failure here costs nothing above the fold.
    getSample()
      .then(setRecord)
      .catch(() => setRecord(null))
  }, [])

  // The browser tries to scroll to a fragment before React has mounted the section it names, so
  // a direct hit on /#pricing lands at the top. This also carries the /pricing redirect through.
  useEffect(() => {
    if (!hash) return
    document.querySelector(hash)?.scrollIntoView()
  }, [hash])

  return (
    <>
      {/* The hero and the ticker are one viewport, pinned; everything after them scrolls over the
          pair like a drawer closing. The two halves have to be siblings for that, and the second
          one has to carry its own ground. */}
      <div className="hero-shell">
        <Hero record={record} />
        <TrustBand />
      </div>

      <div className="landing-body">
        <HowItWorksSection />
        <VerdictBand record={record} />
        <SampleSection record={record} />
        <PricingSection />
        <TrustSection />
      </div>
    </>
  )
}
