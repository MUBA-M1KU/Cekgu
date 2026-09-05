import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { failed: boolean }

// React unmounts the whole tree when a render throws, so without a boundary any one bad render
// leaves a blank page with no way back. This catches it and offers the two exits that do not
// depend on the broken screen: reload, or leave for the landing page.
//
// A class is required here; hooks cannot catch a render error.
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  override componentDidCatch(error: unknown) {
    // Kept so a failure during a demo is recoverable from the console rather than invisible.
    console.error('render failed', error)
  }

  override render() {
    if (!this.state.failed) return this.props.children

    return (
      <main className="mx-auto w-full max-w-[76rem] px-4 py-16 sm:px-6">
        <h1>Something Went Wrong</h1>
        <p className="type-body mt-3 max-w-[62ch]">
          This screen stopped responding. Reloading usually clears it, and nothing you have already checked is lost.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Reload the Page
          </button>
          <a href="/" className="btn btn-outline">
            Go to the Landing Page
          </a>
        </div>
      </main>
    )
  }
}
