
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Atom,
  BookOpen,
  BookX,
  BrainCircuit,
  ChartNoAxesCombined,
  CheckCircle2,
  Cloud,
  Code,
  Code2,
  Coffee,
  Database,
  FileCode2,
  GraduationCap,
  Layers,
  Leaf,
  Lightbulb,
  Monitor,
  Palette,
  Search,
  SearchX,
  Server,
  ShieldCheck,
  Smartphone,
  UserRound,
  Workflow,
  X,
} from "lucide-react";
import { API_BASE_URL } from "../utils/api";

function CourseList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedCategory = searchParams.get("category")?.trim() || "";
  const selectedCategory = requestedCategory || "All";

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        courses
          .map((course) => course.category?.trim())
          .filter(Boolean)
      ),
    ];

    if (
      requestedCategory &&
      !uniqueCategories.some(
        (category) =>
          category.toLowerCase() === requestedCategory.toLowerCase()
      )
    ) {
      uniqueCategories.push(requestedCategory);
    }

    return ["All", ...uniqueCategories.sort()];
  }, [courses, requestedCategory]);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const normalizedCategory = selectedCategory.trim().toLowerCase();

    return courses.filter((course) => {
      const courseCategory = (course.category || "General")
        .trim()
        .toLowerCase();

      const matchesCategory =
        selectedCategory === "All" ||
        courseCategory === normalizedCategory;

      const matchesSearch =
        !normalizedSearch ||
        [
          course.title,
          course.description,
          course.category,
          course.instructorName,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedSearch)
          );

      return matchesCategory && matchesSearch;
    });
  }, [courses, searchTerm, selectedCategory]);

  const handleCategoryChange = (category) => {
    if (category === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSearchParams({});
  };

  // Select a professional icon based on course title and category.
  const getCourseStyle = (course, index) => {
    const title = (course.title || "").toLowerCase();
    const category = (course.category || "").toLowerCase();
    const keywords = `${title} ${category}`;

    const styles = [
      {
        gradient: "from-indigo-600 via-indigo-500 to-violet-500",
        icon: BookOpen,
      },
      {
        gradient: "from-sky-600 via-blue-500 to-indigo-500",
        icon: Code2,
      },
      {
        gradient: "from-violet-600 via-purple-500 to-fuchsia-500",
        icon: GraduationCap,
      },
      {
        gradient: "from-emerald-600 via-teal-500 to-cyan-500",
        icon: Layers,
      },
    ];

    const matches = (pattern) => pattern.test(keywords);

    // Java
    if (
      matches(/\bjava\b/) &&
      !matches(/\bjavascript\b/)
    ) {
      return {
        gradient: "from-orange-600 via-amber-500 to-yellow-500",
        icon: Coffee,
      };
    }

    // JavaScript
    if (matches(/\bjavascript\b|\bjs\b/)) {
      return {
        gradient: "from-yellow-500 via-amber-400 to-orange-500",
        icon: FileCode2,
      };
    }

    // React
    if (matches(/\breact\b/)) {
      return {
        gradient: "from-cyan-600 via-sky-500 to-blue-500",
        icon: Atom,
      };
    }

    // Python
    if (matches(/\bpython\b/)) {
      return {
        gradient: "from-blue-600 via-sky-500 to-amber-400",
        icon: Code,
      };
    }

    // HTML and CSS
    if (matches(/\bhtml\b|\bcss\b|tailwind|bootstrap/)) {
      return {
        gradient: "from-pink-600 via-rose-500 to-orange-500",
        icon: Palette,
      };
    }

    // Spring Boot
    if (matches(/spring\s*boot|\bspring\b/)) {
      return {
        gradient: "from-green-700 via-emerald-600 to-lime-500",
        icon: Leaf,
      };
    }

    // Node.js and backend development
    if (
      matches(/node\.?js|express|backend|server-side/)
    ) {
      return {
        gradient: "from-green-700 via-emerald-600 to-teal-500",
        icon: Server,
      };
    }

    // Database technologies
    if (
      matches(/database|\bsql\b|mysql|oracle|mongodb|postgres|postgresql/)
    ) {
      return {
        gradient: "from-amber-500 via-orange-500 to-rose-500",
        icon: Database,
      };
    }

    // Artificial Intelligence and Machine Learning
    if (
      matches(/\bai\b|artificial intelligence|machine learning|\bml\b|deep learning/)
    ) {
      return {
        gradient: "from-violet-700 via-purple-600 to-fuchsia-500",
        icon: BrainCircuit,
      };
    }

    // Data Science and Analytics
    if (
      matches(/data science|data analytics|data analysis|big data|analytics/)
    ) {
      return {
        gradient: "from-teal-700 via-emerald-500 to-cyan-500",
        icon: ChartNoAxesCombined,
      };
    }

    // Cloud and AWS
    if (
      matches(/cloud computing|\baws\b|azure|\bgcp\b|cloud technology/)
    ) {
      return {
        gradient: "from-sky-700 via-blue-500 to-cyan-400",
        icon: Cloud,
      };
    }

    // Cyber Security
    if (
      matches(/cyber security|cybersecurity|ethical hacking|network security/)
    ) {
      return {
        gradient: "from-slate-800 via-slate-700 to-indigo-600",
        icon: ShieldCheck,
      };
    }

    // Mobile development
    if (
      matches(/android|flutter|mobile app|mobile development|ios/)
    ) {
      return {
        gradient: "from-rose-600 via-pink-500 to-fuchsia-500",
        icon: Smartphone,
      };
    }

    // Web development
    if (
      matches(/web development|frontend|front-end|website|web design/)
    ) {
      return {
        gradient: "from-sky-600 via-blue-500 to-indigo-500",
        icon: Monitor,
      };
    }

    // Programming and software engineering
    if (
      matches(/programming|software engineering|software development|coding/)
    ) {
      return {
        gradient: "from-violet-600 via-purple-500 to-fuchsia-500",
        icon: Workflow,
      };
    }

    // General category fallback
    return styles[index % styles.length];
  };

  const getCategoryIcon = (category) => {
    const normalizedCategory = (category || "").toLowerCase();

    if (
      normalizedCategory.includes("database") ||
      normalizedCategory.includes("sql")
    ) {
      return Database;
    }

    if (
      normalizedCategory.includes("mobile") ||
      normalizedCategory.includes("android") ||
      normalizedCategory.includes("flutter")
    ) {
      return Smartphone;
    }

    if (
      normalizedCategory.includes("data") ||
      normalizedCategory.includes("technology")
    ) {
      return ChartNoAxesCombined;
    }

    if (
      normalizedCategory.includes("programming") ||
      normalizedCategory.includes("software")
    ) {
      return Workflow;
    }

    if (
      normalizedCategory.includes("web") ||
      normalizedCategory.includes("frontend") ||
      normalizedCategory.includes("backend")
    ) {
      return Code2;
    }

    if (
      normalizedCategory.includes("artificial intelligence") ||
      normalizedCategory.includes("machine learning")
    ) {
      return BrainCircuit;
    }

    if (normalizedCategory.includes("cloud")) {
      return Cloud;
    }

    if (
      normalizedCategory.includes("security") ||
      normalizedCategory.includes("cyber")
    ) {
      return ShieldCheck;
    }

    return BookOpen;
  };

  return (
    <section className="min-w-0 space-y-7 sm:space-y-9">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 px-5 py-7 shadow-xl shadow-indigo-950/10 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
        <div className="absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 -z-10 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative z-10">
          <Link
            to="/"
            className="mb-7 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition duration-200 hover:-translate-x-1 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            <ArrowLeft size={17} strokeWidth={2.2} />
            Back to Home
          </Link>

          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-indigo-100 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              YOUR LEARNING JOURNEY STARTS HERE
            </span>

            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Explore courses.
              <span className="block text-indigo-300">
                Expand your skills.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-indigo-100/80 sm:text-base">
              Discover learning opportunities, build practical knowledge,
              and take the next step towards achieving your goals with Nexora.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-indigo-200">
                  <BookOpen size={21} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white">
                    {loading ? "—" : courses.length}
                  </p>
                  <p className="text-xs font-medium text-indigo-200">
                    Available courses
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-indigo-200">
                  <Layers size={21} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white">
                    {loading ? "—" : categories.length - 1}
                  </p>
                  <p className="text-xs font-medium text-indigo-200">
                    Learning categories
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-7 right-10 hidden h-36 w-36 items-center justify-center rounded-3xl border border-white/15 bg-white/5 text-indigo-100 shadow-2xl backdrop-blur-sm lg:flex">
          <GraduationCap size={76} strokeWidth={1.2} />
        </div>
      </div>

      {/* Course Section Heading */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            Discover & Learn
          </p>

          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {selectedCategory === "All"
              ? "Explore available courses"
              : selectedCategory}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {selectedCategory === "All"
              ? "Find a course that matches your interests and learning goals."
              : `Explore courses available in ${selectedCategory}.`}
          </p>
        </div>

        {!loading && !error && (
          <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm">
            <CheckCircle2 size={16} className="text-emerald-500" />
            {filteredCourses.length} of {courses.length} courses
          </span>
        )}
      </div>

      {/* Search and Filters */}
      {!loading && !error && courses.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search courses, topics or instructors..."
                aria-label="Search courses"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              disabled={!searchTerm && selectedCategory === "All"}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={16} />
              Reset filters
            </button>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Browse by category
            </p>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const CategoryIcon =
                  category === "All" ? Layers : getCategoryIcon(category);

                const isActive =
                  category.toLowerCase() === selectedCategory.toLowerCase();

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryChange(category)}
                    aria-pressed={isActive}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition duration-200 sm:text-sm ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                    }`}
                  >
                    <CategoryIcon size={15} />
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div
          className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
          role="status"
          aria-label="Loading courses"
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="h-40 animate-pulse bg-slate-100" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
                <div className="h-6 w-3/4 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}

          <span className="sr-only">Loading courses...</span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 p-6 sm:p-8"
          role="alert"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <X size={22} />
            </div>

            <div>
              <h3 className="font-bold text-red-900">
                Unable to load courses
              </h3>
              <p className="mt-1 text-sm leading-6 text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && courses.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <BookX size={32} strokeWidth={1.7} />
          </div>

          <h3 className="mt-5 text-xl font-extrabold text-slate-900">
            No courses available yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            New learning opportunities will appear here once courses are
            published. Please check back soon.
          </p>
        </div>
      )}

      {/* No Filter Results */}
      {!loading &&
        !error &&
        courses.length > 0 &&
        filteredCourses.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <SearchX size={29} strokeWidth={1.7} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No matching courses found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {selectedCategory !== "All"
                ? `No courses are currently available in ${selectedCategory}. Try another category or browse all courses.`
                : "Try another search term or choose a different category."}
            </p>

            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              <X size={16} />
              Clear filters
            </button>
          </div>
        )}

      {/* Course Cards */}
      {!loading && !error && filteredCourses.length > 0 && (
        <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course, index) => {
            const style = getCourseStyle(course, index);
            const CourseIcon = style.icon;

            return (
              <article
                key={course.id}
                className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/5"
              >
                {/* Course Visual */}
                <div
                  className={`relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br ${style.gradient}`}
                >
                  <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full border border-white/15" />
                  <div className="absolute -bottom-16 -left-8 h-40 w-40 rounded-full border border-white/15" />

                  <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/25 bg-white/15 text-white shadow-xl backdrop-blur-sm transition duration-300 group-hover:scale-110">
                    <CourseIcon size={42} strokeWidth={1.5} />
                  </div>

                  <span className="absolute left-4 top-4 max-w-[75%] truncate rounded-full border border-white/20 bg-black/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                    {course.category || "General"}
                  </span>

                  <span className="absolute bottom-4 right-4 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                    Nexora Learning
                  </span>
                </div>

                {/* Course Details */}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={14} />
                      Published
                    </span>

                    <span className="text-xs font-medium text-slate-400">
                      Course #{course.id}
                    </span>
                  </div>

                  <h3 className="mt-4 line-clamp-2 min-h-[3.5rem] break-words text-lg font-extrabold leading-7 text-slate-900 transition group-hover:text-indigo-700">
                    {course.title}
                  </h3>

                  <p className="mt-3 line-clamp-3 min-h-[4.5rem] break-words text-sm leading-6 text-slate-500">
                    {course.description ||
                      "Explore this course and develop your knowledge with Nexora."}
                  </p>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
                        <UserRound size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Instructor
                        </p>

                        <p className="truncate text-sm font-bold text-slate-700">
                          {course.instructorName || "Nexora Team"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Bottom Note */}
      {!loading && !error && courses.length > 0 && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
              <Lightbulb size={21} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Keep learning, keep growing
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                Explore different subjects and discover new opportunities to
                develop your skills.
              </p>
            </div>
          </div>

          <span className="shrink-0 text-xs font-bold text-indigo-700">
            Learn smarter. Achieve more.
          </span>
        </div>
      )}
    </section>
  );
}

export default CourseList;
