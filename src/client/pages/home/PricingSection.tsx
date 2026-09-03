import { Link } from 'react-router'

// Every price is labelled a pilot plan and nothing here collects payment details (FR-PUBLIC-3).
const PLANS = [
  {
    name: 'Guest',
    price: 'RM0',
    period: '',
    who: 'Evaluating Cekgu, or curious',
    limits: [
      'One shared public workspace',
      'Anything you add is visible to other guests',
      'Records expire after 24 hours',
      'Up to 12 questions per check'
    ]
  },
  {
    name: 'Free',
    price: 'RM0',
    period: '',
    who: 'An educator testing a real workflow',
    limits: ['A private records library', '20 questions per month', '30 days of history']
  },
  {
    name: 'Cekgu Plus',
    price: 'RM29',
    period: 'Per month, or RM290 per year.',
    who: 'A tutor or course creator with recurring assessments',
    limits: ['300 questions per month', 'Full history', 'Exports and notifications', 'Priority retries']
  },
  {
    name: 'Cekgu Studio',
    price: 'RM79',
    period: 'Per month.',
    who: 'A small training operator',
    limits: ['1,500 questions per month', 'Three collaborators', 'Shared question bank, after launch']
  }
]

export function PricingSection() {
  return (
    <section id="pricing" className="wrap py-[clamp(4rem,8vw,7rem)]">
      <div className="max-w-[46rem]">
        <h2 className="text-[clamp(2rem,3.4vw,2.75rem)]/[1.1] tracking-[-0.025em]">
          Pilot plans, and no checkout on this site.
        </h2>
        <p className="type-lead mt-5 text-ink-muted">
          The prices and allowances below are a hypothesis we are testing, not a published price list. Nothing here
          collects a payment detail.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => (
          <section key={plan.name} className="card-soft flex flex-col rounded-[1.5rem] p-7">
            <h3 className="text-[1.25rem]">{plan.name}</h3>
            <p className="type-mono mt-3 text-[2rem] tracking-[-0.03em]">{plan.price}</p>
            <p className="type-caption text-ink-muted">{plan.period || 'Pilot plan'}</p>
            {plan.period ? <p className="type-caption text-ink-muted">Pilot plan</p> : null}
            <p className="type-body mt-4">{plan.who}</p>
            <ul className="mt-4 m-0 list-none p-0">
              {plan.limits.map((limit) => (
                <li key={limit} className="type-body border-t border-rule py-2 text-ink-muted">
                  {limit}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-7">
              {/* Not "Sign In as Guest": that phrase belongs to the sign-in screen's own control,
                  and two links carrying it on one page is one ambiguous target for anyone
                  navigating by accessible name, the smoke suite included. */}
              <Link to="/sign-in" className="type-label underline">
                {plan.name === 'Guest' ? 'Open the Guest Workspace' : 'Start With Free'}
              </Link>
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
