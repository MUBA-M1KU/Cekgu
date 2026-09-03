# Privacy

> Draft demo notice. Not final. Re-review against the deployed product and obtain owner approval before publication.

Cekgu processes assessment content so educators can inspect potential problems. Do not enter confidential final papers
or personal data in questions or notes. A private account does not make that content suitable for external processing.

## What is stored

For private sign-in, we store account information such as your name and email, together with authentication data. Both
private and Guest sign-in use a session cookie; session records can include an IP address and browser information.

Review records store assessment metadata alongside the questions and supplied keys. They also keep model evidence and
your review decisions. They are associated with the account that created them. Free-text fields can contain personal
information if entered; the absence of a dedicated learner field does not prevent it from being stored.

The Reduce Motion preference is stored locally in your browser.

## Where processing happens

Our hosting and database infrastructure process account and record data. Questions are sent through GonkaRouter to a
decentralised inference network, outside machines operated by the Cekgu team. Private sign-in does not keep questions
within Cekgu's infrastructure.

Your browser requests fonts from Google Fonts when pages load, including before sign-in. When animated characters load,
it also downloads the Cubism runtime from Live2D's CDN.

[GonkaRouter's privacy policy](https://gonkarouter.io/privacy-policy) allows retention of API inputs and outputs for
debugging, service improvement and security monitoring, without stating a fixed retention period. Its providers may
process data under their own policies, including outside your country. Cekgu does not promise zero third-party
retention.

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

Private deletion hides the record from your library but retains a stored copy. It does not cancel queued or running
checks, so those questions may still be sent for processing. This demo has no restore interface or verified automatic
permanent-deletion deadline for private records.

Deleting a record does not delete your account or guarantee removal from infrastructure backups, service logs or
third-party systems.

See also [terms](terms.md) and [acceptable use](acceptable-use.md).
