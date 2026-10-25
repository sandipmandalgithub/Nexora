
export function getExamDeadline(attempt, exam) {
  if (!attempt?.startedAt || !exam?.durationMinutes) {
    return null;
  }

  const startedAt = new Date(attempt.startedAt).getTime();
  const durationMs = Number(exam.durationMinutes) * 60 * 1000;

  if (
    !Number.isFinite(startedAt) ||
    !Number.isFinite(durationMs) ||
    durationMs <= 0
  ) {
    return null;
  }

  return startedAt + durationMs;
}

export function formatRemainingTime(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}
