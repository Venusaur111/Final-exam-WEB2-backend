import { useEffect, useState } from "react";
import { FaBook, FaEdit, FaPlus, FaTrash } from "react-icons/fa";

import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../api/courses";

const initialForm = {
  code: "",
  name: "",
  description: "",
};

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const loadCourses = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getCourses();

      setCourses(
        Array.isArray(data)
          ? data
          : data?.courses || []
      );
    } catch (err) {
      setError(err.message || "Unable to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
    setOpen(true);
  };

  const handleEdit = (course) => {
    setEditing(course);

    setForm({
      code: course.code || "",
      name: course.name || "",
      description: course.description || "",
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
      if (editing) {
        await updateCourse(editing.id, form);
        setSuccess("Course updated successfully.");
      } else {
        await createCourse(form);
        setSuccess("Course created successfully.");
      }

      setOpen(false);
      await loadCourses();
    } catch (err) {
      setError(err.message || "Unable to save the course.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course) => {
    const courseName = course.code || course.name;

    if (!window.confirm(`Delete the course ${courseName}?`)) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await deleteCourse(course.id);
      setSuccess("Course deleted successfully.");
      await loadCourses();
    } catch (err) {
      setError(err.message || "Unable to delete the course.");
    }
  };

  return (
    <div className="min-h-full bg-[#D9FFF4]/40 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#007979]">
              Administration
            </p>

            <h1 className="text-2xl font-bold text-[#4E1F6E] sm:text-3xl">
              Courses
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Create and organize the courses associated with
              your exams.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4E1F6E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3f1859] hover:shadow-md"
          >
            <FaPlus className="text-xs" />
            Add course
          </button>
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D9FFF4] text-lg text-[#007979]">
                <FaBook />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total courses
                </p>

                <p className="mt-1 text-3xl font-bold text-[#4E1F6E]">
                  {courses.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#4E1F6E]" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D9FFF4] text-xl text-[#007979]">
              <FaBook />
            </div>

            <h2 className="mt-4 font-bold text-[#4E1F6E]">
              No courses yet
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Start by creating your first course.
            </p>

            <button
              type="button"
              onClick={handleCreate}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#4E1F6E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3f1859]"
            >
              <FaPlus className="text-xs" />
              Add course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#65DCD5] hover:shadow-lg"
              >
                <div className="h-2 bg-[#4E1F6E]" />

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D9FFF4] text-lg font-bold text-[#007979]">
                      <FaBook />
                    </div>

                    <span className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-bold tracking-wide text-[#4E1F6E]">
                      {course.code || "—"}
                    </span>
                  </div>

                  <div className="mt-5">
                    <h2 className="text-lg font-bold text-[#4E1F6E]">
                      {course.name}
                    </h2>

                    <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-500">
                      {course.description ||
                        "No description available."}
                    </p>
                  </div>

                  <div className="mt-6 flex gap-2 border-t border-slate-100 pt-5">
                    <button
                      type="button"
                      onClick={() => handleEdit(course)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#007979] px-3 py-2.5 text-xs font-semibold text-[#007979] transition hover:bg-[#D9FFF4]"
                    >
                      <FaEdit />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(course)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D546C]/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-[#4E1F6E]">
                  {editing ? "Edit course" : "Add course"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {editing
                    ? "Update the course information."
                    : "Create a new course for your examination platform."}
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
              onSubmit={handleSave}
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1D546C]">
                  Course code
                </label>

                <input
                  name="code"
                  required
                  value={form.code}
                  onChange={handleChange}
                  placeholder="PROG2"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium uppercase text-slate-700 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-[#007979] focus:bg-white focus:ring-2 focus:ring-[#65DCD5]/40"
                />

                <p className="mt-2 text-xs text-slate-400">
                  The course code must be unique.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1D546C]">
                  Course name
                </label>

                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Programming 2"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#007979] focus:bg-white focus:ring-2 focus:ring-[#65DCD5]/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1D546C]">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the course..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#007979] focus:bg-white focus:ring-2 focus:ring-[#65DCD5]/40"
                />
              </div>

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
                      : "Create course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;