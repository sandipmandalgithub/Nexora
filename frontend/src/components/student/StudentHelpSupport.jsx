const helpSections = [
  {
    title: "Courses & Learning",
    icon: "📚",
    questions: [
      {
        question: "Where can I find my enrolled courses?",
        answer:
          "Open My Courses from your student dashboard. All courses in which you are enrolled will be displayed there. Select Continue Learning to open a course.",
      },
      {
        question: "How can I continue a course?",
        answer:
          "Go to My Courses and select Continue Learning on the course you want to study. You can access the available learning content from the course page.",
      },
    ],
  },
  {
    title: "Examinations",
    icon: "📝",
    questions: [
      {
        question: "How do I start an examination?",
        answer:
          "Open Available Exams, choose a published examination and select Start Exam. Read the instructions and complete your examination within the available time.",
      },
      {
        question: "Will my answers be saved if I refresh the page?",
        answer:
          "Nexora saves your selected answers and review markers in your current browser. You can recover an in-progress attempt using the same browser and device. Avoid clearing browser data while an examination is in progress.",
      },
      {
        question: "What happens when the examination timer reaches zero?",
        answer:
          "The platform automatically attempts to submit your examination when the timer expires. If submission fails because of a connection problem, use the Retry Submission option when available.",
      },
    ],
  },
  {
    title: "Results & Certificates",
    icon: "🏆",
    questions: [
      {
        question: "Where can I check my examination results?",
        answer:
          "Open My Results to view your examination attempts, scores and submission statuses. Where available, select View Review to see question-level feedback.",
      },
      {
        question: "Where can I find my grade cards and certificates?",
        answer:
          "Open the Academic Achievements area on your Overview dashboard to access the grade cards and certificates available to your account.",
      },
    ],
  },
  {
    title: "Account & Profile",
    icon: "👤",
    questions: [
      {
        question: "Where can I view my account information?",
        answer:
          "Open Profile from the student navigation to view your registered name, email address and account role.",
      },
      {
        question: "What should I do if I cannot access my account?",
        answer:
          "Check your login credentials and try signing in again. If the problem continues, contact your platform administrator for assistance.",
      },
    ],
  },
];

export default function StudentHelpSupport() {
  return (
    <section className="min-w-0 space-y-6">
      {/* Introduction */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-5 text-white shadow-lg shadow-indigo-200/50 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold tracking-wide text-indigo-100">
              STUDENT SUPPORT CENTER
            </span>

            <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
              How can we help you?
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
              Find helpful answers about your courses, examinations, results
              and Nexora account.
            </p>
          </div>

          <div className="flex h-16 w-16 shrink-0 items-center justify-center self-start rounded-2xl border border-white/20 bg-white/10 text-3xl sm:h-20 sm:w-20 sm:self-center">
            ?
          </div>
        </div>
      </div>

      {/* Quick Help Categories */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {helpSections.map((section) => (
          <a
            key={section.title}
            href={`#help-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">
              {section.icon}
            </span>

            <span className="min-w-0">
              <span className="block break-words text-sm font-bold text-slate-900">
                {section.title}
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                {section.questions.length} helpful articles
              </span>
            </span>
          </a>
        ))}
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Browse the answers to common questions about using Nexora.
          </p>
        </div>

        {helpSections.map((section) => (
          <section
            key={section.title}
            id={`help-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            className="scroll-mt-32 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                {section.icon}
              </span>

              <h3 className="text-base font-extrabold text-slate-900 sm:text-lg">
                {section.title}
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {section.questions.map((item) => (
                <details key={item.question} className="group py-4 first:pt-0 last:pb-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold leading-6 text-slate-800 marker:hidden transition hover:text-indigo-700 [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>

                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-open:rotate-180 group-open:bg-indigo-50 group-open:text-indigo-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </summary>

                  <p className="mt-3 pr-8 text-sm leading-7 text-slate-600">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Support Information */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
            💬
          </span>

          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-slate-900">
              Still need assistance?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              If you cannot find an answer here, contact your Nexora platform
              administrator and describe the issue you are experiencing.
              Include the relevant course, examination or attempt details
              whenever possible.
            </p>

            <p className="mt-3 text-xs font-semibold text-indigo-700">
              Nexora Student Support · Learn. Practice. Evaluate. Grow.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}