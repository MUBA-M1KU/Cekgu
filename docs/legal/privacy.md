# Privacy

<!-- Review baseline: 5 September 2026, main 8f8e890. -->

Cekgu processes assessment content so educators can inspect potential problems. Do not enter confidential final papers
or personal data in questions or notes. A private account does not make that content suitable for external processing.

## What is stored

For private sign-in, we store account information such as your name and email, together with authentication data. Both
private and Guest sign-in use a session cookie; session records can include an IP address and browser information.

Review records store assessment metadata alongside the questions and supplied keys. They also keep model evidence and
your review decisions. They are associated with the account that created them. Free-text fields can contain personal
information if entered; the absence of a dedicated learner field does not prevent it from being stored.

An optional image or PDF upload is sent to Google's Gemini API to transcribe the printed words. Cekgu then sends that
transcription to GonkaRouter to structure a draft. Uploading does not create a record or a check; you must review and
submit the draft separately.

If you use **Ask About This Record**, Cekgu sends your question, up to eight recent conversation entries and the record
evidence the assistant requests to Google's Gemini API. That evidence can include the assessment title, questions,
options, supplied keys, model readings, request IDs, receipts, attempts and review decisions. Cekgu does not store the
chat transcript in the record or app database; it stays in the open browser session unless it is sent to Gemini as part
of a question.

The Reduce Motion and theme preferences are stored locally in your browser.

## Where processing happens

Our hosting and database infrastructure process account and record data. Typed questions and upload transcriptions are
sent through GonkaRouter to a decentralised inference network, outside machines operated by the Cekgu team. An uploaded
photograph or PDF is also sent to Google's Gemini API before that structuring step. Private sign-in does not keep this
content within Cekgu's infrastructure. The Record Assistant also uses Gemini to phrase answers grounded in one record's
stored evidence; it is scoped to that record and cannot search another account's records.

Your browser requests fonts from Google Fonts when pages load, including before sign-in. When animated characters load,
it also downloads the Cubism runtime from Live2D's CDN.

[GonkaRouter's privacy policy](https://gonkarouter.io/privacy-policy) says it may retain API inputs and outputs for
debugging, service improvement and security monitoring, without stating a fixed retention period. Its providers may
process data under their own policies, including outside your country. Cekgu does not promise zero third-party
retention.

[Gemini API terms](https://ai.google.dev/gemini-api/terms) distinguish paid and unpaid services. Google says it can use
content and responses from unpaid services to improve products, and human reviewers may process them; paid services have
different handling. The Cekgu team must confirm which service applies before release. Until then, Cekgu makes no promise
that an upload, a chat question or the record evidence sent with it is excluded from provider retention or product
improvement.

## Who can see records

A private account's library is available to that account through the app. Guest records are public within the shared
demo workspace: anyone entering as Guest can view or delete another guest's records. Guest access does not provide a
private account. Request IDs also allow inspection of public gateway receipt metadata.

Saved review activity on the protected sample is publicly readable without signing in, including any notes and revised
wording submitted through the API. Guests can reset this shared review history.

## Expiry and deletion

Guest-created records are scheduled to expire 24 hours after creation. A periodic cleanup removes expired records when
the worker runs; records remain accessible to guests until that cleanup succeeds. Guest deletion removes a record and
its related review data from the app database without a recovery option. The protected sample is excluded from Guest
deletion and expiry.

Private deletion hides the record from your library and schedules permanent removal from the app database 30 days after
deletion. This demo has no restore interface. Private records not deleted are scheduled for removal after 90 days
without a stored update; simply opening a record does not currently renew that period. These removals depend on the
hourly cleanup worker running successfully, so the stated periods are cleanup thresholds, not exact deletion times.

In Settings, deleting all records immediately removes the account's non-sample records and related review data from the
app database, including records already hidden by private deletion. There is no recovery. For Guest, this removes other
guests' records too; the protected sample remains.

Hiding a private record does not cancel queued or running checks, so its questions may still be sent for processing.
Permanent deletion cannot recall questions already sent to external services.

Deleting a record does not delete your account or guarantee removal from infrastructure backups, service logs or
third-party systems.

See also [terms](terms.md) and [acceptable use](acceptable-use.md).

<!-- Release review: verified 5 September against src/client/pages/Settings.tsx and src/server/retention.ts. Opening a
record does not renew private-record retention. Re-review against the deployed product before publication. -->
