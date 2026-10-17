
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchCourses() {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("nexoraToken");

        const response = await axios.get(`${API_BASE_URL}/courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (isMounted) {
          setCourses(Array.isArray(response.data) ? response.data : []);
        }
      } catch (requestError) {
        if (isMounted) {
          if (requestError.response?.status === 401) {
            setError("Your session may have expired. Please sign in again.");
          } else if (requestError.response?.status === 403) {
            setError("You do not have permission to view these courses.");
          } else if (!requestError.response) {
            setError(
              "Cannot connect to the server. Please make sure the backend is running."
            );
          } else {
            setError("Unable to load courses. Please try again.");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="mt-5 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-7 sm:p-5 lg:p-6">
      <div className="flex min-w-0 flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-indigo-600 sm:text-sm">
            YOUR LEARNING
          </p>

          <h2 className="mt-1 break-words text-lg font-extrabold leading-7 text-slate-900 sm:text-xl">
            Available courses
          </h2>
        </div>

        {!loading && !error && (
          <span className="shrink-0 text-sm text-slate-500">
            {courses.length} {courses.length === 1 ? "course" : "courses"}
          </span>
        )}
      </div>

      {loading && (
        <p className="mt-5 text-sm text-slate-500" role="status">
          Loading courses...
        </p>
      )}

      {!loading && error && (
        <div
          className="mt-5 break-words rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700 sm:p-4"
          role="alert"
        >
          {error}
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 sm:p-5">
          No published courses are available yet.
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
          {courses.map((course) => (
            <article
              key={course.id}
              className="min-w-0 rounded-xl border border-slate-200 p-4 transition-colors duration-200 hover:border-indigo-200 hover:shadow-md sm:p-5"
            >
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                <span className="max-w-full break-words rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                  {course.category || "General"}
                </span>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                    course.published
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {course.published ? "Published" : "Draft"}
                </span>
              </div>

              <h3 className="mt-4 break-words text-base font-extrabold leading-7 text-slate-900 sm:text-lg">
                {course.title}
              </h3>

              <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                {course.description || "Course description coming soon."}
              </p>

              <p className="mt-4 break-words text-sm leading-6 text-slate-500">
                Instructor: {course.instructorName || "Nexora Team"}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default CourseList;
