import { useMemo } from "react";

function formatPercentage(value) {
  const number = Number(value);

  return Number.isFinite(number) ? `${number.toFixed(1)}%` : "—";
}

function getPercentage(attempt) {
  const score = Number(
    attempt.score ?? attempt.marksObtained ?? attempt.totalScore
  );
  const totalMarks = Number(attempt.totalMarks);

  if (
    !Number.isFinite(score) ||
    !Number.isFinite(totalMarks) ||
    totalMarks <= 0
  ) {
    return null;
  }

  return Math.max(0, Math.min(100, (score / totalMarks) * 100));
}

function getAttemptDate(attempt) {
  const value =
    attempt.submittedAt || attempt.completedAt || attempt.startedAt;

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function ScoreTrendChart({ attempts }) {
  const chartData = useMemo(() => {
    return attempts
      .filter((attempt) =>
        ["SUBMITTED", "COMPLETED", "GRADED"].includes(
          String(attempt.status || "").toUpperCase()
        )
      )
      .map((attempt) => ({
        id: attempt.id ?? attempt.attemptId,
        title:
          attempt.examTitle ||
          attempt.title ||
          `Exam #${attempt.examId ?? attempt.id ?? ""}`,
        percentage: getPercentage(attempt),
        date: getAttemptDate(attempt),
      }))
      .filter(
        (attempt) =>
          attempt.id != null && attempt.percentage !== null
      )
      .sort((a, b) => {
        const dateA = a.date?.getTime() ?? 0;
        const dateB = b.date?.getTime() ?? 0;

        return dateA - dateB;
      })
      .slice(-10);
  }, [attempts]);

  if (chartData.length === 0) {
    return (
      <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
        <span className="text-3xl" aria-hidden="true">
          📈
        </span>
        <h3 className="mt-3 text-sm font-extrabold text-slate-800">
          Your score trend will appear here
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          Submit an exam with a recorded score to start tracking your
          performance over time.
        </p>
      </div>
    );
  }

  const width = 720;
  const height = 260;
  const paddingLeft = 42;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 45;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const points = chartData.map((item, index) => {
    const x =
      chartData.length === 1
        ? paddingLeft + plotWidth / 2
        : paddingLeft + (index / (chartData.length - 1)) * plotWidth;

    const y = paddingTop + ((100 - item.percentage) / 100) * plotHeight;

    return { ...item, x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = [
    `M ${points[0].x} ${paddingTop + plotHeight}`,
    ...points.map((point) => `L ${point.x} ${point.y}`),
    `L ${points[points.length - 1].x} ${paddingTop + plotHeight}`,
    "Z",
  ].join(" ");

  const gridValues = [0, 25, 50, 75, 100];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-800">
            Score percentage
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Your latest {chartData.length} scored exam attempts
          </p>
        </div>

        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
          Latest: {formatPercentage(chartData[chartData.length - 1].percentage)}
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Line chart showing percentages from recent completed exam attempts"
          className="h-auto w-full min-w-[320px]"
        >
          {gridValues.map((value) => {
            const y = paddingTop + ((100 - value) / 100) * plotHeight;

            return (
              <g key={value}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 9}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748b"
                >
                  {value}%
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="#6366f1" opacity="0.10" />

          <path
            d={linePath}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, index) => (
            <g key={point.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="#4f46e5"
                stroke="#ffffff"
                strokeWidth="2"
              >
                <title>
                  {point.title}: {formatPercentage(point.percentage)}
                </title>
              </circle>

              {(chartData.length <= 5 ||
                index === 0 ||
                index === points.length - 1) && (
                <text
                  x={point.x}
                  y={height - 17}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#64748b"
                >
                  {point.date
                    ? point.date.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })
                    : `#${index + 1}`}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-3 space-y-2">
        {chartData
          .slice()
          .reverse()
          .map((attempt) => (
            <div
              key={attempt.id}
              className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3"
            >
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-slate-800">
                  {attempt.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {attempt.date
                    ? attempt.date.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Submission date unavailable"}
                </p>
              </div>

              <span className="shrink-0 text-sm font-extrabold text-indigo-700">
                {formatPercentage(attempt.percentage)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function StudentPerformanceAnalytics({ analytics, attempts = [] }) {
  const completedAttempts = useMemo(
    () =>
      attempts.filter((attempt) =>
        ["SUBMITTED", "COMPLETED", "GRADED"].includes(
          String(attempt.status || "").toUpperCase()
        )
      ),
    [attempts]
  );

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-black text-slate-900">
            Score Trend
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Review how your recorded scores change across completed exams.
          </p>
        </div>

        <ScoreTrendChart attempts={completedAttempts} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4">
          <h3 className="text-lg font-black text-slate-900">
            Performance Summary
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Summary values returned by the Nexora analytics API.
          </p>
        </div>

        {!analytics ? (
          <p className="text-sm text-slate-500">
            Summary statistics are currently unavailable.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-indigo-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">
                Total Attempts
              </p>
              <p className="mt-2 text-2xl font-black text-slate-950">
                {analytics.totalAttempts ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                Submitted Exams
              </p>
              <p className="mt-2 text-2xl font-black text-slate-950">
                {analytics.submittedAttempts ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-violet-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-violet-700">
                Average Score
              </p>
              <p className="mt-2 text-2xl font-black text-slate-950">
                {formatPercentage(analytics.averagePercentage ?? 0)}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                Best Score
              </p>
              <p className="mt-2 text-2xl font-black text-slate-950">
                {formatPercentage(analytics.bestPercentage ?? 0)}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default StudentPerformanceAnalytics;