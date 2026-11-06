import StudentGradeCards from "./StudentGradeCards";

export default function StudentAchievements() {
  return (
    <section className="min-w-0 space-y-6">
      {/* Achievements Header */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-6 text-white shadow-lg shadow-indigo-200/40 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold tracking-wide text-indigo-100">
              YOUR ACADEMIC JOURNEY
            </span>

            <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
              Your Achievements
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
              Explore your academic performance, earned grades, examination
              results and course certificates in one place.
            </p>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl">
            🏆
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-xl">
                📊
              </span>
              <div>
                <p className="text-sm font-bold text-white">
                  Exam Performance
                </p>
                <p className="mt-1 text-xs text-indigo-100">
                  Review your results
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-xl">
                🎓
              </span>
              <div>
                <p className="text-sm font-bold text-white">
                  Academic Grades
                </p>
                <p className="mt-1 text-xs text-indigo-100">
                  View your earned grades
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-xl">
                📜
              </span>
              <div>
                <p className="text-sm font-bold text-white">
                  Certificates
                </p>
                <p className="mt-1 text-xs text-indigo-100">
                  Access your certificates
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Existing Grade Cards and Certificates */}
      <div className="min-w-0">
        <div className="mb-4">
          <h3 className="text-xl font-black text-slate-900 sm:text-2xl">
            Academic Records
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Your examination grade cards and available academic certificates.
          </p>
        </div>

        <StudentGradeCards />
      </div>
    </section>
  );
}