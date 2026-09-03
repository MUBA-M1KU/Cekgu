// FR-CHECK-4. The Guest workspace is the demo path, and typing a paper into a form on a projector
// wastes the minute the demo has. This is what the Fill With Demo Content control writes.
//
// The keys are chosen, not arbitrary. One is wrong on purpose, one question has two defensible
// answers depending on the convention, and one is plainly correct. What the readers make of them
// is up to the readers — nothing here predicts a verdict, and the control does not claim one.
export const DEMO_PAPER = {
  title: 'Week 6 networks and data structures quiz',
  subject: 'Computer Science',
  language: 'en',
  context: 'First-year undergraduate practice set, sat under exam conditions.',
  items: [
    {
      stem: 'Which HTTP status code means the request succeeded but the response carries no body?',
      options: [
        { letter: 'A', text: '200 OK' },
        { letter: 'B', text: '204 No Content' },
        { letter: 'C', text: '304 Not Modified' },
        { letter: 'D', text: '404 Not Found' }
      ],
      // Wrong on purpose: 204 is the answer. This is the mistake the product exists to catch.
      key: 'A'
    },
    {
      stem: 'How many bytes are there in one kilobyte?',
      options: [
        { letter: 'A', text: '512' },
        { letter: 'B', text: '1000' },
        { letter: 'C', text: '1024' },
        { letter: 'D', text: '8192' }
      ],
      // Defensible either way: 1000 under SI, 1024 under the older binary convention.
      key: 'C'
    },
    {
      stem: 'Which data structure removes elements in first in, first out order?',
      options: [
        { letter: 'A', text: 'Stack' },
        { letter: 'B', text: 'Queue' },
        { letter: 'C', text: 'Binary search tree' },
        { letter: 'D', text: 'Hash table' }
      ],
      key: 'B'
    }
  ]
} as const
