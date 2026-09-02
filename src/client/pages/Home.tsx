import { Link } from 'react-router'
import { Sheet } from '../components/Sheet'

export function Home() {
  return (
    <>
      <Sheet>
        <p className="type-eyebrow text-ink-muted">Pre-publication review for multiple-choice papers</p>
        <h1 className="type-display mt-4 max-w-[18ch]">A learner should never lose marks to a wrong answer key.</h1>
        <p className="type-lead mt-5 max-w-[58ch]">
          Cekgu has two independent AI models sit every question blind, before your learners do. It shows you which keys
          and which wording deserve a second look, and leaves every decision to you.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            to="/sign-in"
            className="inline-flex h-9 items-center rounded-sheet bg-ink px-4 font-medium text-on-ink"
          >
            Try Cekgu
          </Link>
          <Link to="/sample" className="type-label underline">
            See a real report first
          </Link>
        </div>
      </Sheet>

      <section className="mt-12">
        <h2>What Goes Wrong</h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-3">
          <div>
            <p className="type-label">A wrong key</p>
            <p className="type-body mt-2 text-ink-muted">
              Everyone who answered correctly is marked wrong. You find out when the complaints arrive.
            </p>
          </div>
          <div>
            <p className="type-label">Two defensible answers</p>
            <p className="type-body mt-2 text-ink-muted">
              The question is fair to whoever guessed your intent, and unfair to everyone who read it carefully.
            </p>
          </div>
          <div>
            <p className="type-label">Wording that shifts the meaning</p>
            <p className="type-body mt-2 text-ink-muted">
              You knew what you meant. The paper says something slightly different.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2>Why Two Readers</h2>
        <p className="type-body mt-4 max-w-[64ch]">
          One AI gives you one opinion, and it will happily agree with the answer key you show it. Cekgu withholds your
          key and asks two different model families to answer independently. Where they agree with each other and
          disagree with you, that is worth your attention. Where fewer than two independent readings survive
          verification, Cekgu says so instead of inventing a result.
        </p>
        <p className="type-body mt-4 max-w-[64ch] text-ink-muted">
          Cekgu is a first pass, not a vetting committee, and agreement between models is not proof of truth. It does
          not certify a paper, change a key, or grade anyone.
        </p>
      </section>
    </>
  )
}
