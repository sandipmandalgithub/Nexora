import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, getApiError } from "../utils/api";
import { getExamDeadline, formatRemainingTime } from "../utils/examTime";
import AlertMessage from "../components/auth/AlertMessage";
import EmptyState from "../components/ui/EmptyState";
import StatCard from "../components/ui/StatCard";

function StudentDashboard({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");

  const [enrollments, setEnrollments] = useState([]);
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  const [startingExamId, setStartingExamId] = useState(null);
  const [examActionError, setExamActionError] = useState("");
  const [examSession, setExamSession] = useState(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState("");
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

  const [remainingSeconds, setRemainingSeconds] = useState(null);

  const submitLockRef = useRef(false);
  const recoveredAttemptIdRef = useRef(null);
  const autoSubmitAttemptRef = useRef(null);

  const token = localStorage.getItem("nexoraToken");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setErrors({});

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const results = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/enrollments/my`, { headers }),
        axios.get(`${API_BASE_URL}/exams`, { headers }),
        axios.get(`${API_BASE_URL}/exam-attempts/my`, { headers }),
        axios.get(`${API_BASE_URL}/exam-attempts/my/analytics`, { headers }),
      ]);

      if (!active) return;

      const nextErrors = {};

      if (results[0].status === "fulfilled") {
        setEnrollments(
          Array.isArray(results[0].value.data)
            ? results[0].value.data
            : []
        );
      } else {
        nextErrors.courses = getApiError(results[0].reason);
      }

      if (results[1].status === "fulfilled") {
        const data = results[1].value.data;
        const examList = Array.isArray(data) ? data : [];

        setExams(examList.filter((exam) => exam.published === true));
      } else {
        nextErrors.exams = getApiError(results[1].reason);
      }

      if (results[2].status === "fulfilled") {
        setAttempts(
          Array.isArray(results[2].value.data)
            ? results[2].value.data
            : []
        );
      } else {
        nextErrors.results = getApiError(results[2].reason);
      }

      if (results[3].status === "fulfilled") {
        setAnalytics(results[3].value.data);
      } else {
        setAnalytics(null);
        nextErrors.analytics = getApiError(results[3].reason);
      }

      setErrors(nextErrors);
      setLoading(false);
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [token, refreshKey]);

  function handleLogout() {
    localStorage.removeItem("nexoraToken");
    localStorage.removeItem("nexoraUser");
    navigate("/login", { replace: true });
  }

  function refreshDashboard() {
    setRefreshKey((key) => key + 1);
  }

  const loadExamQuestions = useCallback(async (examId) => {
    setQuestionsLoading(true);
    setQuestionsError("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/student/exams/${examId}/questions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExamSession((current) => {
        if (!current || String(current.exam.id) !== String(examId)) {
          return current;
        }

        return {
          ...current,
          questions: Array.isArray(response.data) ? response.data : [],
        };
      });
    } catch (error) {
      setQuestionsError(getApiError(error));
    } finally {
      setQuestionsLoading(false);
    }
  }, [token]);

  /*
   * Recover an in-progress attempt after a page refresh or a new login.
   * The answers are restored from this browser's localStorage.
   */
  useEffect(() => {
    if (
      loading ||
      examSession ||
      submissionResult ||
      errors.exams ||
      errors.results
    ) {
      return;
    }

    const inProgressAttempt = attempts
      .filter(
        (attempt) =>
          String(attempt.status || "").toUpperCase() === "IN_PROGRESS"
      )
      .sort(
        (a, b) =>
          new Date(b.startedAt || 0).getTime() -
          new Date(a.startedAt || 0).getTime()
      )[0];

    if (!inProgressAttempt) return;

    const attemptId = inProgressAttempt.id;

    if (
      attemptId == null ||
      recoveredAttemptIdRef.current === String(attemptId)
    ) {
      return;
    }

    const attemptExamId =
      inProgressAttempt.examId ?? inProgressAttempt.exam?.id;

    const matchingExam = exams.find(
      (exam) => String(exam.id) === String(attemptExamId)
    );

    if (!matchingExam) return;

    recoveredAttemptIdRef.current = String(attemptId);

    let savedAnswers = {};

    try {
      const storedAnswers = JSON.parse(
        localStorage.getItem(`nexoraExamAnswers:${attemptId}`) || "{}"
      );

      if (
        storedAnswers &&
        typeof storedAnswers === "object" &&
        !Array.isArray(storedAnswers)
      ) {
        savedAnswers = storedAnswers;
      }
    } catch {
      savedAnswers = {};
    }

    let savedReviewMarks = {};

    try {
      const storedReviewMarks = JSON.parse(
        localStorage.getItem(`nexoraExamReview:${attemptId}`) || "{}"
      );

      if (
        storedReviewMarks &&
        typeof storedReviewMarks === "object" &&
        !Array.isArray(storedReviewMarks)
      ) {
        savedReviewMarks = storedReviewMarks;
      }
    } catch {
      savedReviewMarks = {};
    }

    const recoveryTimerId = window.setTimeout(() => {
      setAnswers(savedAnswers);
      setMarkedForReview(savedReviewMarks);
      setActiveQuestionId(null);
      setQuestionsError("");
      setSubmissionError("");
      setSubmissionResult(null);
      setExamActionError("");
      setShowSubmitConfirmation(false);

      setExamSession({
        exam: matchingExam,
        attempt: inProgressAttempt,
        questions: [],
      });

      setActiveTab("Available Exams");
      loadExamQuestions(matchingExam.id);
    }, 0);

    return () => window.clearTimeout(recoveryTimerId);
  }, [
    loading,
    exams,
    attempts,
    examSession,
    submissionResult,
    errors.exams,
    errors.results,
    loadExamQuestions,
  ]);

  /*
   * Save answers after every answer change.
   * This recovery is limited to the same browser/device.
   */
  useEffect(() => {
    const attemptId = examSession?.attempt?.id;

    if (attemptId == null || submissionResult) return undefined;

    try {
      localStorage.setItem(
        `nexoraExamAnswers:${attemptId}`,
        JSON.stringify(answers)
      );
    } catch {
      const errorTimerId = window.setTimeout(() => {
        setSubmissionError(
          "Your answers could not be saved in this browser. Please keep the exam page open."
        );
      }, 0);

      return () => window.clearTimeout(errorTimerId);
    }

    return undefined;
  }, [examSession?.attempt?.id, answers, submissionResult]);

  /*
   * Save question review markers for the current attempt so they survive refresh.
   */
  useEffect(() => {
    const attemptId = examSession?.attempt?.id;

    if (attemptId == null || submissionResult) return;

    try {
      localStorage.setItem(
        `nexoraExamReview:${attemptId}`,
        JSON.stringify(markedForReview)
      );
    } catch {
      // Review markers are helpful but should never block an exam.
    }
  }, [examSession?.attempt?.id, markedForReview, submissionResult]);

  function toggleQuestionReview(questionId) {
    if (submissionResult || submittingExam || remainingSeconds === 0) return;

    setMarkedForReview((previous) => ({
      ...previous,
      [questionId]: !previous[questionId],
    }));
  }

  function navigateToQuestion(questionId) {
    setActiveQuestionId(questionId);
    document.getElementById(`exam-question-${questionId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function handleStartExam(exam) {
    if (startingExamId !== null || examSession) return;

    setStartingExamId(exam.id);
    setExamActionError("");
    setQuestionsError("");
    setSubmissionError("");
    setSubmissionResult(null);
    setAnswers({});
    setMarkedForReview({});
    setActiveQuestionId(null);
    setShowSubmitConfirmation(false);
    setRemainingSeconds(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/exam-attempts/exams/${exam.id}/start`,
        {},
        { headers: authHeaders }
      );

      const attempt = response.data;

      if (attempt?.id == null) {
        setExamActionError(
          "The server did not return an attempt ID. Check the start-attempt API response."
        );
        return;
      }

      submitLockRef.current = false;
      autoSubmitAttemptRef.current = null;
      recoveredAttemptIdRef.current = String(attempt.id);

      setExamSession({
        exam,
        attempt,
        questions: [],
      });

      setActiveTab("Available Exams");

      await loadExamQuestions(exam.id);
    } catch (error) {
      setExamActionError(getApiError(error));
    } finally {
      setStartingExamId(null);
    }
  }

  function handleAnswerChange(questionId, selectedOption) {
    if (submissionResult || submittingExam || remainingSeconds === 0) return;

    setAnswers((previous) => ({
      ...previous,
      [questionId]: selectedOption,
    }));
  }

  const handleSubmitExam = useCallback(async () => {
    if (
      !examSession ||
      !examSession.attempt?.id ||
      submittingExam ||
      submitLockRef.current ||
      submissionResult
    ) {
      return;
    }

    submitLockRef.current = true;
    setSubmittingExam(true);
    setSubmissionError("");
    setShowSubmitConfirmation(false);

    const submittedAnswers = Object.entries(answers)
      .filter(([, selectedOption]) =>
        ["A", "B", "C", "D"].includes(selectedOption)
      )
      .map(([questionId, selectedOption]) => ({
        questionId: Number(questionId),
        selectedOption,
      }));

    try {
      const response = await axios.post(
        `${API_BASE_URL}/exam-attempts/${examSession.attempt.id}/submit`,
        { answers: submittedAnswers },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubmissionResult(response.data);
      setRemainingSeconds(null);

      localStorage.removeItem(
        `nexoraExamAnswers:${examSession.attempt.id}`
      );
      localStorage.removeItem(
        `nexoraExamReview:${examSession.attempt.id}`
      );

      setRefreshKey((key) => key + 1);
    } catch (error) {
      setSubmissionError(getApiError(error));
    } finally {
      submitLockRef.current = false;
      setSubmittingExam(false);
    }
  }, [
    examSession,
    submittingExam,
    submissionResult,
    answers,
    token,
  ]);

  /*
   * Calculate the countdown from the server-provided attempt start time.
   * This means refreshing the page does not reset the exam duration.
   */
  useEffect(() => {
    if (!examSession || submissionResult) {
      return;
    }

    const attemptId = examSession.attempt?.id;

    const deadline = getExamDeadline(
      examSession.attempt,
      examSession.exam
    );

    if (deadline == null) {
      return;
    }

    function updateTimer() {
      const secondsLeft = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / 1000)
      );

      setRemainingSeconds(secondsLeft);

      if (secondsLeft <= 0) {
        const attemptKey = String(attemptId);

        if (autoSubmitAttemptRef.current !== attemptKey) {
          autoSubmitAttemptRef.current = attemptKey;

          if (!submitLockRef.current) {
            handleSubmitExam();
          }
        }
      }
    }

    updateTimer();

    const timerId = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(timerId);
  }, [examSession, submissionResult, handleSubmitExam]);

  function closeExamSession() {
    const attemptId = examSession?.attempt?.id;

    if (submissionResult && attemptId != null) {
      localStorage.removeItem(`nexoraExamAnswers:${attemptId}`);
      localStorage.removeItem(`nexoraExamReview:${attemptId}`);
    }

    setExamSession(null);
    setAnswers({});
    setMarkedForReview({});
    setActiveQuestionId(null);
    setQuestionsError("");
    setExamActionError("");
    setSubmissionError("");
    setSubmissionResult(null);
    setShowSubmitConfirmation(false);
    setRemainingSeconds(null);

    refreshDashboard();
  }

  const tabs = [
    { label: "Overview", icon: "⌂" },
    { label: "My Courses", icon: "▤" },
    { label: "Available Exams", icon: "◎" },
    { label: "My Results", icon: "▥" },
    { label: "Profile", icon: "♙" },
  ];

  const completedAttempts = attempts.filter((attempt) =>
    ["SUBMITTED", "COMPLETED", "GRADED"].includes(
      String(attempt.status || "").toUpperCase()
    )
  );

  const firstName = user.fullName?.trim().split(/\s+/)[0] || "Learner";

  function renderCourses(limit) {
    const list =
      typeof limit === "number"
        ? enrollments.slice(0, limit)
        : enrollments;

    if (errors.courses) {
      return (
        <AlertMessage
          message={`Unable to load your courses. ${errors.courses}`}
        />
      );
    }

    if (loading) {
      return (
        <p className="py-6 text-sm text-slate-500" role="status">
          Loading your courses...
        </p>
      );
    }

    if (list.length === 0) {
      return (
        <EmptyState
          icon="📚"
          title="No enrolled courses yet"
          description="When you enroll in a course, it will appear here."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {list.map((item) => (
          <article
            key={item.enrollmentId ?? item.courseId}
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-md sm:p-5"
          >
            <span className="inline-flex max-w-full rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              {item.category || "General"}
            </span>

            <h3 className="mt-4 break-words text-lg font-extrabold text-slate-900">
              {item.courseTitle || `Course #${item.courseId}`}
            </h3>

            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
              {item.courseDescription || "No course description available."}
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Instructor: {item.instructorName || "Nexora Team"}
            </p>

            {item.enrolledAt && (
              <p className="mt-1 text-xs text-slate-400">
                Enrolled: {String(item.enrolledAt).slice(0, 10)}
              </p>
            )}
          </article>
        ))}
      </div>
    );
  }

  function renderExams(limit) {
    const list =
      typeof limit === "number" ? exams.slice(0, limit) : exams;

    if (errors.exams) {
      return (
        <AlertMessage
          message={`Unable to load available exams. ${errors.exams}`}
        />
      );
    }

    if (loading) {
      return (
        <p className="py-6 text-sm text-slate-500" role="status">
          Loading available exams...
        </p>
      );
    }

    if (list.length === 0) {
      return (
        <EmptyState
          icon="🎯"
          title="No published exams available"
          description="Published examinations will appear here when they are available."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {list.map((exam) => (
          <article
            key={exam.id}
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-md sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                Online examination
              </span>

              <span className="text-xs font-semibold text-slate-500">
                {exam.durationMinutes
                  ? `${exam.durationMinutes} minutes`
                  : "Timed assessment"}
              </span>
            </div>

            <h3 className="mt-4 break-words text-lg font-extrabold text-slate-900">
              {exam.title || `Exam #${exam.id}`}
            </h3>

            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
              {exam.description ||
                "Test your knowledge with this examination."}
            </p>

            {exam.courseTitle && (
              <p className="mt-3 text-sm text-slate-500">
                Course: {exam.courseTitle}
              </p>
            )}

            <p className="mt-4 text-xs leading-5 text-slate-400">
              Exam ID: {exam.id}
            </p>

            <button
              type="button"
              onClick={() => handleStartExam(exam)}
              disabled={startingExamId !== null || Boolean(examSession)}
              className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {startingExamId === exam.id
                ? "Starting exam..."
                : "Start Exam →"}
            </button>
          </article>
        ))}
      </div>
    );
  }

  function renderExamResult(result) {
    const score = result.score;
    const totalMarks = result.totalMarks;
    const status = String(result.status || "UNKNOWN");

    return (
      <section className="mx-auto max-w-3xl rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
            ✓
          </span>

          <h2 className="mt-5 text-2xl font-black text-slate-950 sm:text-3xl">
            Exam submitted successfully
          </h2>

          <p className="mt-2 break-words text-sm leading-6 text-slate-500">
            {result.examTitle ||
              examSession?.exam?.title ||
              "Your examination"}
          </p>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Score
            </p>
            <p className="mt-2 break-words text-2xl font-black text-slate-950">
              {score ?? "—"}
              {totalMarks != null ? ` / ${totalMarks}` : ""}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Status
            </p>
            <p className="mt-2 break-words text-lg font-black text-slate-950">
              {status}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Attempt ID
            </p>
            <p className="mt-2 break-words text-2xl font-black text-slate-950">
              {result.id ?? examSession?.attempt?.id ?? "—"}
            </p>
          </div>
        </div>

        {result.submittedAt && (
          <p className="mt-5 text-center text-xs text-slate-500">
            Submitted: {String(result.submittedAt).replace("T", " ")}
          </p>
        )}

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              closeExamSession();
              setActiveTab("My Results");
            }}
            className="min-h-11 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            View My Results
          </button>

          <button
            type="button"
            onClick={() => {
              closeExamSession();
              setActiveTab("Available Exams");
            }}
            className="min-h-11 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Back to Available Exams
          </button>
        </div>
      </section>
    );
  }

  function renderExamSession() {
    if (!examSession) return null;

    if (submissionResult) {
      return renderExamResult(submissionResult);
    }

    const questions = examSession.questions || [];
    const answeredCount = questions.filter(
      (question) => answers[question.id]
    ).length;
    const unansweredCount = Math.max(questions.length - answeredCount, 0);

    const timerExpired = remainingSeconds === 0;

    return (
      <section className="mx-auto max-w-4xl">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              Exam in progress
            </span>

            <h2 className="mt-3 break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {examSession.exam.title || `Exam #${examSession.exam.id}`}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Select one answer for each question, then submit your examination.
            </p>
          </div>

          <div className="flex flex-wrap items-start gap-3">
            <div className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">
                Attempt ID
              </p>
              <p className="mt-1 text-lg font-black text-slate-900">
                {examSession.attempt.id}
              </p>
            </div>

            <div
              className={`shrink-0 rounded-xl border px-4 py-3 ${
                remainingSeconds !== null && remainingSeconds <= 60
                  ? "border-red-300 bg-red-50"
                  : "border-indigo-200 bg-indigo-50"
              }`}
            >
              <p className="text-xs font-semibold text-slate-600">
                Time Remaining
              </p>

              <p
                className={`mt-1 text-2xl font-black tabular-nums ${
                  remainingSeconds !== null && remainingSeconds <= 60
                    ? "text-red-700"
                    : "text-indigo-700"
                }`}
                role="timer"
                aria-live="off"
              >
                {remainingSeconds === null
                  ? "--:--"
                  : formatRemainingTime(remainingSeconds)}
              </p>
            </div>
          </div>
        </div>

        {timerExpired && (
          <div className="mb-5">
            <AlertMessage
              message={
                submittingExam
                  ? "Time is up. Your answers are being submitted automatically..."
                  : submissionError
                    ? "Time is up, but automatic submission failed. Please use Submit Exam to retry."
                    : "Time is up. Your exam is being submitted automatically..."
              }
            />
          </div>
        )}

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">Questions</p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {questionsLoading ? "…" : questions.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">Answered</p>
            <p className="mt-1 text-2xl font-black text-emerald-700">
              {answeredCount}
            </p>
          </div>

          <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-4 sm:col-span-1">
            <p className="text-xs font-semibold text-slate-500">Unanswered</p>
            <p className="mt-1 text-2xl font-black text-amber-600">
              {questionsLoading ? "…" : unansweredCount}
            </p>
          </div>
        </div>

        {questionsError && (
          <div className="mb-5">
            <AlertMessage message={questionsError} />

            <button
              type="button"
              onClick={() => loadExamQuestions(examSession.exam.id)}
              disabled={questionsLoading || timerExpired}
              className="min-h-10 rounded-xl border border-indigo-200 px-4 py-2 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-50"
            >
              {questionsLoading
                ? "Loading questions..."
                : "Retry loading questions"}
            </button>
          </div>
        )}

        {questionsLoading && questions.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
            <p className="mt-4 text-sm font-semibold text-slate-600">
              Loading examination questions...
            </p>
          </div>
        )}

        {!questionsLoading && !questionsError && questions.length === 0 && (
          <EmptyState
            icon="📝"
            title="No questions available"
            description="This published exam currently has no questions. Contact your administrator for assistance."
          />
        )}

        {questions.length > 0 && (
          <>
            <section
              aria-labelledby="question-navigation-title"
              className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h3
                    id="question-navigation-title"
                    className="text-base font-black text-slate-900"
                  >
                    Question Navigation
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Select a question number to jump to it. Mark questions you want to review before submitting.
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-emerald-500" />
                    Answered ({answeredCount})
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded border border-slate-300 bg-white" />
                    Unanswered ({unansweredCount})
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-amber-400" />
                    For review ({Object.values(markedForReview).filter(Boolean).length})
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
                {questions.map((question, index) => {
                  const isAnswered = Boolean(answers[question.id]);
                  const isMarked = Boolean(markedForReview[question.id]);
                  const isActive = String(activeQuestionId) === String(question.id);

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => navigateToQuestion(question.id)}
                      aria-label={`Go to question ${question.questionOrder ?? index + 1}${isAnswered ? ", answered" : ", unanswered"}${isMarked ? ", marked for review" : ""}`}
                      aria-current={isActive ? "location" : undefined}
                      className={`relative flex min-h-11 items-center justify-center rounded-xl border text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        isMarked
                          ? "border-amber-400 bg-amber-100 text-amber-900"
                          : isAnswered
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:bg-indigo-50"
                      } ${isActive ? "ring-2 ring-indigo-500 ring-offset-2" : ""}`}
                    >
                      {question.questionOrder ?? index + 1}
                      {isMarked && (
                        <span
                          aria-hidden="true"
                          className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-white bg-amber-500"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="space-y-5">
              {questions.map((question, index) => {
              const options = [
                ["A", question.optionA],
                ["B", question.optionB],
                ["C", question.optionC],
                ["D", question.optionD],
              ].filter(
                ([, value]) => value != null && String(value).trim() !== ""
              );

              return (
                <article
                  key={question.id}
                  id={`exam-question-${question.id}`}
                  className={`min-w-0 scroll-mt-5 rounded-2xl border bg-white p-4 shadow-sm transition sm:p-6 ${
                    activeQuestionId != null && String(activeQuestionId) === String(question.id)
                      ? "border-indigo-400 ring-2 ring-indigo-100"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                        Question {question.questionOrder ?? index + 1}
                      </p>
                      {markedForReview[question.id] && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-amber-800">
                          Marked for review
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {question.marks != null && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          {question.marks}{" "}
                          {question.marks === 1 ? "mark" : "marks"}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleQuestionReview(question.id)}
                        disabled={submittingExam || timerExpired}
                        aria-pressed={Boolean(markedForReview[question.id])}
                        className={`min-h-9 rounded-lg border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          markedForReview[question.id]
                            ? "border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200"
                            : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                        }`}
                      >
                        {markedForReview[question.id] ? "✓ Marked for Review" : "Mark for Review"}
                      </button>
                    </div>
                  </div>

                  <h3 className="mt-3 break-words text-base font-bold leading-7 text-slate-900 sm:text-lg">
                    {question.questionText}
                  </h3>

                  <fieldset className="mt-5 space-y-3">
                    <legend className="sr-only">
                      Select an answer for question {index + 1}
                    </legend>

                    {options.map(([letter, value]) => {
                      const selected = answers[question.id] === letter;

                      return (
                        <label
                          key={letter}
                          className={`flex min-w-0 items-start gap-3 rounded-xl border p-3 transition sm:p-4 ${
                            timerExpired
                              ? "cursor-not-allowed opacity-70"
                              : "cursor-pointer"
                          } ${
                            selected
                              ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/10"
                              : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                          } ${
                            submissionResult || submittingExam
                              ? "cursor-not-allowed opacity-80"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={letter}
                            checked={selected}
                            onChange={() =>
                              handleAnswerChange(question.id, letter)
                            }
                            disabled={
                              Boolean(submissionResult) ||
                              submittingExam ||
                              timerExpired
                            }
                            className="mt-1 h-4 w-4 shrink-0 accent-indigo-600"
                          />

                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                              selected
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {letter}
                          </span>

                          <span className="min-w-0 break-words text-sm leading-6 text-slate-700">
                            {value}
                          </span>
                        </label>
                      );
                    })}
                  </fieldset>
                </article>
              );
              })}
            </div>
          </>
        )}

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
          <p className="text-sm font-bold text-amber-900">
            Before you submit
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-800">
            You have answered {answeredCount} of {questions.length} questions.
            {unansweredCount > 0
              ? ` ${unansweredCount} question(s) remain unanswered.`
              : " All questions have an answer selected."}
          </p>

          {submissionError && (
            <div className="mt-4">
              <AlertMessage message={submissionError} />
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSubmitExam}
              disabled={
                submittingExam ||
                questionsLoading ||
                questions.length === 0 ||
                Boolean(questionsError)
              }
              className="min-h-11 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submittingExam
                ? "Submitting exam..."
                : timerExpired
                  ? "Retry Submission"
                  : "Submit Exam"}
            </button>

            <button
              type="button"
              onClick={() => {
                if (
                  !window.confirm(
                    "Your exam is still in progress. Your saved answers will remain in this browser. Leave the exam screen?"
                  )
                ) {
                  return;
                }

                setExamSession(null);
                setQuestionsError("");
                setSubmissionError("");
                setShowSubmitConfirmation(false);
                setActiveTab("Available Exams");
              }}
              disabled={submittingExam}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Back to Dashboard
            </button>
          </div>

          {!timerExpired && (
            <button
              type="button"
              onClick={() => setShowSubmitConfirmation(true)}
              disabled={
                submittingExam ||
                questionsLoading ||
                questions.length === 0 ||
                Boolean(questionsError)
              }
              className="mt-3 min-h-11 rounded-xl border border-indigo-200 bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Review Before Submit
            </button>
          )}
        </div>

        {showSubmitConfirmation && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
            role="presentation"
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="submit-exam-title"
              className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
            >
              <h3
                id="submit-exam-title"
                className="text-xl font-black text-slate-950"
              >
                Submit this examination?
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                You have answered {answeredCount} of {questions.length}{" "}
                questions.
                {unansweredCount > 0
                  ? " Unanswered questions will be submitted without a selected answer."
                  : " You have selected an answer for every question."}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Once the server accepts your submission, you may not be able to
                change your answers.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirmation(false)}
                  className="min-h-11 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Continue Exam
                </button>

                <button
                  type="button"
                  onClick={handleSubmitExam}
                  disabled={submittingExam}
                  className="min-h-11 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submittingExam ? "Submitting..." : "Confirm Submit"}
                </button>
              </div>
            </section>
          </div>
        )}
      </section>
    );
  }

  function renderResults(limit) {
    const list =
      typeof limit === "number" ? attempts.slice(0, limit) : attempts;

    if (errors.results) {
      return (
        <AlertMessage
          message={`Unable to load your results. ${errors.results}`}
        />
      );
    }

    if (loading) {
      return (
        <p className="py-6 text-sm text-slate-500" role="status">
          Loading your results...
        </p>
      );
    }

    if (list.length === 0) {
      return (
        <EmptyState
          icon="📊"
          title="No exam attempts yet"
          description="Your exam attempts and results will appear here after you take an examination."
        />
      );
    }

    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-bold">Exam</th>
              <th className="px-4 py-3 font-bold">Score</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Date</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {list.map((attempt, index) => {
              const status = String(attempt.status || "UNKNOWN");
              const score =
                attempt.score ??
                attempt.marksObtained ??
                attempt.totalScore;

              const date =
                attempt.submittedAt ||
                attempt.startedAt ||
                attempt.createdAt;

              return (
                <tr
                  key={attempt.id ?? attempt.attemptId ?? index}
                  className="bg-white"
                >
                  <td className="max-w-[220px] px-4 py-4 font-semibold text-slate-800">
                    <span className="break-words">
                      {attempt.examTitle ||
                        attempt.title ||
                        (attempt.examId
                          ? `Exam #${attempt.examId}`
                          : `Attempt #${attempt.id ?? index + 1}`)}
                    </span>
                  </td>

                  <td className="px-4 py-4 font-bold text-slate-800">
                    {attempt.score != null && attempt.totalMarks != null
                      ? `${attempt.score} / ${attempt.totalMarks}`
                      : score ?? "—"}
                  </td>

                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {status}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-slate-500">
                    {date ? String(date).slice(0, 10) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function renderAnalytics() {
    if (errors.analytics) {
      return (
        <AlertMessage
          message={`Unable to load exam analytics. ${errors.analytics}`}
        />
      );
    }

    if (loading) {
      return (
        <p className="py-4 text-sm text-slate-500" role="status">
          Loading exam analytics...
        </p>
      );
    }

    if (!analytics) {
      return (
        <EmptyState
          icon="📊"
          title="Analytics unavailable"
          description="Your exam analytics could not be loaded. Use Refresh to try again."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon="📝"
          label="Total Attempts"
          value={analytics.totalAttempts ?? 0}
          description="All your exam attempts"
        />

        <StatCard
          icon="✅"
          label="Submitted Exams"
          value={analytics.submittedAttempts ?? 0}
          description="Exams submitted successfully"
        />

        <StatCard
          icon="⏳"
          label="In Progress"
          value={analytics.inProgressAttempts ?? 0}
          description="Exams awaiting submission"
        />

        <StatCard
          icon="📈"
          label="Average Score"
          value={`${Number(analytics.averagePercentage ?? 0).toFixed(2)}%`}
          description="Average across submitted exams"
        />

        <StatCard
          icon="🏆"
          label="Best Score"
          value={`${Number(analytics.bestPercentage ?? 0).toFixed(2)}%`}
          description="Your highest exam percentage"
        />
      </div>
    );
  }

  function renderOverview() {
    return (
      <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            icon="📚"
            label="Enrolled courses"
            value={loading ? "—" : errors.courses ? "—" : enrollments.length}
            description="Courses in your learning journey"
          />

          <StatCard
            icon="🎯"
            label="Available exams"
            value={loading ? "—" : errors.exams ? "—" : exams.length}
            description="Published examinations"
          />

          <StatCard
            icon="🏆"
            label="Completed attempts"
            value={
              loading ? "—" : errors.results ? "—" : completedAttempts.length
            }
            description="Exam attempts marked as completed"
          />
        </div>

        <section className="mt-7 min-w-0">
          <div className="mb-4">
            <h2 className="text-xl font-black text-slate-900">
              Exam Analytics
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Track your examination performance and progress
            </p>
          </div>

          {renderAnalytics()}
        </section>

        <section className="mt-7 min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Continue learning
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your enrolled courses
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("My Courses")}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              View all →
            </button>
          </div>

          {renderCourses(2)}
        </section>

        <section className="mt-8 min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Available examinations
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Published exams ready for students
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("Available Exams")}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              View all →
            </button>
          </div>

          {renderExams(2)}
        </section>

        <section className="mt-8 min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Recent exam activity
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your latest attempts and results
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("My Results")}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              View all →
            </button>
          </div>

          {renderResults(3)}
        </section>
      </>
    );
  }

  function renderProfile() {
    return (
      <section className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-black text-white">
            {(user.fullName || user.email || "N").charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <h2 className="break-words text-xl font-black text-slate-900">
              {user.fullName || "Nexora Student"}
            </h2>
            <p className="mt-1 break-words text-sm text-slate-500">
              {user.email || "No email available"}
            </p>
            <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              {user.role || "STUDENT"}
            </span>
          </div>
        </div>

        <div className="my-6 h-px bg-slate-100" />

        <dl className="space-y-4">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Full name
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold text-slate-800">
              {user.fullName || "Not available"}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Email address
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold text-slate-800">
              {user.email || "Not available"}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Account role
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-800">
              {user.role || "STUDENT"}
            </dd>
          </div>
        </dl>

        <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          This profile displays the account information saved at sign-in.
          Editing profile details requires a backend update endpoint.
        </p>
      </section>
    );
  }

  const pageContent = {
    Overview: renderOverview,
    "My Courses": () => renderCourses(),
    "Available Exams": () => renderExams(),
    "My Results": () => renderResults(),
    Profile: renderProfile,
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col lg:min-h-screen lg:flex-row">
        <aside className="shrink-0 bg-slate-950 text-white lg:min-h-screen lg:w-64">
          <div className="flex items-center justify-between gap-3 px-5 py-5 lg:block lg:px-6 lg:py-7">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xl font-black tracking-tight"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg">
                N
              </span>
              <span>
                Nexora<span className="text-indigo-400">.</span>
              </span>
            </Link>

            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold tracking-wide text-indigo-200 lg:mt-5 lg:inline-flex">
              STUDENT PORTAL
            </span>
          </div>

          <nav
            aria-label="Student dashboard navigation"
            className="flex gap-2 overflow-x-auto px-3 pb-4 lg:mt-5 lg:flex-col lg:overflow-visible lg:px-3"
          >
            {tabs.map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => {
                  if (examSession && !submissionResult) {
                    const leave = window.confirm(
                      "Your exam attempt is still in progress. Leave the exam screen? Your answers will be saved in this browser."
                    );

                    if (!leave) return;

                    setExamSession(null);
                    setQuestionsError("");
                    setSubmissionError("");
                    setShowSubmitConfirmation(false);
                  }

                  setActiveTab(tab.label);
                }}
                aria-current={activeTab === tab.label ? "page" : undefined}
                className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition lg:w-full ${
                  activeTab === tab.label
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/20"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="w-5 text-center text-lg" aria-hidden="true">
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="hidden border-t border-white/10 px-5 py-5 lg:mt-8 lg:block">
            <p className="break-words text-sm font-bold text-white">
              {user.fullName || "Student"}
            </p>
            <p className="mt-1 break-words text-xs leading-5 text-slate-400">
              {user.email || ""}
            </p>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-5 min-h-11 w-full rounded-xl border border-white/15 px-4 py-2.5 text-left text-sm font-bold text-slate-200 transition hover:bg-white/10"
            >
              ↪ Sign out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-white px-4 py-5 sm:flex-row sm:items-center sm:px-7 sm:py-6 lg:px-9">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                Student workspace
              </p>
              <h1 className="mt-2 break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                {examSession && activeTab === "Available Exams"
                  ? submissionResult
                    ? "Exam Result"
                    : "Take Examination"
                  : activeTab === "Overview"
                    ? `Welcome back, ${firstName}!`
                    : activeTab}
              </h1>
              <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                {examSession && activeTab === "Available Exams"
                  ? submissionResult
                    ? "Your submission has been processed."
                    : "Answer the questions and submit your examination when ready."
                  : activeTab === "Overview"
                    ? "Your learning progress, courses, and examinations in one place."
                    : `Manage your ${activeTab.toLowerCase()} from your Nexora workspace.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (examSession && !submissionResult) {
                    const leave = window.confirm(
                      "Your exam attempt is still in progress. Refreshing dashboard data will not submit your answers. Continue?"
                    );

                    if (!leave) return;
                  }

                  refreshDashboard();
                }}
                disabled={loading}
                className="min-h-10 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "↻ Refresh"}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="min-h-10 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 lg:hidden"
              >
                Sign out
              </button>
            </div>
          </header>

          <div className="min-w-0 p-4 sm:p-6 lg:p-9">
            {Object.keys(errors).length > 0 && (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                Some dashboard information could not be loaded. Check the
                relevant section below or use Refresh to try again.
              </div>
            )}

            {examActionError && !examSession && (
              <div className="mb-5">
                <AlertMessage message={examActionError} />
              </div>
            )}

            {examSession && activeTab === "Available Exams" ? (
              renderExamSession()
            ) : (
              pageContent[activeTab]()
            )}

            <footer className="mt-10 border-t border-slate-200 py-5 text-xs leading-5 text-slate-400">
              © {new Date().getFullYear()} Nexora · Learning and online examinations
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}

export default StudentDashboard;
