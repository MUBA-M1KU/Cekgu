import { defineConfig, devices } from '@playwright/test'

// The smoke pass runs against a deployment, never a local build: TRD section 18 runs it
// after every production deploy and on demand against a preview URL. The default below is
// therefore deliberate rather than a placeholder.
//
// It is also a trap worth naming, because it has already sprung once: `bun run e2e` in a dirty
// working tree tests the DEPLOYMENT, passes green, and says nothing about the code you just
// changed. That produced one incorrect verification claim on #148. The run now prints what it is
// pointed at, and `bun run e2e:local` names the other case rather than leaving it to a remembered
// environment variable.
const baseURL = process.env.E2E_BASE_URL ?? 'https://cekgu-op7lf5dspq-as.a.run.app'

// Config modules evaluate once per process, and Playwright loads them in the runner AND in every
// worker — so an unguarded log prints once per worker plus one. TEST_WORKER_INDEX is set only in a
// worker, which makes its absence the runner, which is the one place this belongs.
if (!process.env.TEST_WORKER_INDEX)
  console.log(
    `\ne2e target: ${baseURL}${process.env.E2E_BASE_URL ? '' : '  (default: the deployment, not your tree)'}\n`
  )

export default defineConfig({
  testDir: './e2e',
  // .e2e.ts, not .spec.ts: bun test's default glob claims *.spec.ts and *.test.ts, and it
  // cannot run Playwright's test(). Keeping the extensions disjoint keeps both runners honest.
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
})
