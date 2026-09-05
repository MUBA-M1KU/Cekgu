import { Link } from 'react-router'
import { Sheet } from '../components/Sheet'

// Without a catch-all route the router matches nothing and renders nothing, so a mistyped or stale
// URL was a blank page rather than a wrong one. The two exits are the landing page and the sample
// report, because the sample is the one destination a signed-out visitor can always reach.
export function NotFound() {
  return (
    <Sheet>
      <h1>Page Not Found</h1>
      <p className="type-body mt-3 max-w-[62ch]">
        We could not find that page. It may have moved, or the link that brought you here may be out of date.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/" className="btn btn-primary">
          Go to the Landing Page
        </Link>
        <Link to="/sample" className="btn btn-outline">
          See the Sample Report
        </Link>
      </div>
    </Sheet>
  )
}
