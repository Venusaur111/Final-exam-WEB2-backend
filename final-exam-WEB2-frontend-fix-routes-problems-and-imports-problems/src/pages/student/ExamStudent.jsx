import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCheck, FaClock, FaPaperPlane } from 'react-icons/fa';
import { getMyExam, submitExam } from "../../api/student";
import { ErrorAlert, Loading, Modal, PageHeader } from "../../components/UI";


const ExamStudent = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadExam = async () => {
            try {
                setLoading(true);
                setError('');

                const data = await getMyExam(id);
                setExam(data);
            } catch (err) {
                setError(err.message || 'Unable to load the exam.');
            } finally {
                setLoading(false);
            }
        };

        loadExam();
    }, [id]);

    const handleAnswerChange = (questionId, choiceId) => {
        setAnswers((currentAnswers) => ({
            ...currentAnswers,
            [questionId]: choiceId,
        }));
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setError('');

            const questions = exam.questions || [];

            const payload = questions
                .filter((question) => answers[question.id] != null)
                .map((question) => ({
                    questionId: question.id,
                    choiceId: answers[question.id],
                }));

            const result = await submitExam(id, payload);

            navigate(`/student/exams/${id}/result`, {
                replace: true,
                state: { result },
            });
        } catch (err) {
            setError(err.message || 'Unable to submit the exam.');
            setConfirmOpen(false);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (!exam) {
        return (
            <ErrorAlert
                message={error || 'Exam not found.'}
            />
        );
    }

    const questions = exam.questions || [];

    const unansweredCount = questions.filter(
        (question) => answers[question.id] == null
    ).length;

    return (
        <>
            <div className="min-h-full bg-[#D9FFF4]">
                <PageHeader
                    title={exam.title}
                    subtitle={
                        exam.description ||
                        'Complete the questions and submit your exam.'
                    }
                />

                <ErrorAlert message={error} />

                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#65DCD5] bg-white p-5 shadow-[0_8px_24px_rgba(29,84,108,0.08)]">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#1D546C]">
                        <FaClock className="text-[#007979]" />

                        {exam.endAt || exam.endDate
                            ? `Available until ${new Date(
                                exam.endAt || exam.endDate
                            ).toLocaleString('en-US')}`
                            : 'Availability information unavailable'}
                    </div>

                    <div className="rounded-full bg-[#4E1F6E] px-4 py-2 text-sm font-semibold text-white">
                        {questions.length} question
                        {questions.length !== 1 ? 's' : ''}
                    </div>
                </div>

                <div className="space-y-6">
                    {questions.map((question, index) => (
                        <section
                            key={question.id}
                            className="rounded-2xl border border-[#65DCD5] bg-white p-6 shadow-[0_10px_30px_rgba(29,84,108,0.08)]"
                        >
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <span className="rounded-full bg-[#4E1F6E] px-4 py-2 text-sm font-bold text-white">
                                    Question {index + 1}
                                </span>

                                <span className="text-sm font-semibold text-[#007979]">
                                    {question.points} point
                                    {Number(question.points) !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <h2 className="mb-6 text-xl font-bold leading-relaxed text-[#1D546C]">
                                {question.statement ||
                                    question.text ||
                                    question.question}
                            </h2>

                            <div className="space-y-3">
                                {(question.choices || []).map((choice) => {
                                    const selected =
                                        answers[question.id] === choice.id;

                                    return (
                                        <label
                                            key={choice.id}
                                            className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition ${selected
                                                    ? 'border-[#007979] bg-[#D9FFF4] text-[#007979]'
                                                    : 'border-gray-200 bg-white text-[#1D546C] hover:border-[#65DCD5] hover:bg-[#D9FFF4]/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    value={choice.id}
                                                    checked={selected}
                                                    onChange={() =>
                                                        handleAnswerChange(
                                                            question.id,
                                                            choice.id
                                                        )
                                                    }
                                                    className="h-5 w-5 accent-[#007979]"
                                                />

                                                <span className="font-medium">
                                                    {choice.text || choice.label}
                                                </span>
                                            </div>

                                            {selected && (
                                                <FaCheck className="text-[#007979]" />
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="sticky bottom-4 z-10 mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#65DCD5] bg-white p-5 shadow-[0_10px_30px_rgba(29,84,108,0.15)]">
                    <span className="text-sm font-medium text-[#1D546C]">
                        {unansweredCount > 0
                            ? `${unansweredCount} unanswered question${unansweredCount !== 1 ? 's' : ''
                            }`
                            : 'All questions have been answered.'}
                    </span>

                    <button
                        type="button"
                        onClick={() => setConfirmOpen(true)}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#4E1F6E] px-6 py-3 font-semibold text-white transition hover:bg-[#3d1857] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <FaPaperPlane />
                        Submit exam
                    </button>
                </div>

                <Modal
                    open={confirmOpen}
                    title="Confirm submission"
                    onClose={() =>
                        !submitting && setConfirmOpen(false)
                    }
                >
                    <div className="space-y-5">
                        <p className="text-[#1D546C]">
                            Once you submit the exam, your answers cannot be
                            changed.
                        </p>

                        {unansweredCount > 0 && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
                                You have {unansweredCount} unanswered question
                                {unansweredCount !== 1 ? 's' : ''}. Unanswered
                                questions will receive 0 points.
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmOpen(false)}
                                disabled={submitting}
                                className="rounded-xl border border-[#007979] px-5 py-3 font-semibold text-[#007979] transition hover:bg-[#D9FFF4] disabled:opacity-50"
                            >
                                Continue exam
                            </button>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#4E1F6E] px-5 py-3 font-semibold text-white transition hover:bg-[#3d1857] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <FaPaperPlane />
                                {submitting
                                    ? 'Submitting...'
                                    : 'Confirm submission'}
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </>
    )
}

export default ExamStudent;