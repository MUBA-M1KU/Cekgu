# Desktop acceptance pass

Production acceptance record for `origin/main` at `74057b6` on 5 September 2026. This is a desktop/laptop record, not a
release approval or a claim that the live gateway never rate-limits.

The production pass used Chromium at 1280 × 800 and 1440 × 900. Cekgu targets desktop/laptop; a 375 px structural sweep
exists but mobile has no human usability sign-off and is outside this pass. `bun run build`, `bun run typecheck`,
`bun run lint`, and `bun test` passed: 254 passed, 73 database-dependent skips, and 0 failures. Production `bun run e2e`
passed 22 tests with the opt-in live-flow test skipped.

An independent Luna pass covered public pages, Guest routes, desktop layout, named controls, Sample filters and
evidence, demo prefill, and synthetic upload validation at both desktop sizes. It found no console or page errors in
those flows. Direct `/how-it-works` and `/pricing` routes intentionally return the home page; their content is home-page
sections, not separate required routes.

## Findings and evidence

The one unresolved product risk is the external GonkaRouter path. An earlier `E2E_FLOW=1 bun run e2e -- e2e/flow.e2e.ts`
run remained **Checking** after 480 seconds with Reader A admitted and Reader B absent. It is tracked in
[#189](https://github.com/MUBA-M1KU/Cekgu/issues/189). This pass did not rerun that test because a production deploy had
started less than five minutes before the test window; a deploy-period result would not distinguish rate limiting from
instance replacement. No retry was made.

The upload path was also checked with synthetic content. Unsupported text was rejected, a PDF larger than 10 MB showed
its client-side error, and a synthetic PNG produced a draft without creating or navigating to a record. No real or
confidential material was used.

## Requirement pass

“Not built” here means no current-version acceptance evidence was produced for that requirement; it is not a claim that
the source is absent. It keeps this record from silently promoting older manual evidence to the redesigned release.

| Requirement   | Result    | Note                                                                                                                 | Screenshot link |
| ------------- | --------- | -------------------------------------------------------------------------------------------------------------------- | --------------- |
| FR-PUBLIC-1   | Pass      | Production home rendered its H1, public explanation and Sign In action.                                              | —               |
| FR-PUBLIC-2   | Pass      | Trust disclosure states network processing, ownership, Guest sharing and forbidden content.                          | —               |
| FR-PUBLIC-3   | Pass      | Production pricing content and pilot-plan copy are covered by the copy test.                                         | —               |
| FR-AUTH-1     | Pass      | Desktop private-account creation, persistence, sign-out and sign-in were manually exercised with synthetic content.  | —               |
| FR-AUTH-2     | Pass      | Keyboard Guest sign-in reached the workspace.                                                                        | —               |
| FR-AUTH-3     | Pass      | Required Guest warning was visible at sign-in and in the workspace.                                                  | —               |
| FR-AUTH-4     | Pass      | 24-hour expiry logic passed unit coverage; a real 24-hour production wait was not practical.                         | —               |
| FR-AUTH-5     | Pass      | Guest size guard passed unit coverage and the form path was exercised.                                               | —               |
| FR-CHECK-1    | Pass      | Guest New Check exposes structured title, subject, language and item input.                                          | —               |
| FR-CHECK-2    | Pass      | Schema validation tests pass; upload preserves the form on a rejected file.                                          | —               |
| FR-CHECK-3    | Pass      | Desktop manual pass created and revisited a record; the separate live gateway limitation remains #189.               | —               |
| FR-CHECK-4    | Pass      | Keyboard demo-content prefill succeeded in the Guest workspace.                                                      | —               |
| FR-CHECK-5    | Pass      | PNG/PDF upload card, rejected type and size limit, safe draft prefill and no auto-submit verified.                   | —               |
| FR-QUEUE-1    | Not built | Unit coverage passes; a fresh live run was deferred to avoid testing through a production deploy. See #189.          | —               |
| FR-QUEUE-2    | Not built | Sample evidence shows two served families; a fresh live run was deferred. See #189.                                  | —               |
| FR-QUEUE-3    | Not built | Unit coverage passes; #189 remains the known live recovery limitation.                                               | —               |
| FR-QUEUE-4    | Pass      | The record showed a running item, Reader A and missing Reader B honestly during the failure.                         | —               |
| FR-QUEUE-5    | Not built | No current production Unverified item was available to exercise Retry Verification.                                  | —               |
| FR-VERDICT-1  | Pass      | Admission and receipt-validation unit coverage passes.                                                               | —               |
| FR-VERDICT-2  | Pass      | Unit coverage verifies fewer than two readings return Unverified; live failure is separately tracked.                | —               |
| FR-VERDICT-3  | Pass      | Sample verdicts, filters and the five-rule ordering rendered correctly.                                              | —               |
| FR-VERDICT-4  | Pass      | Sample FIFO explanation names Queue and supplied key Stack.                                                          | —               |
| FR-VERDICT-5  | Pass      | Rendered sample verdicts use labels, not confidence percentages.                                                     | —               |
| FR-RECORD-1   | Pass      | Desktop private-account persistence and result review were manually exercised with synthetic content.                | —               |
| FR-RECORD-2   | Pass      | Guest record showed Checking and per-item Running state; state transition unit coverage passes.                      | —               |
| FR-RECORD-3   | Pass      | Sample summary, attention filter and item ordering were exercised.                                                   | —               |
| FR-RECORD-4   | Pass      | Production demo walk recorded a sample disposition while retaining its verdict.                                      | —               |
| FR-RECORD-5   | Pass      | Desktop private library search, filters and record opening were manually exercised.                                  | —               |
| FR-RECORD-6   | Pass      | Desktop private selection and deletion were manually exercised with synthetic content.                               | —               |
| FR-RECORD-7   | Pass      | Guest and private deletion paths were manually exercised; no data leakage was observed.                              | —               |
| FR-RECORD-8   | Pass      | Settings and destructive account-record deletion were manually exercised with synthetic content.                     | —               |
| FR-EVIDENCE-1 | Pass      | Sample evidence exposed two served model names, request IDs and receipt status.                                      | —               |
| FR-EVIDENCE-2 | Pass      | Sample shows retained attempt history; timeout and rate-limit rendering have unit coverage.                          | —               |
| FR-EVIDENCE-3 | Pass      | Request IDs link to the receipt viewer and the public gateway receipt URL.                                           | —               |
| FR-EVIDENCE-4 | Pass      | Sample evidence showed distinct served models.                                                                       | —               |
| FR-SAMPLE-1   | Pass      | Signed-out Sample Report loaded the 12-item benchmark with its counts.                                               | —               |
| FR-SAMPLE-2   | Pass      | Guest API deletion returned 200 with the sample in `skipped`; a second read confirmed the protected record remained. | —               |
| FR-SAMPLE-3   | Pass      | Production demo walk recorded and reset sample review state without changing the verdict.                            | —               |
| FR-SAMPLE-4   | Pass      | Signed-out Sample Report, filters and evidence were exercised.                                                       | —               |
| FR-MASCOT-1   | Pass      | Desktop production navigation test confirmed a mounted mascot does not blank the app.                                | —               |
| FR-MASCOT-2   | Pass      | Record evidence remained interactive while the mascot path was mounted.                                              | —               |
| FR-MASCOT-3   | Pass      | Motion preference and static fallback have unit coverage.                                                            | —               |
| FR-MASCOT-4   | Pass      | Keyboard Guest flow completed; no task depends on mascot interaction.                                                | —               |
| FR-MASCOT-5   | Pass      | README retains Live2D and Cubism attribution; final licence eligibility remains an owner release check.              | —               |
| NFR-UX-1      | Not built | Mobile is outside Cekgu's target-device scope. No mobile usability claim is made.                                    | —               |
| NFR-UX-2      | Pass      | Keyboard-only Guest sign-in and demo prefill worked; app routes expose named controls.                               | —               |
| NFR-UX-3      | Pass      | Sample statuses and verdicts carried text labels throughout.                                                         | —               |
| NFR-UX-4      | Pass      | Copy tests enforce the project capitalization and sentence-case rules.                                               | —               |
| NFR-UX-5      | Pass      | Motion preference unit coverage passes; system-reduced-motion automation was previously verified separately.         | —               |

## Follow-up

Desktop acceptance is complete for normal use. Keep [#48](https://github.com/MUBA-M1KU/Cekgu/issues/48) open while #189
remains open, because a live check can be delayed by GonkaRouter rate limiting or a stranded claim. The current
deployment has no controlled **Unverified** record, so **Retry Verification** remains unwalked. Mobile rows are
intentionally excluded from this project scope.

## Phone walk at 375 px, 6 September

Production acceptance on `https://cekgu-op7lf5dspq-as.a.run.app` at 14:47 UTC on 5 September 2026. The production
deployment serves a build from before that time; the page does not expose a commit hash. This walk covers steps 1, 2, 3
and 4 of the PRD demo acceptance test on a 375 px mobile device: the landing page, the public sample record opening with
evidence, Guest sign-in landing on the dashboard, and four workspace routes.

| Route        | Elapsed (ms) | Console errors | Overflow (px) | Result | Note                                                         |
| ------------ | ------------ | -------------- | ------------- | ------ | ------------------------------------------------------------ |
| `/`          | 1727         | 0              | 0             | Pass   | Primary CTA visible unscrolled. H1 present.                  |
| `/sample`    | 846          | 0              | 0             | Pass   | 12 items, 3 needing attention. Evidence opens, receipt link. |
| `/dashboard` | 1584         | 0              | 0             | Pass   | Guest banner present. Sidebar rail accessible. H1 present.   |
| `/records`   | 794          | 0              | 0             | Pass   | H1 present. New Check button present.                        |
| `/new-check` | 937          | 0              | 0             | Pass   | H1 present. Demo prefill button present.                     |
| `/settings`  | 818          | 0              | 0             | Pass   | H1 present. Sign Out button present.                         |

All buttons carry accessible names; no horizontal overflow on any route. Screenshots were captured to the scratchpad
directory. The live Guest-to-GonkaRouter submission was deliberately not exercised to avoid burning gateway tokens.
