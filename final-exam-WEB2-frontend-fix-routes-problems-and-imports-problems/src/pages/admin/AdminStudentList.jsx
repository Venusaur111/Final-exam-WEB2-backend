import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserPlus,
  FaSearch,
  FaChartLine,
  FaTrashAlt,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { getStudents, disableStudent, createStudent } from "../api/students";

const AdminStudentList = () => {
  console.log("AdminStudentList est rendu");
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    password: "",
  });

const loadStudents = async () => {
  setLoading(true);
  setError("");

  try {
    const response = await getStudents();

    console.log("========== STUDENTS ==========");
    console.log("Réponse reçue :", response);
    console.log("success :", response?.success);
    console.log("data :", response?.data);
    console.log("data est un tableau :", Array.isArray(response?.data));
    console.log("==============================");

    const list = Array.isArray(response)
      ? response
      : response?.data || response?.students || [];

    console.log("Liste finale :", list);

    setStudents(list);
  } catch (err) {
    console.error("ERREUR STUDENTS :", err);
    console.error("STATUS :", err.status);

    setError(err.message || "Unable to load students.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    console.log("useEffect exécuté");
    loadStudents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await disableStudent(id);
        setStudents((prev) => prev.filter((student) => student.id !== id));
      } catch (err) {
        alert(err.message || "Failed to delete student.");
      }
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await createStudent(newStudent);
      setIsAddModalOpen(false);
      setNewStudent({ name: "", email: "", password: "" });
      loadStudents();
    } catch (err) {
      alert(err.message || "Failed to create student.");
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      (student.name &&
        student.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.email &&
        student.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Students</h1>
            <p className="text-sm text-slate-500">
              Manage student accounts and view exam performances
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#007979] px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-[#005f5f]"
          >
            <FaUserPlus />
            <span>Add student</span>
          </button>
        </div>

        <div className="mb-6 flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-[#007979] focus-within:ring-1 focus-within:ring-[#007979]">
          <FaSearch className="mr-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">
            Loading students...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-600">
            {error}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-500">
            No students found.
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="transition hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D9FFF4] font-semibold text-[#007979]">
                            {student.name
                              ? student.name.charAt(0).toUpperCase()
                              : student.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">
                              {student.name || "N/A"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.isActive ?? true ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            <FaCheckCircle className="text-emerald-500" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            <FaTimesCircle className="text-slate-400" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {student.createdAt || student.created_at
                          ? new Date(student.createdAt || student.created_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title="View results"
                            onClick={() =>
                              navigate(`/admin/students/${student.id}/results`)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#D9FFF4] hover:text-[#007979]"
                          >
                            <FaChartLine />
                          </button>
                          <button
                            type="button"
                            title="Delete student"
                            onClick={() => handleDelete(student.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D9FFF4] font-semibold text-[#007979]">
                        {student.name
                          ? student.name.charAt(0).toUpperCase()
                          : student.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">
                          {student.name || "N/A"}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {student.email}
                        </p>
                      </div>
                    </div>
                    {student.isActive ?? true ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-400">
                      Joined{" "}
                      {student.createdAt || student.created_at
                        ? new Date(student.createdAt || student.created_at).toLocaleDateString()
                        : "N/A"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        title="View results"
                        onClick={() =>
                          navigate(`/admin/students/${student.id}/results`)
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#D9FFF4] hover:text-[#007979]"
                      >
                        <FaChartLine />
                      </button>
                      <button
                        type="button"
                        title="Delete student"
                        onClick={() => handleDelete(student.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-xl font-bold text-slate-800">
                Add New Student
              </h2>
              <form onSubmit={handleCreateStudent} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase text-slate-500">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.name}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, name: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#007979] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase text-slate-500">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newStudent.email}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, email: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#007979] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase text-slate-500">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newStudent.password}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, password: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#007979] focus:outline-none"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#007979] px-4 py-2 text-sm font-medium text-white hover:bg-[#005f5f]"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudentList;