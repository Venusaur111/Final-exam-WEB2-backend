import { useEffect, useState } from "react";
import { getMyResults } from "../../api/student";
import { FaArrowRight, FaChartLine, FaClipboardCheck } from "react-icons/fa";
import { Link } from "react-router-dom";


const ResultList = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadResults = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await getMyResults();

                setResults(
                    Array.isArray(data)
                        ? data
                        : data?.results || []
                );
            } catch (err) {
                setError(
                    err.message || "Unable to load your results."
                );
            } finally {
                setLoading(false);
            }
        };

        loadResults();
    }, []);

    const formatDate = (date) => {
        if (!date) {
            return "No date";
        }

        return new Date(date).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    const getScore = (result) => {
        return result.score ?? result.note ?? "—";
    };

    const getMaxScore = (result) => {
        return (
            result.maxScore ??
            result.totalPoints ??
            result.outOf ??
            20
        );
    };

    const getExamTitle = (result) => {
        return (
            result.exam?.title ||
            result.examTitle ||
            result.title ||
            "Exam"
        );
    };

    const getCourseName = (result) => {
        return (
            result.exam?.course?.name ||
            result.courseName ||
            result.exam?.course?.code ||
            "Course"
        );
    };

    const getExamId = (result) => {
        return result.examId || result.exam?.id;
    };

    return (
        <>
            <div className="min-h-full bg-[#D9FFF4]/40 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-8">
                    <div>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#007979]">
                            Student space
                        </p>

                        <h1 className="text-2xl font-bold text-[#4E1F6E] sm:text-3xl">
                            My results
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
                            View the history of all your completed exams and
                            access their detailed corrections.
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            <span>{error}</span>

                            <button
                                type="button"
                                onClick={() => setError("")}
                                className="ml-4 font-bold text-red-400 transition hover:text-red-600"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#4E1F6E]" />
                        </div>
                    ) : results.length === 0 ? (
                        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-center shadow-sm">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D9FFF4] text-2xl text-[#007979]">
                                <FaClipboardCheck />
                            </div>

                            <h2 className="mt-5 text-lg font-bold text-[#4E1F6E]">
                                No results yet
                            </h2>

                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                                You have not completed any exams yet. Your results
                                will appear here after you submit an exam.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D9FFF4] text-lg text-[#007979]">
                                            <FaClipboardCheck />
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-slate-500">
                                                Exams completed
                                            </p>

                                            <p className="mt-1 text-2xl font-bold text-[#4E1F6E]">
                                                {results.length}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-lg text-[#4E1F6E]">
                                            <FaChartLine />
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-slate-500">
                                                Latest result
                                            </p>

                                            <p className="mt-1 text-2xl font-bold text-[#4E1F6E]">
                                                {getScore(results[0])} /{" "}
                                                {getMaxScore(results[0])}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                                    <h2 className="text-lg font-bold text-[#4E1F6E]">
                                        Exam history
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Your completed exams and obtained grades.
                                    </p>
                                </div>

                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/70">
                                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    Exam
                                                </th>

                                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    Grade
                                                </th>

                                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    Date
                                                </th>

                                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100">
                                            {results.map((result, index) => {
                                                const examId = getExamId(result);

                                                return (
                                                    <tr
                                                        key={result.id || index}
                                                        className="transition hover:bg-[#D9FFF4]/30"
                                                    >
                                                        <td className="px-6 py-5">
                                                            <div>
                                                                <p className="font-semibold text-[#4E1F6E]">
                                                                    {getExamTitle(result)}
                                                                </p>

                                                                <p className="mt-1 text-sm text-slate-400">
                                                                    {getCourseName(result)}
                                                                </p>
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-5">
                                                            <span className="inline-flex rounded-lg bg-[#D9FFF4] px-3 py-1.5 text-sm font-bold text-[#007979]">
                                                                {getScore(result)} /{" "}
                                                                {getMaxScore(result)}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-5 text-sm text-slate-500">
                                                            {formatDate(result.submittedAt)}
                                                        </td>

                                                        <td className="px-6 py-5 text-right">
                                                            {examId ? (
                                                                <Link
                                                                    to={`/student/exams/${examId}/result`}
                                                                    className="inline-flex items-center gap-2 rounded-xl border border-[#007979] px-4 py-2.5 text-sm font-semibold text-[#007979] transition hover:bg-[#D9FFF4]"
                                                                >
                                                                    <FaChartLine />
                                                                    View result
                                                                    <FaArrowRight className="text-xs" />
                                                                </Link>
                                                            ) : (
                                                                <span className="text-sm text-slate-400">
                                                                    Unavailable
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="divide-y divide-slate-100 md:hidden">
                                    {results.map((result, index) => {
                                        const examId = getExamId(result);

                                        return (
                                            <div
                                                key={result.id || index}
                                                className="p-5"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="font-bold text-[#4E1F6E]">
                                                            {getExamTitle(result)}
                                                        </h3>

                                                        <p className="mt-1 text-sm text-slate-400">
                                                            {getCourseName(result)}
                                                        </p>
                                                    </div>

                                                    <span className="shrink-0 rounded-lg bg-[#D9FFF4] px-3 py-1.5 text-sm font-bold text-[#007979]">
                                                        {getScore(result)} /{" "}
                                                        {getMaxScore(result)}
                                                    </span>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between gap-3">
                                                    <span className="text-xs text-slate-400">
                                                        {formatDate(result.submittedAt)}
                                                    </span>

                                                    {examId && (
                                                        <Link
                                                            to={`/student/exams/${examId}/result`}
                                                            className="inline-flex items-center gap-2 rounded-xl border border-[#007979] px-3 py-2 text-xs font-semibold text-[#007979] transition hover:bg-[#D9FFF4]"
                                                        >
                                                            View result
                                                            <FaArrowRight />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default ResultList;