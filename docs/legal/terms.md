# Terms

> Draft demo notice. Not final. Re-review against the deployed product and obtain owner approval before publication.

<!-- Review baseline: 5 September 2026, main 42a16f5. -->

Cekgu is a demo for educators checking multiple-choice practice questions before publication. It highlights possible
problems for a human to review. It does not certify a paper as correct or replace subject expertise or institutional
review.

## Accounts and records

A private account has its own records library. Guest access uses one shared account: other guests can view and delete
what you add. Guest-created records are scheduled to expire after 24 hours and have no recovery promise. The protected
demo sample is excluded from Guest deletion and expiry.

Deleting a private record hides it from your library and schedules its stored copy for removal after 30 days. The demo
has no restore interface. Settings also lets you permanently delete all of your account's non-sample records, including
those already hidden. For Guest, that affects everyone's shared records. Read the [privacy notice](privacy.md) for
retention, cleanup timing and deletion limits before adding content.

## Checking and human decisions

Typed questions pass through GonkaRouter to a decentralised inference network. If you choose to upload a photograph or
PDF, Cekgu first sends that file to Google's Gemini API to transcribe what is printed; GonkaRouter then structures the
transcription into a draft. The upload never creates a record or a check by itself: review and correct the draft before
you submit it.

Do not submit confidential final papers or personal data, including learner information, even from a private account.
This includes uploads. Submit only content you are permitted to share with these processors, as described in
[acceptable use](acceptable-use.md).

Models can agree and still be wrong. You decide whether to change a question or answer key. A receipt is gateway
metadata, not cryptographic or on-chain proof. Checks can be delayed or remain Unverified when enough valid readings are
unavailable.

Cekgu detects disagreement between readers and ambiguity a reader declares, never ambiguity directly. Agreement does not
establish that a question is unambiguous.

## Sample character attribution

Tororo and Hijiki are Live2D sample characters, used under the [Live2D Free Material License Agreement][material] and
[sample-data terms][sample-terms]. They are not Cekgu's original characters. Illustration and modelling: Live2D Inc. The
animated characters use the Live2D Cubism SDK, which has [separate release licensing][sdk].

The following is the required application-length attribution, not a claim that Live2D endorses Cekgu:

> This content uses sample data owned and copyrighted by Live2D Inc. The sample data are utilized in accordance with
> terms and conditions set by Live2D Inc. This content itself is created at the author’s sole discretion.

<!-- Release review: the current home page uses static images of these characters even with MASCOT_ENABLED=false.
Keep attribution while those images or the animated characters are included. Owner must confirm the team's eligibility
under the applicable asset and SDK terms, and placement of this full notice in the application and submission materials,
before public release. -->

[material]: https://www.live2d.com/eula/live2d-free-material-license-agreement_en.html
[sample-terms]: https://www.live2d.com/en/learn/sample/model-terms/
[sdk]: https://www.live2d.com/en/sdk/license/
