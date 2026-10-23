
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const EMPTY_FORM = {
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: "A",
  marks: "1",
  questionOrder: "1",
};

function getErrorMessage(error) {
  if (error.response?.status === 401) {
    return "Your session may have expired. Please sign in again.";
  }

  if (error.response?.status === 403) {
    return "Only administrators can manage exam questions.";
  }

  if (!error.response) {
    return "Cannot connect to the server. Please make sure the backend is running.";
  }

  return (
    error.response?.data?.detail ||
    error.response?.data?.message ||
    error.response?.data?.title ||
    "Something went wrong. Please try again."
  );
}

function getConfig() {
  return {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("nexoraToken")}`,
    },
  };
}

function AdminQuestionManagement() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchExams = useCallback(async () => {
    setLoadingExams(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/exams`,
        getConfig()
      );

      const examList = Array.isArray(response.data) ? response.data : [];

      setExams(examList);

      setSelectedExamId((currentId) => {
        if (
          currentId &&
          examList.some((exam) => String(exam.id) === currentId)
        ) {
          return currentId;
        }

        return examList.length ? String(examList[0].id) : "";
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoadingExams(false);
    }
  }, []);

  const fetchQuestions = useCallback(async (examId = selectedExamId) => {
    if (!examId) {
      setQuestions([]);
      setLoadingQuestions(false);
      return;
    }

    setLoadingQuestions(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/exams/${examId}/questions`,
        getConfig()
      );

      setQuestions(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setQuestions([]);
      setError(getErrorMessage(requestError));
    } finally {
      setLoadingQuestions(false);
    }
  }, [selectedExamId]);

  // Load exams when the component mounts.
  useEffect(() => {
    let active = true;

    async function loadExams() {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/exams`,
          getConfig()
        );

        if (!active) return;

        const examList = Array.isArray(response.data) ? response.data : [];

        setExams(examList);

        setSelectedExamId((currentId) => {
          if (
            currentId &&
            examList.some((exam) => String(exam.id) === currentId)
          ) {
            return currentId;
          }

          return examList.length ? String(examList[0].id) : "";
        });

        setError("");
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (active) {
          setLoadingExams(false);
        }
      }
    }

    void loadExams();

    return () => {
      active = false;
    };
  }, []);

  // Load questions whenever a valid exam is selected.
  useEffect(() => {
    if (!selectedExamId) {
      return;
    }

    let active = true;

    async function loadQuestions() {
      setLoadingQuestions(true);
      setError("");

      try {
        const response = await axios.get(
          `${API_BASE_URL}/exams/${selectedExamId}/questions`,
          getConfig()
        );

        if (active) {
          setQuestions(
            Array.isArray(response.data) ? response.data : []
          );
        }
      } catch (requestError) {
        if (active) {
          setQuestions([]);
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (active) {
          setLoadingQuestions(false);
        }
      }
    }

    void loadQuestions();

    return () => {
      active = false;
    };
  }, [selectedExamId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function handleEdit(question) {
    setForm({
      questionText: question.questionText || "",
      optionA: question.optionA || "",
      optionB: question.optionB || "",
      optionC: question.optionC || "",
      optionD: question.optionD || "",
      correctOption: question.correctOption || "A",
      marks: String(question.marks ?? 1),
      questionOrder: String(question.questionOrder ?? 1),
    });

    setEditingId(question.id);
    setError("");
    setSuccess("");

    document
      .getElementById("admin-question-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedExamId) {
      setError("Please select an exam first.");
      return;
    }

    const marks = Number(form.marks);
    const questionOrder = Number(form.questionOrder);

    if (!Number.isInteger(marks) || marks < 1 || marks > 100) {
      setError("Marks must be a whole number between 1 and 100.");
      return;
    }

    if (!Number.isInteger(questionOrder) || questionOrder < 1) {
      setError("Question order must be a positive whole number.");
      return;
    }

    const payload = {
      questionText: form.questionText.trim(),
      optionA: form.optionA.trim(),
      optionB: form.optionB.trim(),
      optionC: form.optionC.trim(),
      optionD: form.optionD.trim(),
      correctOption: form.correctOption,
      marks,
      questionOrder,
    };

    if (
      !payload.questionText ||
      !payload.optionA ||
      !payload.optionB ||
      !payload.optionC ||
      !payload.optionD
    ) {
      setError("Please fill in the question and all four options.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const url = `${API_BASE_URL}/exams/${selectedExamId}/questions`;
      const config = getConfig();

      if (editingId !== null) {
        await axios.put(`${url}/${editingId}`, payload, config);
        setSuccess("Question updated successfully.");
      } else {
        await axios.post(url, payload, config);
        setSuccess("Question added successfully.");
      }

      resetForm();
      await fetchQuestions(selectedExamId);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(question) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete Question ${question.questionOrder}?`
    );

    if (!confirmed) return;

    setDeletingId(question.id);
    setError("");
    setSuccess("");

    try {
      await axios.delete(
        `${API_BASE_URL}/exams/${selectedExamId}/questions/${question.id}`,
        getConfig()
      );

      if (editingId === question.id) {
        resetForm();
      }

      setSuccess("Question deleted successfully.");
      await fetchQuestions(selectedExamId);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId(null);
    }
  }

  function handleExamChange(event) {
    const examId = event.target.value;

    setSelectedExamId(examId);
    setQuestions([]);
    setLoadingQuestions(Boolean(examId));
    resetForm();
    setError("");
    setSuccess("");
  }

  const selectedExam = exams.find(
    (exam) => String(exam.id) === selectedExamId
  );

  const totalMarks = questions.reduce(
    (total, question) => total + Number(question.marks || 0),
    0
  );

  const inputClass =
    "w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <section className="mt-6 min-w-0 space-y-5 sm:mt-8 sm:space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 sm:text-sm">
              Administration
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
              Question Management
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Create, edit and manage multiple-choice questions for your exams.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchExams}
            disabled={loadingExams}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 sm:w-auto"
          >
            {loadingExams ? "Refreshing..." : "Refresh exams"}
          </button>
        </div>

        <div className="mt-6">
          <label
            htmlFor="question-exam"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Select exam
          </label>

          <select
            id="question-exam"
            value={selectedExamId}
            onChange={handleExamChange}
            disabled={loadingExams || exams.length === 0}
            className={inputClass}
          >
            {exams.length === 0 && (
              <option value="">No exams available</option>
            )}

            {exams.map((exam) => (
              <option key={exam.id} value={String(exam.id)}>
                {exam.title} (ID: {exam.id})
              </option>
            ))}
          </select>

          {selectedExam && (
            <p className="mt-2 text-sm text-slate-500">
              Selected exam:{" "}
              <span className="font-semibold text-slate-700">
                {selectedExam.title}
              </span>
            </p>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Total questions</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {questions.length}
            </p>
          </div>

          <div className="rounded-xl bg-indigo-50 p-4">
            <p className="text-sm text-indigo-700">Total marks</p>
            <p className="mt-2 text-2xl font-extrabold text-indigo-800">
              {totalMarks}
            </p>
          </div>

          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">Exam duration</p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-800">
              {selectedExam?.durationMinutes ?? "—"}
              <span className="ml-1 text-sm font-semibold">min</span>
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="break-words rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700"
        >
          {success}
        </div>
      )}

      <div
        id="admin-question-form"
        className="scroll-mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7"
      >
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 sm:text-xl">
              {editingId !== null ? "Edit question" : "Add a question"}
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              All fields are required. Select the correct answer before saving.
            </p>
          </div>

          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 sm:w-auto"
            >
              Cancel edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <fieldset
            disabled={!selectedExamId || saving}
            className="space-y-5 disabled:opacity-70"
          >
            <div>
              <label
                htmlFor="question-text"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Question *
              </label>

              <textarea
                id="question-text"
                name="questionText"
                value={form.questionText}
                onChange={handleChange}
                required
                maxLength={2000}
                rows={3}
                placeholder="Enter the question..."
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {["A", "B", "C", "D"].map((option) => (
                <div key={option}>
                  <label
                    htmlFor={`question-option-${option}`}
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Option {option} *
                  </label>

                  <input
                    id={`question-option-${option}`}
                    name={`option${option}`}
                    type="text"
                    value={form[`option${option}`]}
                    onChange={handleChange}
                    required
                    maxLength={500}
                    placeholder={`Enter option ${option}`}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="correct-option"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Correct answer *
                </label>

                <select
                  id="correct-option"
                  name="correctOption"
                  value={form.correctOption}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  {["A", "B", "C", "D"].map((option) => (
                    <option key={option} value={option}>
                      Option {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="question-marks"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Marks *
                </label>

                <input
                  id="question-marks"
                  name="marks"
                  type="number"
                  value={form.marks}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  step="1"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="question-order"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Question order *
                </label>

                <input
                  id="question-order"
                  name="questionOrder"
                  type="number"
                  value={form.questionOrder}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedExamId || saving}
              className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Save changes"
                  : "Add question"}
            </button>
          </fieldset>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 sm:text-xl">
              Exam questions
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Questions are displayed in question-order sequence.
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">
            {questions.length}
          </span>
        </div>

        {loadingExams && (
          <p role="status" className="mt-5 text-sm text-slate-500">
            Loading exams...
          </p>
        )}

        {!loadingExams && exams.length === 0 && (
          <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            No exams are available. Create an exam first, then return here to
            add its questions.
          </div>
        )}

        {loadingQuestions && (
          <p role="status" className="mt-5 text-sm text-slate-500">
            Loading questions...
          </p>
        )}

        {!loadingQuestions &&
          !loadingExams &&
          selectedExamId &&
          questions.length === 0 && (
            <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center">
              <p className="font-semibold text-slate-800">
                No questions found
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use the form above to add the first question for this exam.
              </p>
            </div>
          )}

        {!loadingQuestions && questions.length > 0 && (
          <div className="mt-5 space-y-4">
            {questions.map((question) => (
              <article
                key={question.id}
                className="min-w-0 rounded-xl border border-slate-200 p-4 sm:p-5"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      Question {question.questionOrder}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {question.marks}{" "}
                      {Number(question.marks) === 1 ? "mark" : "marks"}
                    </span>

                    <span className="break-all text-xs text-slate-400">
                      ID: {question.id}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(question)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(question)}
                      disabled={deletingId === question.id}
                      className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === question.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                <h4 className="mt-4 whitespace-pre-line break-words text-base font-bold leading-7 text-slate-900">
                  {question.questionText}
                </h4>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {["A", "B", "C", "D"].map((option) => {
                    const isCorrect = question.correctOption === option;

                    return (
                      <div
                        key={option}
                        className={`min-w-0 rounded-lg border p-3 text-sm leading-6 ${
                          isCorrect
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className="font-bold">{option}.</span>{" "}
                        <span className="break-words">
                          {question[`option${option}`]}
                        </span>

                        {isCorrect && (
                          <span className="ml-2 text-xs font-bold">
                            Correct answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminQuestionManagement;
