'use client';

/**
 * PainPoints Section
 * Problem definition with Before/After comparison
 * Google DeepMind-inspired clean design
 */

const painPoints = [
  {
    before: {
      title: '2h/day',
      description: 'Manual search across portals',
    },
    after: {
      title: '0 min',
      description: 'Automated collection & alerts',
    },
    improvement: '100%',
  },
  {
    before: {
      title: '15/week',
      description: 'Missed due to keyword mismatch',
    },
    after: {
      title: 'Zero',
      description: 'Semantic analysis coverage',
    },
    improvement: '100%',
  },
  {
    before: {
      title: '3 days',
      description: 'Proposal draft writing',
    },
    after: {
      title: '30 min',
      description: 'AI generation + review',
    },
    improvement: '95%',
  },
];

export function PainPoints() {
  return (
    <section className="bg-neutral-50 py-24" id="painpoints">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium uppercase tracking-wider text-neutral-700">
            Problem Space
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            Before vs After
          </h2>
          <p className="mt-4 text-lg text-neutral-500">
            Eliminate repetitive inefficiencies in your bidding workflow
          </p>
        </div>

        {/* Pain Points Grid */}
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {painPoints.map((point, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:border-neutral-300"
            >
              {/* Before (Problem) */}
              <div className="border-b border-neutral-100 bg-neutral-50/50 p-6">
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Before
                </div>
                <div className="text-2xl font-bold text-neutral-900">{point.before.title}</div>
                <div className="mt-1 text-sm text-neutral-500">{point.before.description}</div>
              </div>

              {/* Arrow */}
              <div className="absolute left-1/2 top-1/2 z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white">
                <svg
                  className="h-4 w-4 text-neutral-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>

              {/* After (Solution) */}
              <div className="bg-white p-6">
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-600">
                  With Qetta
                </div>
                <div className="text-2xl font-bold text-neutral-900">{point.after.title}</div>
                <div className="mt-1 text-sm text-neutral-500">{point.after.description}</div>
              </div>

              {/* Improvement Badge */}
              <div className="absolute right-4 top-4 rounded bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-700">
                -{point.improvement}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-neutral-500">
            <span className="font-semibold text-neutral-900">127 companies</span> have automated
            their bidding process with Qetta
          </p>
        </div>
      </div>
    </section>
  );
}

export default PainPoints;
