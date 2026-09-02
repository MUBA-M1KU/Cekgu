import { Sheet } from '../components/Sheet'

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
    period: 'per month, or RM290 per year',
    who: 'A tutor or course creator with recurring assessments',
    limits: ['300 questions per month', 'Full history', 'Exports and notifications', 'Priority retries']
  },
  {
    name: 'Cekgu Studio',
    price: 'RM79',
    period: 'per month',
    who: 'A small training operator',
    limits: ['1,500 questions per month', 'Three collaborators', 'Shared question bank, after launch']
  }
]

export function Pricing() {
  return (
    <>
      <Sheet>
        <h1>Pricing</h1>
        <p className="type-body mt-3 max-w-[62ch]">
          These are pilot plans. The prices and allowances below are a hypothesis we are testing, not a published price
          list, and there is no checkout on this site yet.
        </p>
      </Sheet>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <section key={plan.name} className="border-t border-rule pt-5">
            <h2 className="text-[1.25rem]/[1.25]">{plan.name}</h2>
            <p className="type-mono mt-2 text-[1.5rem]">{plan.price}</p>
            {plan.period ? <p className="type-caption text-ink-muted">{plan.period}</p> : null}
            <p className="type-caption mt-1 text-ink-muted">Pilot plan</p>
            <p className="type-body mt-3">{plan.who}</p>
            <ul className="mt-3 m-0 list-none p-0">
              {plan.limits.map((limit) => (
                <li key={limit} className="type-body border-t border-rule py-2 text-ink-muted">
                  {limit}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}
