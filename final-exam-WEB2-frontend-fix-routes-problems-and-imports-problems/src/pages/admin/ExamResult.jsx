import { useEffect, useState } from "react";
import { FaArrowLeft, FaChartLine } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";

import { getExamResults } from "../../api/exams";

import {
  PageHeader,
  Loading,
  ErrorAlert,
  EmptyState,
  Badge,
} from "../../components/UI";

export default function ExamResults() {
  const { id } = useParams();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getExamResults(id);

        setResults(
          Array.isArray(data) ? data : data?.results || []
        );
      } catch (err) {
        setError(err.message || "Unable to load exam results.");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [id]);

  const getScore = (result) => {
    return result.score ?? result.note ?? 0;
  };

  const getMaxScore = (result) => {
    return (
      result.maxScore ??
      result.totalPoints ??
      result.outOf ??
      20
    );
  };

  const getStudentName = (result) => {
    return (
      result.student?.name ||
      result.student?.fullName ||
      `${result.student?.firstName || ""} ${
        result.student?.lastName || ""
      }`.trim() ||
      result.studentName ||
      result.user?.name ||
      result.user?.fullName ||
      "Student"
    );
  };

  const getStudentEmail = (result) => {
    return (
      result.student?.email ||
      result.studentEmail ||
      result.user?.email ||
      "—"
    );
  };

  const getDate = (result) => {
    const date =
      result.submittedAt ||
      result.completedAt ||
      result.createdAt;

    if (!date) return "—";

    return new Date(date).toLocaleString("fr-FR");
  };

  const getPercentage = (result) => {
    const score = Number(getScore(result));
    const maxScore = Number(getMaxScore(result));

    if (!maxScore) return 0;

    return Math.round((score / maxScore) * 100);
  };

  const getStatus = (result) => {
    const percentage = getPercentage(result);

    if (percentage >= 50) {
      return {
        label: "Passed",
        tone: "green",
      };
    }

    return {
      label: "Failed",
      tone: "red",
    };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam results"
        subtitle="View the results and scores of students who completed this exam."
        action={
          <Link
            to="/admin/exams"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#1D546C] shadow-sm transition hover:bg-slate-50"
          >
            <FaArrowLeft />
            Back to exams
          </Link>
        }
      />

      <ErrorAlert message={error} />

      {loading ? (
        <Loading />
      ) : results.length === 0 ? (
        <EmptyState
          title="No results"
          text="No student has completed this exam yet."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Student
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Score
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Percentage
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Submitted
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {results.map((result, index) => {
                  const status = getStatus(result);

                  return (
                    <tr
                      key={result.id || index}
                      className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D9FFF4] text-sm font-bold text-[#007979]">
                            {getStudentName(result)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <strong className="block truncate text-sm font-semibold text-[#1D546C]">
                              {getStudentName(result)}
                            </strong>

                            <span className="block truncate text-xs text-slate-400">
                              {getStudentEmail(result)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <strong className="text-lg font-bold text-[#4E1F6E]">
                          {getScore(result)}
                        </strong>

                        <span className="text-sm text-slate-400">
                          {" "}
                          / {getMaxScore(result)}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-semibold text-[#1D546C]">
                          {getPercentage(result)}%
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {getDate(result)}
                      </td>

                      <td className="px-6 py-5">
                        <Badge tone={status.tone}>
                          {status.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#65DCD5] bg-[#D9FFF4]/60 px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#007979] shadow-sm">
            <FaChartLine />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#1D546C]">
              {results.length} result
              {results.length > 1 ? "s" : ""}
            </p>

            <p className="text-xs text-slate-500">
              Results currently available for this exam.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}