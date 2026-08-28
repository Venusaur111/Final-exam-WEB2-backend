import { useEffect, useState } from "react";

import { FaBook, FaClipboardList, FaUsers, FaArrowRight } from "react-icons/fa";

import { getStudents } from "../../api/students";
import { getCourses } from "../../api/courses";
import { getExams } from "../../api/exams";

import { Link } from "react-router-dom";

const Dashboard = () => {
    const [stats, setStats] = useState({
        students: 0,
        courses: 0,
        exams: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            setError("");

            try {
                const [studentsData, coursesData, examsData] =
                    await Promise.all([
                        getStudents(),
                        getCourses(),
                        getExams(),
                    ]);

                const students = Array.isArray(studentsData)
                    ? studentsData
                    : studentsData?.students || [];

                const courses = Array.isArray(coursesData)
                    ? coursesData
                    : coursesData?.courses || [];

                const exams = Array.isArray(examsData)
                    ? examsData
                    : examsData?.exams || [];

                setStats({
                    students: students.length,
                    courses: courses.length,
                    exams: exams.length,
                });
            } catch (err) {
                setError(
                    err.message || "Unable to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    const statCards = [
        {
            label: "Students",
            value: stats.students,
            icon: FaUsers,
            description: "Registered students",
            iconClass: "bg-purple-50 text-[#4E1F6E]",
        },
        {
            label: "Courses",
            value: stats.courses,
            icon: FaBook,
            description: "Available courses",
            iconClass: "bg-[#D9FFF4] text-[#007979]",
        },
        {
            label: "Exams",
            value: stats.exams,
            icon: FaClipboardList,
            description: "Created exams",
            iconClass: "bg-[#1D546C]/10 text-[#1D546C]",
        },
    ];

    const quickActions = [
        {
            title: "Manage students",
            description:
                "Create, edit or disable student accounts.",
            path: "/admin/students",
            icon: FaUsers,
            iconClass: "bg-purple-50 text-[#4E1F6E]",
        },
        {
            title: "Manage courses",
            description:
                "Organize and manage the school's courses.",
            path: "/admin/courses",
            icon: FaBook,
            iconClass: "bg-[#D9FFF4] text-[#007979]",
        },
        {
            title: "Manage exams",
            description:
                "Create exams, QCM questions and availability windows.",
            path: "/admin/exams",
            icon: FaClipboardList,
            iconClass: "bg-[#1D546C]/10 text-[#1D546C]",
        },
    ];

    return (
        <div className="min-h-full bg-[#D9FFF4]/40 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#007979]">
                        Administration
                    </p>

                    <h1 className="text-2xl font-bold text-[#4E1F6E] sm:text-3xl">
                        Dashboard
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
                        Overview of your exam management platform.
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
                    <div className="flex min-h-52 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#4E1F6E]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        {statCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <div
                                    key={card.label}
                                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">
                                                {card.label}
                                            </p>

                                            <p className="mt-3 text-4xl font-bold text-[#4E1F6E]">
                                                {card.value}
                                            </p>

                                            <p className="mt-2 text-xs text-slate-400">
                                                {card.description}
                                            </p>
                                        </div>

                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg ${card.iconClass}`}
                                        >
                                            <Icon />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-[#1D546C]">
                            Quick access
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Quickly access the main administration sections.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                        {quickActions.map((action) => {
                            const Icon = action.icon;

                            return (
                                <Link
                                    key={action.path}
                                    to={action.path}
                                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#65DCD5] hover:shadow-lg"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div
                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg ${action.iconClass}`}
                                        >
                                            <Icon />
                                        </div>

                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-[#D9FFF4] group-hover:text-[#007979]">
                                            <FaArrowRight className="text-xs transition-transform group-hover:translate-x-0.5" />
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="text-base font-bold text-[#4E1F6E]">
                                            {action.title}
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            {action.description}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl bg-[#4E1F6E] shadow-lg">
                    <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#65DCD5]">
                                Exam Hub
                            </p>

                            <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                                Manage your examination platform
                            </h2>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-purple-100">
                                Create courses, prepare exams, manage students and
                                monitor examination results from one place.
                            </p>
                        </div>

                        <Link
                            to="/admin/exams"
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#65DCD5] px-5 py-3 text-sm font-bold text-[#1D546C] transition hover:bg-white"
                        >
                            View exams
                            <FaArrowRight className="text-xs" />
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Dashboard;