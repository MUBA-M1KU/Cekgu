import { useEffect, useId, useRef, useState } from 'react'

export type SelectOption = { value: string; label: string }

type Props = {
  id?: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  label: string
}

// A native <select> renders the operating system's menu, which is the one part of a screen the
// product cannot style and which looks nothing like the rest of Cekgu. This is the button and
// listbox pattern instead: the browser's keyboard behaviour reimplemented rather than borrowed,
// which is the cost of not using the native control and is paid here rather than skipped.
export function Select({ id, value, options, onChange, label }: Props) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(() =>
    Math.max(
      0,
      options.findIndex((o) => o.value === value)
    )
  )
  const root = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLDivElement>(null)

  const selected = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  // The active option is scrolled into view as it moves, or arrowing past the fold moves a
  // highlight nobody can see.
  useEffect(() => {
    if (!open) return
    list.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  function choose(index: number) {
    const option = options[index]
    if (!option) return
    onChange(option.value)
    setOpen(false)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const last = options.length - 1
    if (!open && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown')) {
      setOpen(true)
      setActive(
        Math.max(
          0,
          options.findIndex((o) => o.value === value)
        )
      )
    } else if (open && event.key === 'ArrowDown') setActive((i) => (i >= last ? 0 : i + 1))
    else if (open && event.key === 'ArrowUp') setActive((i) => (i <= 0 ? last : i - 1))
    else if (open && event.key === 'Home') setActive(0)
    else if (open && event.key === 'End') setActive(last)
    else if (open && (event.key === 'Enter' || event.key === ' ')) choose(active)
    else if (event.key === 'Escape') setOpen(false)
    else if (event.key === 'Tab') return
    else return
    event.preventDefault()
  }

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        id={id}
        className="select-control"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={label}
        onClick={() => setOpen(!open)}
        onKeyDown={onKeyDown}
      >
        <span className="min-w-0 truncate">{selected?.label ?? ''}</span>
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true" focusable="false">
          <path d="m4 6.5 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <div
          ref={list}
          id={listId}
          className="select-list"
          role="listbox"
          aria-label={label}
          aria-activedescendant={`${listId}-${active}`}
          tabIndex={-1}
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              id={`${listId}-${index}`}
              role="option"
              // Focus stays on the button and aria-activedescendant does the pointing, which is
              // the pattern; tabIndex -1 makes each option programmatically focusable so the
              // interactive role is not a promise the element cannot keep.
              tabIndex={-1}
              aria-selected={option.value === value}
              data-active={index === active ? 'true' : undefined}
              className="select-option"
              onMouseEnter={() => setActive(index)}
              onMouseDown={(event) => {
                // mousedown, not click: the outside-click listener closes the popup on mousedown,
                // so a click handler here would never see its own event.
                event.preventDefault()
                choose(index)
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
