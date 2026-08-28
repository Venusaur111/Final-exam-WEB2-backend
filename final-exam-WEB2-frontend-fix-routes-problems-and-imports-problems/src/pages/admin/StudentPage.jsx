import { useEffect, useMemo, useState } from "react";

import { FaEllipsisV, FaPlus, FaSearch, FaUserCog, FaChartLine } from "react-icons/fa";

import { createStudent, disableStudent, getStudents, updateStudent } from "../../api/students";



const emptyForm = {
    firstName: "",
    lastName: "",
    name: "",
    email: "",
    password: "",
};

const StudentPage = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const loadStudents = async () => {          
        setLoading(true);
        setError("");

        try {
            const data = await getStudents();

            setStudents(
                Array.isArray(data)
                    ? data
                    : data?.students || data?.data || []
            );
        } catch (err) {
            setError(err.message || "Unable to load students.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const text = `
        ${student.name || ""}
        ${student.firstName || ""}
        ${student.lastName || ""}
        ${student.email || ""}
      `.toLowerCase();

            const active =
                student.active ??
                student.isActive ??
                student.status !== "inactive";

            const matchesSearch = text.includes(search.toLowerCase());

            const matchesStatus =
                status === "all" ||
                (status === "active" && active) ||
                (status === "inactive" && !active);

            return matchesSearch && matchesStatus;
        });
    }, [students, search, status]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setError("");
        setSuccess("");
        setOpen(true);
    };

    const openEdit = (student) => {
        setEditing(student);
        setForm({
            firstName: student.firstName || "",
            lastName: student.lastName || "",
            name: student.name || "",
            email: student.email || "",
            password: "",
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

    const saveStudent = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const payload = { ...form };

            if (editing) {
                await updateStudent(editing.id, payload);
                setSuccess("Student updated successfully.");
            } else {
                await createStudent(payload);
                setSuccess("Student created successfully.");
            }

            setOpen(false);
            await loadStudents();
        } catch (err) {
            setError(err.message || "Unable to save student.");
        } finally {
            setSaving(false);
        }
    };

    const deactivateStudent = async (student) => {
        const studentName =
            student.name ||
            `${student.firstName || ""} ${student.lastName || ""}`.trim();

        if (!window.confirm(`Deactivate ${studentName}?`)) {
            return;
        }

        setError("");
        setSuccess("");

        try {
            await disableStudent(student.id);
            setSuccess("Student account deactivated successfully.");
            await loadStudents();
        } catch (err) {
            setError(err.message || "Unable to deactivate student.");
        }
    };

    const getStudentName = (student) => {
        return (
            student.name ||
            `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
            "—"
        );
    };

    const getStudentReference = (student) => {
        return (
            student.reference ||
            student.studentCode ||
            `STD${String(student.id).padStart(5, "0")}`
        );
    };

    const isStudentActive = (student) => {
        return (
            student.active ??
            student.isActive ??
            student.status !== "inactive"
        );
    };

    return (
        <>
            <div className="min-h-full bg-[#D9FFF4]/40 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[#4E1F6E] sm:text-3xl">
                                Students
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage student accounts and access.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openCreate}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4E1F6E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3f1859] hover:shadow-md"
                        >
                            <FaPlus className="text-xs" />
                            Add student
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
                                Total students
                            </p>

                            <p className="mt-2 text-3xl font-bold text-[#4E1F6E]">
                                {students.length}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Active students
                            </p>

                            <p className="mt-2 text-3xl font-bold text-[#007979]">
                                {students.filter(isStudentActive).length}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Inactive students
                            </p>

                            <p className="mt-2 text-3xl font-bold text-[#1D546C]">
                                {students.filter(
                                    (student) => !isStudentActive(student)
                                ).length}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-[#1D546C]">
                                    Student list
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    View and manage all registered students.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Search students..."
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#007979] focus:bg-white focus:ring-2 focus:ring-[#65DCD5]/40 sm:w-64"
                                    />
                                </div>

                                <select
                                    value={status}
                                    onChange={(event) => setStatus(event.target.value)}
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none transition focus:border-[#007979] focus:bg-white focus:ring-2 focus:ring-[#65DCD5]/40"
                                >
                                    <option value="all">All statuses</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex min-h-64 items-center justify-center">
                                <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#4E1F6E]" />
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D9FFF4] text-xl text-[#007979]">
                                    <FaSearch />
                                </div>

                                <h3 className="mt-4 font-semibold text-[#4E1F6E]">
                                    No students found
                                </h3>

                                <p className="mt-1 text-sm text-slate-400">
                                    No student matches your current filters.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full min-w-[850px]">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/70">
                                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                                    Reference
                                                </th>

                                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                                    Full name
                                                </th>

                                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                                    Email
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
                                            {filteredStudents.map((student) => {
                                                const active = isStudentActive(student);

                                                return (
                                                    <tr
                                                        key={student.id}
                                                        className="border-b border-slate-100 last:border-0 transition hover:bg-[#D9FFF4]/20"
                                                    >
                                                        <td className="px-5 py-5">
                                                            <span className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-bold text-[#4E1F6E]">
                                                                {getStudentReference(student)}
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-5">
                                                            <span className="font-semibold text-slate-700">
                                                                {getStudentName(student)}
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-5 text-sm text-slate-500">
                                                            {student.email || "—"}
                                                        </td>

                                                        <td className="px-5 py-5">
                                                            <span
                                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${active
                                                                    ? "bg-[#D9FFF4] text-[#007979]"
                                                                    : "bg-red-50 text-red-500"
                                                                    }`}
                                                            >
                                                                {active ? "Active" : "Inactive"}
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-5">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEdit(student)}
                                                                    className="inline-flex items-center gap-2 rounded-lg border border-[#007979] px-3 py-2 text-xs font-semibold text-[#007979] transition hover:bg-[#D9FFF4]"
                                                                >
                                                                    <FaUserCog />
                                                                    Manage
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    title="Deactivate"
                                                                    disabled={!active}
                                                                    onClick={() =>
                                                                        deactivateStudent(student)
                                                                    }
                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                                                                >
                                                                    <FaEllipsisV />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    title="View results"
                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#D9FFF4] hover:text-[#007979]"
                                                                >
                                                                    <FaChartLine />
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
                                    {filteredStudents.map((student) => {
                                        const active = isStudentActive(student);

                                        return (
                                            <div
                                                key={student.id}
                                                className="p-5 transition hover:bg-[#D9FFF4]/20"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <span className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold text-[#4E1F6E]">
                                                            {getStudentReference(student)}
                                                        </span>

                                                        <h3 className="mt-3 font-bold text-slate-700">
                                                            {getStudentName(student)}
                                                        </h3>

                                                        <p className="mt-1 text-sm text-slate-400">
                                                            {student.email || "—"}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${active
                                                            ? "bg-[#D9FFF4] text-[#007979]"
                                                            : "bg-red-50 text-red-500"
                                                            }`}
                                                    >
                                                        {active ? "Active" : "Inactive"}
                                                    </span>
                                                </div>

                                                <div className="mt-4 flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(student)}
                                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#007979] px-3 py-2.5 text-xs font-semibold text-[#007979] transition hover:bg-[#D9FFF4]"
                                                    >
                                                        <FaUserCog />
                                                        Manage
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={!active}
                                                        onClick={() => deactivateStudent(student)}
                                                        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                                                    >
                                                        <FaEllipsisV />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#D9FFF4] hover:text-[#007979]"
                                                    >
                                                        <FaChartLine />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-400">
                                    {filteredStudents.length} student
                                    {filteredStudents.length !== 1 ? "s" : ""}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D546C]/30 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                                <div>
                                    <h2 className="text-xl font-bold text-[#4E1F6E]">
                                        {editing ? "Edit student" : "Add student"}
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-400">
                                        {editing
                                            ? "Update the student account information."
                                            : "Create a new student account."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                >
                                    ×
                                </button>
                            </div>

                            <form
                                onSubmit={saveStudent}
                                className="space-y-5 p-6"
                            >
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-[#1D546C]">
                                            First name
                                        </label>

                                        <input
                                            name="firstName"
                                            value={form.firstName}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#007979] focus:bg-white focus:ring-2 focus:ring-[#65DCD5]/40"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-[#1D546C]">
                                            Last name
                                        </label>

                                        <input
                                            name="lastName"
                                            value={form.lastName}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#007979] focus:bg-white focus:ring-2 focus:ring-[#65DCD5]/40"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[#1D546C]">
                                        Full name
                                    </label>

                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Optional"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#007979] focus:bg-white focus:ring-2 focus:ring-[#65DCD5]/40"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[#1D546C]">
                                        Email
                                    </label>

                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#007979] focus:bg-white focus:ring-2 focus:ring-[#65DCD5]/40"
                                    />
                                </div>

                                {!editing && (
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-[#1D546C]">
                                            Initial password
                                        </label>

                                        <input
                                            name="password"
                                            type="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#007979] focus:bg-white focus:ring-2 focus:ring-[#65DCD5]/40"
                                        />
                                    </div>
                                )}

                                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setOpen(false)}
                                        className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-xl bg-[#4E1F6E] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3f1859] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editing
                                                ? "Save changes"
                                                : "Create student"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default StudentPage;