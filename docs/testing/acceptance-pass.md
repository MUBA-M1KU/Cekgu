# Acceptance pass

Production acceptance record for the UI released from `origin/main` at `42a16f5` on 5 September 2026. This is evidence,
not a release approval: the live Guest-to-GonkaRouter path has a recorded failure below.

The laptop/desktop production pass used Chromium at 1280 × 800. A 375 px structural sweep was automated only; mobile is
not Cekgu's target device and has not received a human usability sign-off. `bun run build`, `bun run typecheck`,
`bun run lint`, and `bun test` passed at the baseline (253 pass, 73 database-dependent skips). Production `bun run e2e`
passed 22 tests with the opt-in live-flow test skipped. An independent Luna pass also covered the public, Guest and
upload paths.

## Findings and evidence

`E2E_FLOW=1 bun run e2e -- e2e/flow.e2e.ts` failed against production on 5 September: after 480 seconds, the synthetic
FIFO check remained **Checking**, with Reader A admitted and Reader B absent. The verdict reason did not appear. The
test record `22606c78-21a7-4112-87d0-a0ba6390ea8e` was deleted after capture. This is the existing
[#189](https://github.com/MUBA-M1KU/Cekgu/issues/189), assigned to the queue owner; its local screenshot and
accessibility capture are held outside the repository pending the required Drive upload.

The upload path was also checked with synthetic content. Unsupported text was rejected, a PDF larger than 10 MB showed
its client-side error, and a synthetic PNG produced a draft without creating or navigating to a record. No real or
confidential material was used.

## Requirement pass

“Not built” here means no current-version acceptance evidence was produced for that requirement; it is not a claim that
the source is absent. It keeps this record from silently promoting older manual evidence to the redesigned release.

| Requirement   | Result    | Note                                                                                                                         | Screenshot link                            |
| ------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| FR-PUBLIC-1   | Pass      | Production home rendered its H1, public explanation and Sign In action.                                                      | —                                          |
| FR-PUBLIC-2   | Pass      | Trust disclosure states network processing, ownership, Guest sharing and forbidden content.                                  | —                                          |
| FR-PUBLIC-3   | Pass      | Production pricing content and pilot-plan copy are covered by the copy test.                                                 | —                                          |
| FR-AUTH-1     | Not built | Private-account flow was not re-walked on this release; no test credential was supplied.                                     | —                                          |
| FR-AUTH-2     | Pass      | Keyboard Guest sign-in reached the workspace.                                                                                | —                                          |
| FR-AUTH-3     | Pass      | Required Guest warning was visible at sign-in and in the workspace.                                                          | —                                          |
| FR-AUTH-4     | Pass      | 24-hour expiry logic passed unit coverage; a real 24-hour production wait was not practical.                                 | —                                          |
| FR-AUTH-5     | Pass      | Guest size guard passed unit coverage and the form path was exercised.                                                       | —                                          |
| FR-CHECK-1    | Pass      | Guest New Check exposes structured title, subject, language and item input.                                                  | —                                          |
| FR-CHECK-2    | Pass      | Schema validation tests pass; upload preserves the form on a rejected file.                                                  | —                                          |
| FR-CHECK-3    | Fail      | Record creation and navigation occur, but the live check did not reach a terminal result within the acceptance window; #189. | Local failure capture pending Drive upload |
| FR-CHECK-4    | Pass      | Keyboard demo-content prefill succeeded in the Guest workspace.                                                              | —                                          |
| FR-CHECK-5    | Pass      | PNG/PDF upload card, rejected type and size limit, safe draft prefill and no auto-submit verified.                           | —                                          |
| FR-QUEUE-1    | Fail      | The production live path left one reader missing beyond 480 seconds; #189.                                                   | Local failure capture pending Drive upload |
| FR-QUEUE-2    | Fail      | Two live distinct readings were not reached in the failed Guest run; #189.                                                   | Local failure capture pending Drive upload |
| FR-QUEUE-3    | Fail      | The production run exceeded the acceptance window without a terminal fail-closed result; #189.                               | Local failure capture pending Drive upload |
| FR-QUEUE-4    | Pass      | The record showed a running item, Reader A and missing Reader B honestly during the failure.                                 | —                                          |
| FR-QUEUE-5    | Not built | No current production Unverified item was available to exercise Retry Verification.                                          | —                                          |
| FR-VERDICT-1  | Pass      | Admission and receipt-validation unit coverage passes.                                                                       | —                                          |
| FR-VERDICT-2  | Pass      | Unit coverage verifies fewer than two readings return Unverified; live failure is separately tracked.                        | —                                          |
| FR-VERDICT-3  | Pass      | Sample verdicts, filters and the five-rule ordering rendered correctly.                                                      | —                                          |
| FR-VERDICT-4  | Pass      | Sample FIFO explanation names Queue and supplied key Stack.                                                                  | —                                          |
| FR-VERDICT-5  | Pass      | Rendered sample verdicts use labels, not confidence percentages.                                                             | —                                          |
| FR-RECORD-1   | Not built | Private-account record persistence was not re-walked on this release.                                                        | —                                          |
| FR-RECORD-2   | Pass      | Guest record showed Checking and per-item Running state; state transition unit coverage passes.                              | —                                          |
| FR-RECORD-3   | Pass      | Sample summary, attention filter and item ordering were exercised.                                                           | —                                          |
| FR-RECORD-4   | Pass      | Production demo walk recorded a sample disposition while retaining its verdict.                                              | —                                          |
| FR-RECORD-5   | Not built | Private library search, sort and filters were not re-walked on this release.                                                 | —                                          |
| FR-RECORD-6   | Not built | Private bulk selection and deletion were not re-walked on this release.                                                      | —                                          |
| FR-RECORD-7   | Not built | Private and Guest deletion comparison requires a current private-account walk.                                               | —                                          |
| FR-RECORD-8   | Not built | Settings renders retention copy; destructive private-account deletion was not re-walked.                                     | —                                          |
| FR-EVIDENCE-1 | Pass      | Sample evidence exposed two served model names, request IDs and receipt status.                                              | —                                          |
| FR-EVIDENCE-2 | Pass      | Sample shows retained attempt history; timeout and rate-limit rendering have unit coverage.                                  | —                                          |
| FR-EVIDENCE-3 | Pass      | Request IDs link to the receipt viewer and the public gateway receipt URL.                                                   | —                                          |
| FR-EVIDENCE-4 | Pass      | Sample evidence showed distinct served models.                                                                               | —                                          |
| FR-SAMPLE-1   | Pass      | Signed-out Sample Report loaded the 12-item benchmark with its counts.                                                       | —                                          |
| FR-SAMPLE-2   | Not built | Protected-sample deletion was not re-walked in this production pass.                                                         | —                                          |
| FR-SAMPLE-3   | Pass      | Production demo walk recorded and reset sample review state without changing the verdict.                                    | —                                          |
| FR-SAMPLE-4   | Pass      | Signed-out Sample Report, filters and evidence were exercised.                                                               | —                                          |
| FR-MASCOT-1   | Pass      | Desktop production navigation test confirmed a mounted mascot does not blank the app.                                        | —                                          |
| FR-MASCOT-2   | Pass      | Record evidence remained interactive while the mascot path was mounted.                                                      | —                                          |
| FR-MASCOT-3   | Pass      | Motion preference and static fallback have unit coverage.                                                                    | —                                          |
| FR-MASCOT-4   | Pass      | Keyboard Guest flow completed; no task depends on mascot interaction.                                                        | —                                          |
| FR-MASCOT-5   | Pass      | README retains Live2D and Cubism attribution; final licence eligibility remains an owner release check.                      | —                                          |
| NFR-UX-1      | Pass      | Automated 375 px route sweep found no body overflow; no mobile human usability claim is made.                                | —                                          |
| NFR-UX-2      | Pass      | Keyboard-only Guest sign-in and demo prefill worked; app routes expose named controls.                                       | —                                          |
| NFR-UX-3      | Pass      | Sample statuses and verdicts carried text labels throughout.                                                                 | —                                          |
| NFR-UX-4      | Pass      | Copy tests enforce the project capitalization and sentence-case rules.                                                       | —                                          |
| NFR-UX-5      | Pass      | Motion preference unit coverage passes; system-reduced-motion automation was previously verified separately.                 | —                                          |

## Follow-up

Do not close [#48](https://github.com/MUBA-M1KU/Cekgu/issues/48) yet. The live-flow failure remains open as #189, its
failure evidence still needs the team Drive link, and the private-account requirements marked **Not built** require a
current desktop human walk before this becomes a complete manual acceptance pass.
