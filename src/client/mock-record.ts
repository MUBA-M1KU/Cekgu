import type { ChatMessage, Citation, Seat } from '../shared/chat'
import { seatedAttempts } from '../shared/chat'
import type { DispositionInput } from '../shared/schemas'
import { corroboration, recordScore, truthScore } from '../shared/truth-score'
import type {
  AccountStats,
  Attempt,
  Grounding,
  Item,
  Reading,
  RecordDetail,
  RecordSummary,
  Source,
  VerdictCounts
} from '../shared/types'
import { verdict } from '../shared/verdict'

// A stand-in for GET /api/records/:id behind VITE_MOCK_API, shaped exactly like TRD section 15.
// The FIFO item is the demo's reveal: the supplied key says Stack and both readers chose Queue.
//
// EVERY REQUEST ID BELOW IS REAL. They are lifted verbatim from src/server/fixtures/benchmark-pass.json,
// the 3 September pass this product ran against the live gateway, together with the devshard and the
// latency the same call reported. Each one resolves to HTTP 200 at
// https://api.gonkarouter.io/v1/receipts/<id> today.
//
// They used to be generated from a counter, and the comment here admitted they were "illustrative,
// not live receipts". That made every receipt link in a mock build land on
// {"error":{"code":"not_found"}} — on the one screen whose entire claim is that a person can check
// the id themselves. A demo that cannot survive its own proof link is worse than no demo.
//
// This is also why DeepSeek is gone from the readers below: the real pass ran on MiniMax and Kimi,
// and a family with no receipt in the capture cannot be given one here.
const MINIMAX = 'MiniMaxAI/MiniMax-M2.7'
const KIMI = 'moonshotai/Kimi-K2.6'

type Captured = { requestId: string; devshardId: string | null; latencyMs: number | null }

const CAPTURED: Record<string, Captured[]> = {
  'MiniMaxAI/MiniMax-M2.7': [
    { requestId: 'req-1788426383844621629-410375', devshardId: '70340', latencyMs: 27745 },
    { requestId: 'req-1788426535424312672-411133', devshardId: '70343', latencyMs: 9167 },
    { requestId: 'req-1788426490327021456-410883', devshardId: '70343', latencyMs: 78644 },
    { requestId: 'req-1788426625321985624-411634', devshardId: '70240', latencyMs: 11743 },
    { requestId: 'req-1788426760342254913-412381', devshardId: '70228', latencyMs: 64168 },
    { requestId: 'req-1788426805588420213-412661', devshardId: '70343', latencyMs: 31316 },
    { requestId: 'req-1788426885228676885-413222', devshardId: '70240', latencyMs: 24769 },
    { requestId: 'req-1788426927288511388-413432', devshardId: '70345', latencyMs: 25306 },
    { requestId: 'req-1788427025477331726-413874', devshardId: '70345', latencyMs: 29514 },
    { requestId: 'req-1788427111307744381-414267', devshardId: '70228', latencyMs: 11016 },
    { requestId: 'req-1788427238422211326-414866', devshardId: '70340', latencyMs: 31072 },
    { requestId: 'req-1788427271471396159-415048', devshardId: '70340', latencyMs: 13885 },
    { requestId: 'req-1788427322427714435-415314', devshardId: '70326', latencyMs: 42549 },
    { requestId: 'req-1788427450313588933-416068', devshardId: '70240', latencyMs: 17439 }
  ],
  'moonshotai/Kimi-K2.6': [
    { requestId: 'req-1788426429986649454-410589', devshardId: '70158', latencyMs: 52037 },
    { requestId: 'req-1788426475140384999-410759', devshardId: '70335', latencyMs: 14879 },
    { requestId: 'req-1788426580312259782-411380', devshardId: '70114', latencyMs: 15984 },
    { requestId: 'req-1788426625325882756-411637', devshardId: '70335', latencyMs: 58626 },
    { requestId: 'req-1788426760673079683-412385', devshardId: '70114', latencyMs: 59673 },
    { requestId: 'req-1788426805486909927-412658', devshardId: '70114', latencyMs: 79482 },
    { requestId: 'req-1788426885349357569-413226', devshardId: '70158', latencyMs: 41665 },
    { requestId: 'req-1788426927294305234-413435', devshardId: '70158', latencyMs: 80372 },
    { requestId: 'req-1788426972283902005-413662', devshardId: '70158', latencyMs: 52768 },
    { requestId: 'req-1788427070487135404-414091', devshardId: '70335', latencyMs: 19749 },
    { requestId: 'req-1788427025480484637-413877', devshardId: '70158', latencyMs: 85355 },
    { requestId: 'req-1788427111437881990-414271', devshardId: '70158', latencyMs: 52712 },
    { requestId: 'req-1788427156265894689-414422', devshardId: '70114', latencyMs: 81703 },
    { requestId: 'req-1788427238422211356-414867', devshardId: '70335', latencyMs: 31895 },
    { requestId: 'req-1788427271470561205-415045', devshardId: '70335', latencyMs: 43274 },
    { requestId: 'req-1788427322427236581-415312', devshardId: '70335', latencyMs: 65664 },
    { requestId: 'req-1788427452690511195-416092', devshardId: '70114', latencyMs: 53022 },
    { requestId: 'req-1788427497691118244-416228', devshardId: '70335', latencyMs: 54352 }
  ]
}

let attemptSeed = 0
const drawn: Record<string, number> = {}

// The next unused capture for this family, so no two attempts on screen claim the same receipt.
// Past the end it wraps: the fixture holds 32 and the mock uses fewer, but a mock that grows must
// still hand out an id that resolves rather than one that was invented to fill the gap.
function capture(model: string): Captured | null {
  const pool = CAPTURED[model]
  if (!pool || pool.length === 0) return null
  const index = (drawn[model] ?? 0) % pool.length
  drawn[model] = index + 1
  return pool[index] ?? null
}

function attempt(partial: Partial<Attempt> & { requestedModel: string }): Attempt {
  attemptSeed += 1
  const started = new Date(Date.UTC(2026, 8, 3, 1, 0, attemptSeed * 7)).toISOString()
  const real = capture(partial.servedModel ?? partial.requestedModel)

  return {
    id: `attempt-${attemptSeed}`,
    servedModel: partial.requestedModel,
    requestId: real?.requestId ?? null,
    devshardId: real?.devshardId ?? null,
    fallbackHeader: null,
    httpStatus: 200,
    receiptStatus: real ? 'verified' : 'missing',
    reading: null,
    latencyMs: real?.latencyMs ?? null,
    startedAt: started,
    finishedAt: started,
    admitted: true,
    rejectionReason: null,
    ...partial
  }
}

function options(...texts: string[]) {
  return texts.map((text, index) => ({ letter: 'ABCDEF'[index] ?? 'A', text }))
}

type Spec = {
  stem: string
  choices: string[]
  key: string
  readers: [string, string] | [string]
  answers: [string, string] | [string]
  defensible?: [string[], string[]]
  reasons: [string, string] | [string]
  timedOut?: string
}

// Captured by running the real retrieval path against every question on this paper on 6 September
// 2026: src/server/retrieval/tavily.ts, the same evidenceQuery the worker builds, one search each.
// Every snippet is the string Tavily returned, verbatim and truncated the way the client truncates.
// Results whose snippet was nothing but site navigation were dropped; nothing was rewritten.
//
// The grounding beside each pair is authored, like every reading on this fixture — on the live
// product a Gonka reader reports it. It is set by reading what actually came back against what that
// reader answered, so the two items the web did not settle say `absent` rather than claiming a
// result nobody retrieved.
const RETRIEVED: Record<string, { sources: Source[]; grounding: [Grounding, Grounding] }> = {
  'Which data structure processes elements in first in, first out order?': {
    sources: [
      {
        title: 'Which data structure uses the FIFO - ( - First In, ﻿First Out',
        url: 'https://www.chegg.com/homework-help/questions-and-answers/data-structure-uses-fifo-first-first-principle-stack-b-queue-c-linked-list-d-tree-q182978170',
        snippet:
          'Which data structure uses the FIFO (First In, First Out) principle?A) StackB) QueueC) Linked ListD) Tree'
      },
      {
        title: 'Stacks and Queues',
        url: 'https://www.andrew.cmu.edu/course/15-121/lectures/Stacks%20and%20Queues/Stacks%20and%20Queues.html',
        snippet:
          '| A stack is a container of objects that are inserted and removed according to the last-in first-out (LIFO) principle. In the pushdown stacks only two operations are allowed: push the item into the stack, and pop the item out of the stack. A stack is a…'
      }
    ],
    grounding: ['supported', 'supported']
  },
  'What is the worst-case time complexity of binary search on a sorted array of n elements?': {
    sources: [
      {
        title: 'Time and Space Complexity Analysis of Binary Search Algorithm - GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/dsa/complexity-analysis-of-binary-search',
        snippet:
          '### Worst Case Time Complexity of Binary Search Algorithm: O(log N) > The worst case will be when the element is present in the first position. As seen in the average case, the comparison required to reach the first element is logN. So the time complexity for…'
      },
      {
        title: 'Binary search - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Binary_search',
        snippet:
          'Binary search runs in logarithmic time in the worst case, making {\\displaystyle O(\\log n)} comparisons, where {\\displaystyle n} is the number of elements in the array. Binary search is faster than linear search except for small arrays. However, the array must…'
      }
    ],
    grounding: ['supported', 'supported']
  },
  'Which of the following best describes a pure function?': {
    sources: [
      {
        title: 'Pure function - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Pure_function',
        snippet:
          '1. the function return values are identical for identical arguments (no variation with local static variables, non-local variables, mutable reference arguments or input streams, i.e., referential transparency), and 2. the function has no side effects "Side…'
      },
      {
        title: 'Pure Functions | Glossary | GDQuest',
        url: 'https://school.gdquest.com/glossary/function_pure',
        snippet:
          'logo See all glossary terms # Pure Functions We call "pure function" any function that: 1. Always returns the same output when given the same arguments. 2. Doesn\'t have any side effects. In other words, they are functions that don\'t automatically change the…'
      }
    ],
    grounding: ['supported', 'supported']
  },
  'In an object-oriented language, what does it mean for a method to be virtual?': {
    sources: [
      {
        title: 'Virtual function - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Virtual_function',
        snippet:
          'In object-oriented programming such as is often used in C++ and Object Pascal, a virtual function or virtual method is an inheritable and overridable "Method overriding (programming)") function "Function (computer science)") or method "Method (computer…'
      },
      {
        title: 'Object-Oriented Programming',
        url: 'https://www.state-machine.com/oop',
        snippet:
          'This means that a virtual function call cannot be resolved at link-time, as it is done for ordinary function calls in C, because the actual version of the function to call depends on the type of the object (Rectangle, Circle, etc.) So, instead the binding…'
      }
    ],
    grounding: ['supported', 'contradicted']
  },
  'Which statement about a hash table is correct?': {
    sources: [
      {
        title: 'Hash table - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Hash_table',
        snippet:
          'In a well-dimensioned hash table, the average time complexity for each lookup is independent of the number of elements stored in the table. Many hash table designs also allow arbitrary insertions and deletions of key–value pairs, at amortized constant average…'
      },
      {
        title: "Hash Table Time Complexity: Why Lookup Is O(1) (and When It Secretly Isn't) ·…",
        url: 'https://spacecomplexity.ai/blog/hash-table-time-complexity',
        snippet:
          'A hash table is an array accessed by a computed index: O(1) to hash, O(1) to access. Collisions are unavoidable. Chaining and open addressing handle them. Neither is magic. Average lookup is O(1) because the expected chain length equals the load factor α =…'
      }
    ],
    grounding: ['supported', 'supported']
  },
  'What does the acronym API stand for?': {
    sources: [
      {
        title: 'What is an API? - Application Programming Interfaces ...',
        url: 'https://aws.amazon.com/what-is/api',
        snippet:
          'API stands for Application Programming Interface. In the context of APIs, the word Application refers to any software with a distinct function. Interface can be thought of as a contract of service between two applications. This contract defines how the two…'
      },
      {
        title: 'What is an API? (Application Programming Interface)',
        url: 'https://www.mulesoft.com/api/what-is-an-api',
        snippet:
          'API stands for Application Programming Interface. You can think of it as a common language that lets different software systems communicate smoothly, without needing to know how the other is built. More technically, an API is a set of rules and protocols that…'
      }
    ],
    grounding: ['supported', 'supported']
  },
  'Which keyword declares a constant binding in JavaScript?': {
    sources: [
      {
        title: 'const - JavaScript | MDN',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const',
        snippet:
          'The list that follows the `const` keyword is called a binding list and is separated by commas, where the commas are not comma operators and the `=` signs are not assignment operators. Initializers of later variables can refer to earlier variables in the list.…'
      },
      {
        title: 'Medium',
        url: 'https://medium.com/@robinviktorsson/understanding-the-differences-between-var-let-and-const-in-javascript-and-typescript-0ddd90c0b672',
        snippet:
          '1 Listen Share In JavaScript and TypeScript, `var`, `let`, and `const` are the three keywords used to declare variables. However, all three have different characteristics, in regards to scoping, hoisting, and mutability. Understanding these differences is…'
      }
    ],
    grounding: ['supported', 'supported']
  },
  'What does SQL stand for?': {
    sources: [
      {
        title: 'SQL - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/SQL',
        snippet:
          'Structured Query Language (SQL) (pronounced /ˌɛsˌkjuˈɛl/ S-Q-L; or alternatively as /ˈsiːkwəl/ ⓘ-Flame,_not_lame-SQL.wav "File:LL-Q1860 (eng)-Flame, not lame-SQL.wav") "sequel") is a domain-specific language used to manage data, especially in a relational…'
      },
      {
        title: 'What Does SQL Stand For? | Coursera',
        url: 'https://www.coursera.org/articles/what-does-sql-stand-for',
        snippet:
          'The acronym SQL, pronounced either "sequel" or "S-Q-L," stands for structured query language. It is a universal programming language used to manage relational databases. Many relational database management systems (RDBMS) support the SQL language, including…'
      }
    ],
    grounding: ['supported', 'supported']
  },
  'Which HTTP status code means Not Found?': {
    sources: [
      {
        title: 'HTTP Status Codes: All 63 explained - including FAQ & Video',
        url: 'https://umbraco.com/knowledge-base/http-status-codes',
        snippet:
          'HTTP status code 404 means "Page Not Found". This means that the request you sent was received by the server, but it could not find the page you were looking'
      },
      {
        title: '200, 301, 404, & Other Numbers: HTTP Error Codes - Pleth, LLC',
        url: 'https://www.pleth.com/posts/200-301-404-other-numbers-http-error-codes',
        snippet:
          '#### 403 — Forbidden A 403 status code indicates that the client cannot access the requested resource. That might mean that the wrong username and password were sent in the request, or that the permissions on the server do not allow what was being asked. ####…'
      }
    ],
    grounding: ['supported', 'supported']
  },
  'In Big-O notation, which grows fastest as n increases?': {
    sources: [
      {
        title: 'big o notation - Complexity of $O(\\log(n^n))$ vs $O(\\log(n!))$ - Computer Science Stack…',
        url: 'https://cs.stackexchange.com/questions/123755/complexity-of-o-lognn-vs-o-logn',
        snippet:
          'Title: big o notation - Complexity of $O(\\log(n^n))$ vs $O(\\log(n!))$ - Computer Science Stack Exchange #### Stack Exchange Network. Stack Exchange network consists of 183 Q&A communities including Stack Overflow, the largest, most trusted online community…'
      },
      {
        title: 'Understanding Big O Notation: O(n) and O(log n) in Python | by Felipe Limeira | Medium',
        url: 'https://medium.com/@limeira.felipe94/understanding-big-o-notation-o-n-and-o-log-n-in-python-3bb13f55ad7b',
        snippet:
          'Title: Understanding Big O Notation: O(n) and O(log n) in Python | by Felipe Limeira | Medium # Understanding Big O Notation: O(n) and O(log n) in Python. Big O notation is a special notation that indicates how fast an algorithm is. Big O notation does not…'
      }
    ],
    grounding: ['absent', 'absent']
  },
  'Which of these is a compiled language?': {
    sources: [
      {
        title: 'Compiled vs Interpreted Programming Languages – C, C++, Rust, Go, Haskell, C#, Java,…',
        url: 'https://finematics.com/compiled-vs-interpreted-programming-languages',
        snippet:
          'A compiled language is a programming language that is typically implemented using compilers rather than interpreters. A compiler is a program that translates statements written in a particular programming language into another language usually machine code. A…'
      },
      {
        title: 'List of programming languages by type - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/List_of_programming_languages_by_type',
        snippet:
          'Rebol (functional, imperative, object-oriented (prototype-based), metaprogramming (dialected)) Red "Red (programming language)") (functional, imperative, object-oriented (prototype-based), metaprogramming (dialected)) Ruby "Ruby (programming language)")…'
      }
    ],
    grounding: ['absent', 'absent']
  },
  'What is the base of the binary number system?': {
    sources: [
      {
        title: 'Binary number',
        url: 'https://en.wikipedia.org/wiki/Binary_number',
        snippet:
          'The base-2 numeral system is a positional notation with a radix of 2. Each digit is referred to as a bit, or binary digit. Because of its straightforward implementation in digital electronic circuitry using logic gates, the binary system is used by almost all…'
      },
      {
        title: 'Topics from the IB Computer Science syllabus.',
        url: 'https://www.computersciencecafe.com/a121-computer-fundamentals-ib-369306.html',
        snippet:
          'What base is the binary number system? A) Base 8. B) Base 10. C) Base 2. D) Base 16 ; How many symbols are used in the hexadecimal number system? A) 8. B) 10. C)'
      }
    ],
    grounding: ['supported', 'supported']
  }
}

function buildItem(position: number, spec: Spec): Item {
  const retrieved = RETRIEVED[spec.stem]
  const attempts: Attempt[] = spec.readers.map((model, index) =>
    attempt({
      requestedModel: model,
      reading: {
        model,
        answer: spec.answers[index] ?? '',
        defensible: spec.defensible?.[index] ?? [spec.answers[index] ?? ''],
        reason: spec.reasons[index] ?? '',
        ...(retrieved ? { sources: retrieved.sources, grounding: retrieved.grounding[index] ?? 'absent' } : {})
      }
    })
  )

  if (spec.timedOut) {
    attempts.push(
      attempt({
        requestedModel: spec.timedOut,
        servedModel: null,
        requestId: null,
        devshardId: null,
        httpStatus: null,
        receiptStatus: 'missing',
        latencyMs: 90000,
        admitted: false,
        rejectionReason: 'The call passed the 90 second evidence cutoff and returned no headers.'
      })
    )
  }

  // The fixture runs the real rule over its own admitted readings rather than restating the
  // verdict by hand, so the screens can never render a verdict the rule would not produce.
  // Distinctness is by served model, matching how the worker admits readings.
  const itemOptions = options(...spec.choices)
  const admitted = attempts
    .filter((candidate) => candidate.admitted && candidate.reading)
    .map((candidate) => candidate.reading as Reading)
  const decided = verdict(admitted, spec.key, itemOptions)

  return {
    id: `item-${position}`,
    position,
    stem: spec.stem,
    options: itemOptions,
    key: spec.key,
    status: 'done',
    verdict: decided.verdict,
    verdictReason: decided.reason,
    truthScore: truthScore(admitted, spec.key),
    attemptsUsed: attempts.length,
    attempts,
    dispositions: []
  }
}

const SPECS: Spec[] = [
  {
    stem: 'Which data structure processes elements in first in, first out order?',
    choices: ['Stack', 'Queue', 'Binary tree', 'Hash table'],
    key: 'A',
    readers: [MINIMAX, KIMI],
    answers: ['B', 'B'],
    reasons: [
      'A queue removes the element that has waited longest, which is first in, first out. A stack is last in, first out.',
      'First in, first out describes a queue. Stack ordering is the reverse.'
    ]
  },
  {
    stem: 'What is the worst-case time complexity of binary search on a sorted array of n elements?',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    key: 'C',
    readers: [KIMI, MINIMAX],
    answers: ['B', 'B'],
    reasons: [
      'Each comparison halves the remaining range, giving a logarithmic bound.',
      'Binary search discards half the array per step, so the worst case is O(log n).'
    ]
  },
  {
    stem: 'Which of the following best describes a pure function?',
    choices: [
      'It returns the same output for the same input and has no side effects',
      'It does not use any loops',
      'It is declared with the function keyword',
      'It never throws'
    ],
    key: 'A',
    readers: [MINIMAX, KIMI],
    answers: ['A', 'A'],
    defensible: [['A'], ['A', 'D']],
    reasons: [
      'Referential transparency and the absence of side effects are the definition.',
      'A is the definition, though a function that never throws is a weak consequence of purity in some treatments.'
    ]
  },
  {
    stem: 'In an object-oriented language, what does it mean for a method to be virtual?',
    choices: [
      'It can be overridden by a subclass and dispatched at run time',
      'It has no implementation',
      'It is private to the class',
      'It is resolved at compile time'
    ],
    key: 'A',
    readers: [MINIMAX, KIMI],
    answers: ['A', 'B'],
    defensible: [['A'], ['A', 'B']],
    reasons: [
      'A virtual method participates in dynamic dispatch and may be overridden.',
      'In some languages virtual implies abstract, so B is defensible without more context about the language.'
    ]
  },
  {
    stem: 'Which statement about a hash table is correct?',
    choices: [
      'Lookup is constant time on average',
      'Lookup is always constant time',
      'It keeps its keys in sorted order',
      'It cannot store duplicate values'
    ],
    key: 'A',
    readers: [MINIMAX, KIMI],
    answers: ['A', 'A'],
    defensible: [
      ['A', 'B'],
      ['A', 'B']
    ],
    reasons: [
      'Average-case lookup is constant, but "always" in B is defensible if collisions are assumed away.',
      'A is correct as stated; B reads as correct under an idealised hash assumption, so the wording admits two answers.'
    ]
  },
  {
    stem: 'What does the acronym API stand for?',
    choices: [
      'Application Programming Interface',
      'Applied Program Integration',
      'Automated Process Invocation',
      'Abstract Protocol Identifier'
    ],
    key: 'A',
    readers: [KIMI],
    answers: ['A'],
    reasons: ['Application Programming Interface is the standard expansion.'],
    timedOut: MINIMAX
  }
]

const CLEAN: [string, string[], string][] = [
  ['Which keyword declares a constant binding in JavaScript?', ['const', 'let', 'var', 'static'], 'A'],
  [
    'What does SQL stand for?',
    ['Structured Query Language', 'Sequential Query Logic', 'Simple Quoted Literal', 'Stored Query Link'],
    'A'
  ],
  ['Which HTTP status code means Not Found?', ['200', '301', '404', '500'], 'C'],
  ['In Big-O notation, which grows fastest as n increases?', ['O(log n)', 'O(n)', 'O(n log n)', 'O(2^n)'], 'D'],
  ['Which of these is a compiled language?', ['Python', 'Rust', 'Ruby', 'Bash'], 'B'],
  ['What is the base of the binary number system?', ['2', '8', '10', '16'], 'A']
]

const items: Item[] = [
  ...SPECS.map((spec, index) => buildItem(index + 1, spec)),
  ...CLEAN.map(([stem, choices, key], index) =>
    buildItem(SPECS.length + index + 1, {
      stem,
      choices,
      key,
      readers: [KIMI, MINIMAX],
      answers: [key, key],
      reasons: [
        'The keyed option is the only correct one.',
        'The keyed option is correct and the others are clearly wrong.'
      ]
    })
  )
]

function countBy(list: Item[]): VerdictCounts {
  const counts: VerdictCounts = {
    clear: 0,
    possible_key_error: 0,
    possible_ambiguity: 0,
    split_opinion: 0,
    unverified: 0,
    pending: 0
  }
  for (const item of list) counts[item.verdict] += 1
  return counts
}

// Dispositions mutate in place so the demo beat works: record Key Corrected, watch the summary
// move, and see the machine verdict stay exactly where it was.
export function mockRecord(id: string): RecordDetail {
  const nonClear = items.filter((item) => item.verdict !== 'clear')
  const decided = nonClear.filter((item) => item.dispositions.length > 0).length
  const status = decided === 0 ? 'ready' : decided === nonClear.length ? 'resolved' : 'in_review'

  return {
    id,
    title: 'Introductory Computer Science practice set',
    subject: 'Computer Science',
    language: 'en',
    context: 'First-year practice questions, 12 items',
    status,
    isSample: true,
    expiresAt: null,
    counts: countBy(items),
    truthScore: recordScore(items.map((item) => item.truthScore)),
    corroboration: corroboration(
      items.map((item) =>
        item.attempts
          .filter((candidate) => candidate.admitted && candidate.reading)
          .map((candidate) => candidate.reading as Reading)
      )
    ),
    items: items.map((item) => ({ ...item }))
  }
}

export function mockDisposition(itemId: string, input: DispositionInput): void {
  const item = items.find((candidate) => candidate.id === itemId)
  if (!item) return

  item.dispositions = [
    ...item.dispositions,
    {
      id: `disposition-${item.dispositions.length + 1}`,
      kind: input.kind,
      revisedKey: input.revisedKey ?? null,
      revisedText: input.revisedText ?? null,
      note: input.note ?? null,
      createdAt: new Date().toISOString()
    }
  ]
}

// A stand-in library for GET /api/records and DELETE /api/records, behind the same flag.
let library: RecordSummary[] = [
  {
    id: 'sample',
    title: 'Introductory Computer Science practice set',
    subject: 'Computer Science',
    status: 'ready',
    itemCount: 12,
    attentionCount: 5,
    isSample: true,
    expiresAt: null,
    updatedAt: '2026-09-03T01:08:00Z'
  },
  {
    id: 'rec-week-4',
    title: 'Week 4 data structures quiz',
    subject: 'Computer Science',
    status: 'in_review',
    itemCount: 8,
    attentionCount: 2,
    isSample: false,
    expiresAt: '2026-09-04T09:00:00Z',
    updatedAt: '2026-09-03T00:41:00Z'
  },
  {
    id: 'rec-networks',
    title: 'Networking fundamentals revision',
    subject: 'Computer Networks',
    status: 'checking',
    itemCount: 6,
    attentionCount: 0,
    isSample: false,
    expiresAt: '2026-09-04T07:20:00Z',
    updatedAt: '2026-09-03T00:12:00Z'
  },
  {
    id: 'rec-algebra',
    title: 'Linear algebra warm-up',
    subject: 'Mathematics',
    status: 'resolved',
    itemCount: 10,
    attentionCount: 0,
    isSample: false,
    expiresAt: null,
    updatedAt: '2026-09-02T18:55:00Z'
  }
]

export function mockRecordList(query: { q?: string; status?: string; attention?: boolean }): RecordSummary[] {
  return library
    .filter((record) => (query.status ? record.status === query.status : true))
    .filter((record) => (query.attention ? record.attentionCount > 0 : true))
    .filter((record) =>
      query.q ? `${record.title} ${record.subject}`.toLowerCase().includes(query.q.toLowerCase()) : true
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function mockDelete(ids: string[]) {
  const skipped = ids
    .filter((id) => library.find((record) => record.id === id)?.isSample)
    .map((id) => ({ id, reason: 'sample' }))
  const removable = new Set(ids.filter((id) => !skipped.some((entry) => entry.id === id)))
  library = library.filter((record) => !removable.has(record.id))
  return { deleted: [...removable], skipped, mode: 'immediate' as const }
}

// A stand-in for GET /api/stats. Every figure is counted off the mock items and the mock library
// rather than typed in, so the dashboard cannot show a number the rest of the mock disagrees with.
export function mockStats(): AccountStats {
  const readings = items.flatMap((item) => item.attempts).filter((attempt) => attempt.reading !== null)
  const families = new Map<string, { readings: number; verified: number }>()

  for (const attempt of readings) {
    const model = attempt.servedModel
    if (!model) continue
    const family = families.get(model) ?? { readings: 0, verified: 0 }
    family.readings += 1
    if (attempt.receiptStatus === 'verified') family.verified += 1
    families.set(model, family)
  }

  return {
    records: library.length,
    items: items.length,
    counts: countBy(items),
    readings: readings.length,
    verifiedReadings: readings.filter((attempt) => attempt.receiptStatus === 'verified').length,
    families: [...families.entries()]
      .map(([model, family]) => ({ model, ...family }))
      .sort((a, b) => b.readings - a.readings)
  }
}

// The mock agent turn, so the transcript, the citation pills and the two provenance treatments can
// be looked at without a gateway key. It answers from the mock record's own first flagged item, so
// the pills resolve against something real rather than being drawn from literals.
export function mockAnswer(id: string): ChatMessage[] {
  const record = mockRecord(id)
  const item = record.items.find((candidate) => candidate.verdict !== 'clear' && candidate.verdict !== 'pending')
  const seated = item ? seatedAttempts(item) : []
  const [first, second] = seated

  if (!item || !first) {
    return [
      {
        id: crypto.randomUUID(),
        role: 'agent',
        seat: null,
        text: 'Nothing in this record is flagged, so there is nothing for me to explain.',
        citations: [],
        provenance: { provider: 'gemini', responseId: 'resp-mock', model: 'gemini-2.5-flash' }
      }
    ]
  }

  const cite = (seat: Seat, attempt: typeof first): Citation => ({
    kind: 'reading',
    position: item.position,
    seat,
    model: attempt.servedModel ?? 'unknown',
    requestId: attempt.requestId
  })

  const messages: ChatMessage[] = [
    {
      id: crypto.randomUUID(),
      role: 'agent',
      seat: null,
      text: `Question ${item.position} is flagged because both readers landed on the same option and it is not your key.`,
      citations: [{ kind: 'item', position: item.position }],
      provenance: null
    },
    {
      id: crypto.randomUUID(),
      role: 'agent',
      seat: 0,
      text: `I read ${first.reading?.answer ?? '?'}, and I did not see your key before I answered.`,
      citations: first.requestId
        ? [cite(0, first), { kind: 'receipt', requestId: first.requestId, model: first.servedModel }]
        : [cite(0, first)],
      provenance: null
    }
  ]

  if (second) {
    messages.push({
      id: crypto.randomUUID(),
      role: 'agent',
      seat: 1,
      text: `So did I. Which option is actually correct is your call, not mine.`,
      citations: [cite(1, second)],
      provenance: null
    })
  }

  const last = messages[messages.length - 1]
  if (last) last.provenance = { provider: 'gemini', responseId: 'resp-mock-1788016913316', model: 'gemini-2.5-flash' }

  return messages
}

// The tool trace the mock agent "makes", so the Codex-style in-flight list can be looked at without
// a gateway key. Shape matches what the SSE route emits.
export function mockTools(): { name: string; position: number | null }[] {
  return [
    { name: 'record_summary', position: null },
    { name: 'list_items', position: null },
    { name: 'get_readings', position: 4 }
  ]
}
