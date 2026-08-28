import { useEffect, useState } from "react";
import { getMyExams } from "../../api/student";
import { FaArrowRight, FaClock, FaClipboardList } from "react-icons/fa";
import { Link } from "react-router-dom";
const ExamList = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadExams = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await getMyExams();

                setExams(
                    Array.isArray(data)
                        ? data
                        : data?.exams || data?.data|| []
                );
            } catch (err) {
                setError(
                    err.message || "Unable to load available exams."
                );
            } finally {
                setLoading(false);
            }
        };

        loadExams();
    }, []);

    const formatDate = (date) => {
        if (!date) {
            return "No end date";
        }

        return new Date(date).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        });
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
                            Available exams
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
                            Take the exams that are currently available for you.
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
                    ) : exams.length === 0 ? (
                        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-center shadow-sm">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D9FFF4] text-2xl text-[#007979]">
                                <FaClipboardList />
                            </div>

                            <h2 className="mt-5 text-lg font-bold text-[#4E1F6E]">
                                No exams available
                            </h2>

                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                                There are currently no exams open for you.
                                Check again later when an exam becomes available.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {exams.map((exam) => {
                                const endDate = exam.endAt || exam.endDate;

                                const courseName =
                                    exam.course?.name ||
                                    exam.courseName ||
                                    exam.course?.code ||
                                    "Course";

                                return (
                                    <div
                                        key={exam.id}
                                        className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#65DCD5] hover:shadow-lg"
                                    >
                                        <div className="h-2 bg-[#4E1F6E]" />

                                        <div className="flex flex-1 flex-col p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D9FFF4] text-lg text-[#007979]">
                                                    <FaClipboardList />
                                                </div>

                                                <span className="rounded-full bg-[#D9FFF4] px-3 py-1 text-xs font-bold text-[#007979]">
                                                    Available
                                                </span>
                                            </div>

                                            <div className="mt-6">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-[#007979]">
                                                    {courseName}
                                                </p>

                                                <h2 className="mt-2 text-xl font-bold text-[#4E1F6E]">
                                                    {exam.title}
                                                </h2>

                                                <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-500">
                                                    {exam.description ||
                                                        "No description available for this exam."}
                                                </p>
                                            </div>

                                            <div className="mt-5 rounded-xl bg-slate-50 p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm text-[#1D546C] shadow-sm">
                                                        <FaClock />
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-medium text-slate-400">
                                                            Available until
                                                        </p>

                                                        <p className="mt-0.5 text-sm font-semibold text-[#1D546C]">
                                                            {formatDate(endDate)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 border-t border-slate-100 pt-5">
                                                <Link
                                                    to={`/student/exams/${exam.id}`}
                                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4E1F6E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3f1859] hover:shadow-md"
                                                >
                                                    Take exam
                                                    <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!loading && exams.length > 0 && (
                        <div className="rounded-2xl border border-[#65DCD5] bg-[#D9FFF4] p-5">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#007979] shadow-sm">
                                    <FaClipboardList />
                                </div>

                                <div>
                                    <h3 className="font-bold text-[#1D546C]">
                                        Before you start
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-[#1D546C]/70">
                                        Make sure you have enough time to complete the
                                        exam before its availability window closes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default ExamList;