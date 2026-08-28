import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaBook,
  FaChartLine,
  FaClipboardList,
  FaGraduationCap,
  FaSignOutAlt,
  FaUsers,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  const adminLinks = [
    {
      label: "Dashboard",
      to: "/admin",
      icon: FaChartLine,
      end: true,
    },
    {
      label: "Students",
      to: "/admin/students",
      icon: FaUsers,
    },
    {
      label: "Courses",
      to: "/admin/courses",
      icon: FaBook,
    },
    {
      label: "Exams",
      to: "/admin/exams",
      icon: FaClipboardList,
    },
  ];

  const studentLinks = [
    {
      label: "Exams",
      to: "/student",
      icon: FaClipboardList,
      end: true,
    },
    {
      label: "My Results",
      to: "/student/results",
      icon: FaChartLine,
    },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#D9FFF4] text-slate-700">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#65DCD5]/40 bg-white shadow-[4px_0_20px_rgba(29,84,108,0.08)] lg:flex lg:flex-col">
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4E1F6E] text-xl text-white shadow-md">
            <FaGraduationCap />
          </div>

          <div>
            <h1 className="text-lg font-bold text-[#4E1F6E]">
              Exam Hub
            </h1>
            <p className="text-xs font-medium text-[#007979]">
              {isAdmin ? "Administration" : "Student Space"}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          <p className="mb-4 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            {isAdmin ? "Admin Menu" : "Student Menu"}
          </p>

          {links.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#4E1F6E] text-white shadow-md shadow-[#1D546C]/10"
                    : "text-slate-600 hover:bg-[#D9FFF4] hover:text-[#007979]"
                }`
              }
            >
              <Icon className="text-base" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 rounded-xl bg-[#D9FFF4] p-3">
            <p className="truncate text-sm font-bold text-[#1D546C]">
              {user?.name || user?.firstName || "User"}
            </p>
            <p className="truncate text-xs text-[#007979]">
              {user?.email || ""}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-30 h-16 border-b border-[#65DCD5]/40 bg-white/95 shadow-sm backdrop-blur lg:hidden">
        <div className="flex h-full items-center justify-between px-4">
          <Link
            to={isAdmin ? "/admin" : "/student"}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4E1F6E] text-white">
              <FaGraduationCap />
            </div>

            <span className="font-bold text-[#4E1F6E]">
              Exam Hub
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
            aria-label="Logout"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;