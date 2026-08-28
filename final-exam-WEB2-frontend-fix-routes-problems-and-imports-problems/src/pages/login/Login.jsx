import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const Login = ()=> {
  const { isAuthenticated, user, login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role === "admin" ? "/admin" : "/student"}
        replace
      />
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const loggedUser = await login(email, password);

      const destination =
        location.state?.from ||
        (loggedUser?.role === "admin" ? "/admin" : "/student");

      navigate(destination, {
        replace: true,
      });
    } catch (err) {
      setError(
        err?.message || "An error occurred while signing in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FA] lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[#4E1F6E] lg:flex lg:min-h-screen">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#65DCD5]/20" />

        <div className="absolute -bottom-40 -left-32 h-[500px] w-[500px] rounded-full border-[80px] border-[#65DCD5]/10" />

        <div className="absolute right-20 top-1/3 h-24 w-24 rotate-12 rounded-3xl border border-white/10" />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#65DCD5] text-[#4E1F6E] shadow-lg">
              <FaSignInAlt />
            </div>

            <span className="text-xl font-bold tracking-tight">
              Exam Hub
            </span>
          </div>

          <div className="max-w-xl">
            <span className="mb-5 inline-flex rounded-full border border-[#65DCD5]/30 bg-[#65DCD5]/10 px-4 py-2 text-sm font-semibold text-[#65DCD5]">
              QCM Examination Platform
            </span>

            <h1 className="text-5xl font-bold leading-tight text-white xl:text-6xl">
              Your exams,
              <br />
              <span className="text-[#65DCD5]">
                simplified.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-white/70">
              Prepare, take, and track your examination results
              from a single platform.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <strong className="block text-2xl font-bold text-white">
                  QCM
                </strong>
                <span className="mt-1 block text-xs text-white/50">
                  Exams
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <strong className="block text-2xl font-bold text-white">
                  24/7
                </strong>
                <span className="mt-1 block text-xs text-white/50">
                  Accessible
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <strong className="block text-2xl font-bold text-white">
                  100%
                </strong>
                <span className="mt-1 block text-xs text-white/50">
                  Online
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-white/40">
            Exam Hub — Examination Management
          </p>
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4E1F6E] text-white shadow-md">
              <FaSignInAlt />
            </div>

            <span className="text-xl font-bold text-[#4E1F6E]">
              Exam Hub
            </span>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-[0_20px_50px_rgba(29,84,108,0.10)] sm:p-9">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D9FFF4] text-xl text-[#007979]">
                <FaSignInAlt />
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-[#1D546C]">
                Welcome
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Sign in to your account.
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#1D546C]"
                >
                  Email address
                </label>

                <div className="group relative">
                  <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition group-focus-within:text-[#007979]" />

                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#007979] focus:bg-white focus:ring-4 focus:ring-[#65DCD5]/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[#1D546C]"
                >
                  Password
                </label>

                <div className="group relative">
                  <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition group-focus-within:text-[#007979]" />

                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#007979] focus:bg-white focus:ring-4 focus:ring-[#65DCD5]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4E1F6E] px-5 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#3F1859] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#4E1F6E]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Log in
                    <FaSignInAlt />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;