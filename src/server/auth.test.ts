import { expect, test } from 'bun:test'

// The environment comes from test-env.ts, preloaded by bunfig.toml.
const { sameServiceOrigin } = await import('./auth')

const BASE = 'https://cekgu-op7lf5dspq-as.a.run.app'

// A preview deploy is the same Cloud Run service under a tagged hostname. Better Auth trusts only
// baseURL unless told otherwise, so every route it owns answered 403 INVALID_ORIGIN on a preview
// and a person who signed in there could not sign out again.
test('a tagged revision of the same service is trusted', () => {
  expect(sameServiceOrigin('https://pr-188---cekgu-op7lf5dspq-as.a.run.app', BASE)).toBe(true)
  expect(sameServiceOrigin('https://pr-9---cekgu-op7lf5dspq-as.a.run.app', BASE)).toBe(true)
})

// It answers one question only: is this a TAGGED revision of the configured service. The
// configured origin itself is always in the trusted list without consulting this, which is why it
// is not a tagged revision of anything and answers false.
test('the configured origin is not itself a tagged revision', () => {
  expect(sameServiceOrigin(BASE, BASE)).toBe(false)
})

// Narrow on purpose. A wildcard here is a CSRF hole, so anything that is not exactly one tag in
// front of the configured host is refused.
test('anything that is not this service is refused', () => {
  const refused = [
    'https://cekgu-op7lf5dspq-as.a.run.app.evil.com',
    'https://pr-188---cekgu-op7lf5dspq-as.a.run.app.evil.com',
    'https://evil---attacker.a.run.app',
    // Two tag separators, so the host is not one tag in front of ours.
    'https://a---pr-188---cekgu-op7lf5dspq-as.a.run.app',
    // An empty tag.
    'https://---cekgu-op7lf5dspq-as.a.run.app',
    // Right host, wrong scheme.
    'http://pr-188---cekgu-op7lf5dspq-as.a.run.app',
    'not a url',
    ''
  ]
  for (const origin of refused) expect([origin, sameServiceOrigin(origin, BASE)]).toEqual([origin, false])
})
