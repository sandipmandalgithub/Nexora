
const learningTips = [
  {
    category: "Study Habits",
    icon: "📚",
    color: "indigo",
    title: "Study in Short, Focused Sessions",
    description:
      "Break your study time into focused sessions. Study for 25–30 minutes, then take a short break to refresh your mind.",
    points: [
      "Avoid multitasking while studying.",
      "Keep your phone away during study sessions.",
      "Take short breaks between sessions.",
    ],
  },
  {
    category: "Exam Preparation",
    icon: "📝",
    color: "amber",
    title: "Prepare Before Your Exams",
    description:
      "A consistent preparation routine helps you understand concepts better and feel more confident during examinations.",
    points: [
      "Review important topics regularly.",
      "Practice previous questions and mock tests.",
      "Revise difficult concepts before the exam.",
    ],
  },
  {
    category: "Time Management",
    icon: "⏰",
    color: "sky",
    title: "Plan Your Learning Schedule",
    description:
      "Create a realistic daily study plan and give enough time to each subject according to its difficulty.",
    points: [
      "Set achievable daily learning goals.",
      "Prioritize important topics.",
      "Track your learning progress.",
    ],
  },
  {
    category: "Active Learning",
    icon: "🧠",
    color: "emerald",
    title: "Learn by Practicing",
    description:
      "Reading alone is not enough. Apply what you learn through exercises, quizzes and practical examples.",
    points: [
      "Write notes in your own words.",
      "Solve problems after learning a topic.",
      "Explain difficult concepts to yourself.",
    ],
  },
  {
    category: "Productivity",
    icon: "🎯",
    color: "purple",
    title: "Stay Consistent and Focused",
    description:
      "Small improvements every day can create meaningful progress over time. Focus on consistency rather than perfection.",
    points: [
      "Complete one learning goal at a time.",
      "Celebrate your small achievements.",
      "Review your progress every week.",
    ],
  },
  {
    category: "Well-being",
    icon: "🌱",
    color: "teal",
    title: "Maintain a Healthy Study Routine",
    description:
      "Taking care of your physical and mental well-being can help you stay motivated and focused while learning.",
    points: [
      "Get enough sleep and rest.",
      "Stay hydrated during study sessions.",
      "Take breaks when you feel tired.",
    ],
  },
];

const colorStyles = {
  indigo: {
    icon: "bg-indigo-50 text-indigo-600",
    badge: "bg-indigo-50 text-indigo-700",
    border: "hover:border-indigo-200",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600",
    badge: "bg-amber-50 text-amber-700",
    border: "hover:border-amber-200",
  },
  sky: {
    icon: "bg-sky-50 text-sky-600",
    badge: "bg-sky-50 text-sky-700",
    border: "hover:border-sky-200",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700",
    border: "hover:border-emerald-200",
  },
  purple: {
    icon: "bg-purple-50 text-purple-600",
    badge: "bg-purple-50 text-purple-700",
    border: "hover:border-purple-200",
  },
  teal: {
    icon: "bg-teal-50 text-teal-600",
    badge: "bg-teal-50 text-teal-700",
    border: "hover:border-teal-200",
  },
};

export default function StudentLearningTips() {
  return (
    <section className="min-w-0 space-y-6">
      {/* Header */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 text-white shadow-lg shadow-orange-200/40 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold tracking-wide text-orange-50">
              LEARN SMARTER EVERY DAY
            </span>

            <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
              Learning Tips
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-orange-50 sm:text-base">
              Discover practical study strategies, exam preparation advice
              and productivity tips to make your learning journey more
              effective.
            </p>
          </div>

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-4xl">
            💡
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
            📖 Study Better
          </span>
          <span className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
            🎯 Stay Focused
          </span>
          <span className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
            🚀 Grow Every Day
          </span>
        </div>
      </div>

      {/* Tips Heading */}
      <div>
        <h3 className="text-xl font-black text-slate-900 sm:text-2xl">
          Tips for Your Learning Journey
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Simple and practical ideas to improve your study habits and
          academic performance.
        </p>
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {learningTips.map((tip, index) => {
          const styles = colorStyles[tip.color];

          return (
            <article
              key={tip.title}
              className={`flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${styles.border}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${styles.icon}`}
                >
                  {tip.icon}
                </div>

                <span className="text-xs font-bold text-slate-400">
                  TIP {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <span
                className={`mt-4 inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${styles.badge}`}
              >
                {tip.category}
              </span>

              <h4 className="mt-3 text-lg font-extrabold leading-6 text-slate-900">
                {tip.title}
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {tip.description}
              </p>

              <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                {tip.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-sm leading-5 text-slate-600"
                  >
                    <span className="mt-0.5 font-bold text-emerald-600">
                      ✓
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      {/* Bottom Message */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🌟</span>
          <div>
            <h3 className="font-extrabold text-slate-900">
              A Little Progress Every Day
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              You do not have to learn everything in one day. Stay curious,
              practice consistently and keep moving forward with Nexora.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
