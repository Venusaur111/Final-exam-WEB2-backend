import { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaQuestionCircle, FaChartLine, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { createExam, deleteExam, getExams, updateExam } from "../../api/exams";
import { getCourses } from "../../api/courses";

const initialForm = {
    courseId: "",
    title: "",
    description: "",
    startAt: "",
    endAt: "",
};

const getExamStatus = (exam) => {
    if (!exam) {
        return { label: "Scheduled", className: "bg-purple-50 text-[#4E1F6E]" };
    }

    const now = Date.now();
    const start = new Date(exam.startAt || exam.startDate).getTime();
    const end = new Date(exam.endAt || exam.endDate).getTime();

    if (Number.isNaN(start) || Number.isNaN(end)) {
        return { label: "Scheduled", className: "bg-purple-50 text-[#4E1F6E]" };
    }

    if (now < start) {
        return { label: "Scheduled", className: "bg-purple-50 text-[#4E1F6E]" };
    }

    if (now > end) {
        return { label: "Completed", className: "bg-slate-100 text-slate-500" };
    }

    return { label: "In progress", className: "bg-[#D9FFF4] text-[#007979]" };
};

const formatDateForInput = (dateVal) => {
    if (!dateVal) return "";
    try {
        const d = new Date(dateVal);
        if (Number.isNaN(d.getTime())) return "";
        return d.toISOString().slice(0, 16);
    } catch {
        return "";
    }
};

const ExamPage = () => {
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);

    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
            const [examData, courseData] = await Promise.all([
                getExams(),
                getCourses(),
            ]);

            const resolvedExams = Array.isArray(examData)
                ? examData
                : examData?.exams || examData?.data || [];

            const resolvedCourses = Array.isArray(courseData)
                ? courseData
                : courseData?.courses || courseData?.data || [];

            setExams(resolvedExams);
            setCourses(resolvedCourses);
        } catch (err) {
            setError(err.message || "Unable to load exams.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = () => {
        setEditing(null);
        setForm(initialForm);
        setError("");
        setSuccess("");
        setOpen(true);
    };

    const handleEdit = (exam) => {
        setEditing(exam);

        setForm({
            courseId: exam.courseId || exam.course?.id || "",
            title: exam.title || "",
            description: exam.description || "",
            startAt: formatDateForInput(exam.startAt || exam.startDate),
            endAt: formatDateForInput(exam.endAt || exam.endDate),
        });

        setError("");
        setSuccess("");
        setOpen(true);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

const handleSave = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
        const payload = {
            ...form,
            // Ne pas utiliser Number() ici car courseId est un UUID (string)
            courseId: form.courseId, 
        };

        if (editing) {
            await updateExam(editing.id, payload);
            setSuccess("Exam updated successfully.");
        } else {
            await createExam(payload);
            setSuccess("Exam created successfully.");
        }

        setOpen(false);
        await loadData();
    } catch (err) {
        setError(err.message || "Unable to save the exam.");
    } finally {
        setSaving(false);
    }
};

    const handleDelete = async (exam) => {
        if (!window.confirm("Delete this exam?")) {
            return;
        }

        setError("");
        setSuccess("");

        try {
            await deleteExam(exam.id);
            setSuccess("Exam deleted successfully.");
            await loadData();
        } catch (err) {
            setError(err.message || "Unable to delete the exam.");
        }
    };

    const getCourseName = (exam) => {
        return (
            exam.course?.name ||
            courses.find(
                (course) => String(course.id) === String(exam.courseId)
            )?.name ||
            exam.courseName ||
            "—"
        );
    };

    const formatDate = (date) => {
        if (!date) return "—";
        const d = new Date(date);
        if (Number.isNaN(d.getTime())) return "—";

        return d.toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    return (
        <div className="min-h-full bg-[#D9FFF4]/40 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#4E1F6E] sm:text-3xl">
                            Exams
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Create and manage exams, availability windows and questions.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreate}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4E1F6E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3f1859] hover:shadow-md"
                    >
                        <FaPlus className="text-xs" />
                        Add exam
                    </button>
                </div>

                {error && (
                    <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="ml-4 font-bold text-red-400 hover:text-red-600"
                        >
                            ×
                        </button>
                    </div>
                )}

                {success && (
                    <div className="flex items-center justify-between rounded-xl border border-[#65DCD5] bg-[#D9FFF4] px-4 py-3 text-sm font-medium text-[#007979]">
                        <span>{success}</span>
                        <button
                            type="button"
                            onClick={() => setSuccess("")}
                            className="ml-4 font-bold text-[#007979]"
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Total exams
                        </p>
                        <p className="mt-2 text-3xl font-bold text-[#4E1F6E]">
                            {Array.isArray(exams) ? exams.length : 0}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            In progress
                        </p>
                        <p className="mt-2 text-3xl font-bold text-[#007979]">
                            {Array.isArray(exams)
                                ? exams.filter(
                                    (exam) =>
                                        getExamStatus(exam).label === "In progress"
                                  ).length
                                : 0}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Scheduled
                        </p>
                        <p className="mt-2 text-3xl font-bold text-[#1D546C]">
                            {Array.isArray(exams)
                                ? exams.filter(
                                    (exam) =>
                                        getExamStatus(exam).label === "Scheduled"
                                  ).length
                                : 0}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#4E1F6E]" />
                    </div>
                ) : !Array.isArray(exams) || exams.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-center shadow-sm">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D9FFF4] text-xl text-[#007979]">
                            <FaQuestionCircle />
                        </div>
                        <h2 className="mt-4 font-bold text-[#4E1F6E]">
                            No exams yet
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Create your first exam to get started.
                        </p>
                        <button
                            type="button"
                            onClick={handleCreate}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#4E1F6E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3f1859]"
                        >
                            <FaPlus className="text-xs" />
                            Add exam
                        </button>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-5">
                            <h2 className="text-lg font-bold text-[#1D546C]">
                                All exams
                            </h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Manage your exams and their questions.
                            </p>
                        </div>

                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full min-w-[1000px]">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70">
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Exam
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Course
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Availability
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Status
                                        </th>
                                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exams.map((exam) => {
                                        const examStatus = getExamStatus(exam);

                                        return (
                                            <tr
                                                key={exam.id}
                                                className="border-b border-slate-100 last:border-0 transition hover:bg-[#D9FFF4]/20"
                                            >
                                                <td className="px-5 py-5">
                                                    <div>
                                                        <p className="font-semibold text-[#4E1F6E]">
                                                            {exam.title}
                                                        </p>
                                                        {exam.description && (
                                                            <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                                                                {exam.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <span className="font-medium text-slate-600">
                                                        {getCourseName(exam)}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <div className="space-y-1 text-sm text-slate-500">
                                                        <p>
                                                            {formatDate(
                                                                exam.startAt || exam.startDate
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            →{" "}
                                                            {formatDate(
                                                                exam.endAt || exam.endDate
                                                            )}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${examStatus.className}`}
                                                    >
                                                        {examStatus.label}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            to={`/admin/exams/${exam.id}/questions`}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-[#007979] px-3 py-2 text-xs font-semibold text-[#007979] transition hover:bg-[#D9FFF4]"
                                                        >
                                                            <FaQuestionCircle />
                                                            Questions
                                                        </Link>

                                                        <Link
                                                            to={`/admin/exams/${exam.id}/results`}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-[#4E1F6E] px-3 py-2 text-xs font-semibold text-[#4E1F6E] transition hover:bg-purple-50"
                                                        >
                                                            <FaChartLine />
                                                            Results
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleEdit(exam)}
                                                            title="Edit exam"
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#007979]"
                                                        >
                                                            <FaEdit />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(exam)}
                                                            title="Delete exam"
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-slate-100 md:hidden">
                            {exams.map((exam) => {
                                const examStatus = getExamStatus(exam);

                                return (
                                    <div
                                        key={exam.id}
                                        className="p-5 transition hover:bg-[#D9FFF4]/20"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-bold text-[#4E1F6E]">
                                                    {exam.title}
                                                </h3>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {getCourseName(exam)}
                                                </p>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${examStatus.className}`}
                                            >
                                                {examStatus.label}
                                            </span>
                                        </div>

                                        {exam.description && (
                                            <p className="mt-3 text-sm text-slate-400">
                                                {exam.description}
                                            </p>
                                        )}

                                        <div className="mt-4 rounded-xl bg-slate-50 p-3">
                                            <p className="text-xs font-medium text-slate-400">
                                                Availability
                                            </p>
                                            <p className="mt-1 text-sm text-slate-600">
                                                {formatDate(
                                                    exam.startAt || exam.startDate
                                                )}
                                            </p>
                                            <p className="text-sm text-slate-400">
                                                →{" "}
                                                {formatDate(
                                                    exam.endAt || exam.endDate
                                                )}
                                            </p>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            <Link
                                                to={`/admin/exams/${exam.id}/questions`}
                                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#007979] px-3 py-2.5 text-xs font-semibold text-[#007979] transition hover:bg-[#D9FFF4]"
                                            >
                                                <FaQuestionCircle />
                                                Questions
                                            </Link>

                                            <Link
                                                to={`/admin/exams/${exam.id}/results`}
                                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#4E1F6E] px-3 py-2.5 text-xs font-semibold text-[#4E1F6E] transition hover:bg-purple-50"
                                            >
                                                <FaChartLine />
                                                Results
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de création et édition */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-xl font-bold text-[#4E1F6E]">
                                {editing ? "Edit exam" : "Add new exam"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="font-bold text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500">
                                    Course
                                </label>
                                <select
                                    name="courseId"
                                    value={form.courseId}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#4E1F6E] focus:outline-none"
                                >
                                    <option value="">Select a course</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="Exam title"
                                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#4E1F6E] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Exam description"
                                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#4E1F6E] focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500">
                                        Start Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="startAt"
                                        value={form.startAt}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#4E1F6E] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500">
                                        End Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="endAt"
                                        value={form.endAt}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#4E1F6E] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-[#4E1F6E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3f1859] disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : editing ? "Save changes" : "Create exam"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamPage;