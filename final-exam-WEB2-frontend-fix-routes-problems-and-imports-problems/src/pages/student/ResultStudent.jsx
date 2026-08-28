import { useEffect, useState } from "react";
import { FaArrowLeft, FaCheckCircle, FaMinusCircle, FaTimesCircle, FaTrophy } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getMyExam } from "../../api/student";


const ResultStudent = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [result, setResult] = useState(
        location.state?.result || null
    );
    const [loading, setLoading] = useState(
        !location.state?.result
    );
    const [error, setError] = useState("");

    useEffect(() => {
        if (result) {
            return;
        }

        const loadResult = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await getMyExam(id);

                setResult(
                    data?.result ||
                    data?.attempt ||
                    data
                );
            } catch (err) {
                setError(
                    err.message || "Unable to load the exam result."
                );
            } finally {
                setLoading(false);
            }
        };

        loadResult();
    }, [id, result]);

    const getScore = () => {
        return result?.score ?? result?.note ?? 0;
    };

    const getMaxScore = () => {
        return (
            result?.maxScore ??
            result?.totalPoints ??
            result?.outOf ??
            20
        );
    };

    const getAnswers = () => {
        return result?.answers || result?.correction || [];
    };

    const getExamTitle = () => {
        return (
            result?.exam?.title ||
            result?.examTitle ||
            result?.title ||
            "Exam"
        );
    };

    const getQuestionText = (answer, index) => {
        return (
            answer?.question?.statement ||
            answer?.statement ||
            answer?.questionText ||
            `Question ${index + 1}`
        );
    };

    const getSelectedAnswer = (answer) => {
        return (
            answer?.selectedChoice?.text ||
            answer?.selectedChoiceText ||
            answer?.choiceText ||
            "No answer"
        );
    };

    const getCorrectAnswer = (answer) => {
        return (
            answer?.correctChoice?.text ||
            answer?.correctChoiceText ||
            "Not available"
        );
    };

    const isUnanswered = (answer) => {
        return (
            !answer?.selectedChoice &&
            !answer?.selectedChoiceId &&
            !answer?.choiceId
        );
    };

    const isCorrect = (answer) => {
        return answer?.correct ?? answer?.isCorrect ?? false;
    };

    const getPoints = (answer) => {
        if (answer?.pointsEarned !== undefined) {
            return answer.pointsEarned;
        }

        return isCorrect(answer)
            ? answer?.points || 0
            : 0;
    };

    const getPercentage = () => {
        const score = Number(getScore());
        const maxScore = Number(getMaxScore());

        if (!maxScore) {
            return 0;
        }

        return Math.round((score / maxScore) * 100);
    };

    if (loading) {
        return (
            <div className="flex min-h-full items-center justify-center bg-[#D9FFF4]/40 p-6">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#4E1F6E]" />
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-full bg-[#D9FFF4]/40 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                        <p className="font-semibold text-red-600">
                            {error || "Exam result not found."}
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/student/results")}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#4E1F6E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d1857]"
                        >
                            <FaArrowLeft />
                            Back to my results
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const score = getScore();
    const maxScore = getMaxScore();
    const percentage = getPercentage();
    const answers = getAnswers();

    const correctCount = answers.filter(
        (answer) =>
            !isUnanswered(answer) &&
            isCorrect(answer)
    ).length;

    const incorrectCount = answers.filter(
        (answer) =>
            !isUnanswered(answer) &&
            !isCorrect(answer)
    ).length;

    const unansweredCount = answers.filter(
        (answer) => isUnanswered(answer)
    ).length;

    return (
        <>
            <div className="min-h-full bg-[#D9FFF4]/40 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-5xl space-y-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#007979]">
                                Exam result
                            </p>

                            <h1 className="text-2xl font-bold text-[#4E1F6E] sm:text-3xl">
                                {getExamTitle()}
                            </h1>

                            <p className="mt-2 text-sm text-slate-500 sm:text-base">
                                Review your score and check your answers.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/student/results")}
                            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#007979] hover:text-[#007979]"
                        >
                            <FaArrowLeft />
                            My results
                        </button>
                    </div>

                    <section className="overflow-hidden rounded-2xl bg-[#4E1F6E] shadow-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="flex items-center gap-5 p-6 sm:p-8">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-3xl text-[#65DCD5]">
                                    <FaTrophy />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-white/70">
                                        Your score
                                    </p>

                                    <div className="mt-1 flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-white sm:text-5xl">
                                            {score}
                                        </span>

                                        <span className="text-lg font-medium text-white/60">
                                            / {maxScore}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center border-t border-white/10 bg-white/5 p-6 md:border-l md:border-t-0">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-white/70">
                                        Final grade
                                    </p>

                                    <p className="mt-1 text-3xl font-bold text-[#65DCD5]">
                                        {percentage}%
                                    </p>

                                    <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-white/10">
                                        <div
                                            className="h-full rounded-full bg-[#65DCD5] transition-all"
                                            style={{
                                                width: `${Math.min(
                                                    Math.max(percentage, 0),
                                                    100
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-white/10 px-6 py-4 text-center text-sm text-white/70">
                            Exam submitted successfully.
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                                    <FaCheckCircle />
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Correct
                                    </p>

                                    <p className="text-xl font-bold text-slate-700">
                                        {correctCount}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                                    <FaTimesCircle />
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Incorrect
                                    </p>

                                    <p className="text-xl font-bold text-slate-700">
                                        {incorrectCount}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                    <FaMinusCircle />
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Unanswered
                                    </p>

                                    <p className="text-xl font-bold text-slate-700">
                                        {unansweredCount}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="mb-5">
                            <h2 className="text-xl font-bold text-[#4E1F6E]">
                                Answer correction
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Review your answers question by question.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {answers.length === 0 ? (
                                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                                    <p className="text-sm text-slate-400">
                                        No correction details are available.
                                    </p>
                                </div>
                            ) : (
                                answers.map((answer, index) => {
                                    const unanswered =
                                        isUnanswered(answer);

                                    const correct =
                                        isCorrect(answer);

                                    const cardStyle = unanswered
                                        ? "border-slate-200 bg-white"
                                        : correct
                                            ? "border-green-200 bg-green-50/40"
                                            : "border-red-200 bg-red-50/40";

                                    const iconStyle = unanswered
                                        ? "bg-slate-100 text-slate-500"
                                        : correct
                                            ? "bg-green-100 text-green-600"
                                            : "bg-red-100 text-red-500";

                                    return (
                                        <article
                                            key={
                                                answer.questionId ||
                                                answer.id ||
                                                index
                                            }
                                            className={`overflow-hidden rounded-2xl border shadow-sm ${cardStyle}`}
                                        >
                                            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
                                                <div
                                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
                                                >
                                                    {unanswered ? (
                                                        <FaMinusCircle />
                                                    ) : correct ? (
                                                        <FaCheckCircle />
                                                    ) : (
                                                        <FaTimesCircle />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <span className="text-xs font-bold uppercase tracking-wider text-[#007979]">
                                                            Question {index + 1}
                                                        </span>

                                                        <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm">
                                                            {getPoints(answer)} pt
                                                        </span>
                                                    </div>

                                                    <h3 className="mt-3 text-base font-bold leading-6 text-[#4E1F6E]">
                                                        {getQuestionText(
                                                            answer,
                                                            index
                                                        )}
                                                    </h3>

                                                    <div className="mt-5 space-y-3">
                                                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                                Your answer
                                                            </p>

                                                            <p
                                                                className={`mt-2 text-sm font-medium ${unanswered
                                                                        ? "text-slate-400"
                                                                        : correct
                                                                            ? "text-green-700"
                                                                            : "text-red-600"
                                                                    }`}
                                                            >
                                                                {getSelectedAnswer(
                                                                    answer
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-xl border border-[#65DCD5]/40 bg-[#D9FFF4]/50 p-4">
                                                            <p className="text-xs font-bold uppercase tracking-wide text-[#007979]">
                                                                Correct answer
                                                            </p>

                                                            <p className="mt-2 text-sm font-semibold text-[#007979]">
                                                                {getCorrectAnswer(
                                                                    answer
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    <div className="flex justify-center pb-4">
                        <button
                            type="button"
                            onClick={() => navigate("/student/results")}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#4E1F6E] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#3d1857] hover:shadow-lg"
                        >
                            <FaArrowLeft />
                            Back to my results
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
};

export default ResultStudent;