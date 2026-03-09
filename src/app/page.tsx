import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Paradigm Pro</h1>
            <div className="flex items-center gap-4">
              <Link href="/login" className="btn-secondary">Sign in</Link>
              <Link href="/register" className="btn-primary">Get started</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center">
        <h2 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Master Strategic Consulting
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          A structured 12-week course with video lessons, downloadable materials,
          and hands-on assignments designed for aspiring and practicing consultants.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/register" className="btn-primary text-base px-8 py-3">
            Start Learning
          </Link>
          <Link href="/courses" className="btn-secondary text-base px-8 py-3">
            Browse Courses
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h3 className="text-center text-3xl font-bold text-gray-900 mb-16">
            Everything You Need to Succeed
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Video Lessons",
                desc: "Expert-led video content with adaptive streaming. Watch at your own pace, resume where you left off.",
                icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
              },
              {
                title: "Course Materials",
                desc: "Downloadable PDFs, slide decks, templates, and worksheets to reinforce learning and apply in practice.",
                icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
              },
              {
                title: "Progress Tracking",
                desc: "Track your completion across all 12 weeks. See exactly where you are and what's next.",
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
              },
            ].map((f) => (
              <div key={f.title} className="card p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100">
                  <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">{f.title}</h4>
                <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900">Ready to Transform Your Consulting Skills?</h3>
          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            Join our 12-week program and gain the frameworks, tools, and confidence to deliver outstanding results.
          </p>
          <Link href="/register" className="btn-primary mt-8 text-base px-8 py-3 inline-flex">
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Paradigm Pro. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
