import { useState } from "react";

const Question = ({ question, onSave, onDelete }) => {
  const [content, setContent] = useState(question?.content || "");
  const [points, setPoints] = useState(question?.points || 1);
  const [choices, setChoices] = useState(
    question?.choices || [
      { id: 1, content: "", isCorrect: true },
      { id: 2, content: "", isCorrect: false },
    ]
  );

  const updateChoice = (id, value) => {
    setChoices((currentChoices) =>
      currentChoices.map((choice) =>
        choice.id === id
          ? { ...choice, content: value }
          : choice
      )
    );
  };

  const setCorrectChoice = (id) => {
    setChoices((currentChoices) =>
      currentChoices.map((choice) => ({
        ...choice,
        isCorrect: choice.id === id,
      }))
    );
  };

  const addChoice = () => {
    if (choices.length >= 6) return;

    setChoices((currentChoices) => [
      ...currentChoices,
      {
        id: Date.now(),
        content: "",
        isCorrect: false,
      },
    ]);
  };

  const removeChoice = (id) => {
    if (choices.length <= 2) return;

    const choiceToRemove = choices.find((choice) => choice.id === id);

    setChoices((currentChoices) =>
      currentChoices.filter((choice) => choice.id !== id)
    );

    if (choiceToRemove?.isCorrect) {
      setChoices((currentChoices) =>
        currentChoices.map((choice, index) => ({
          ...choice,
          isCorrect: index === 0,
        }))
      );
    }
  };

  const handleSave = (event) => {
    event.preventDefault();

    onSave?.({
      content,
      points: Number(points),
      choices,
    });
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#4E1F6E]">
              Question
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add the question and possible answers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="points"
              className="text-sm font-medium text-[#1D546C]"
            >
              Points
            </label>

            <input
              id="points"
              type="number"
              min="1"
              value={points}
              onChange={(event) => setPoints(event.target.value)}
              className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-semibold text-[#4E1F6E] outline-none transition focus:border-[#007979] focus:ring-2 focus:ring-[#65DCD5]/40"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="question-content"
            className="mb-2 block text-sm font-semibold text-[#1D546C]"
          >
            Question content
          </label>

          <textarea
            id="question-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your question..."
            rows="4"
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#007979] focus:bg-white focus:ring-2 focus:ring-[#65DCD5]/40"
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#1D546C]">
                Answer choices
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Between 2 and 6 choices, with one correct answer.
              </p>
            </div>

            <span className="rounded-full bg-[#D9FFF4] px-3 py-1 text-xs font-semibold text-[#007979]">
              {choices.length}/6
            </span>
          </div>

          <div className="space-y-3">
            {choices.map((choice, index) => (
              <div
                key={choice.id}
                className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                  choice.isCorrect
                    ? "border-[#007979] bg-[#D9FFF4]/50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setCorrectChoice(choice.id)}
                  aria-label={`Set answer ${index + 1} as correct`}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                    choice.isCorrect
                      ? "border-[#007979] bg-[#007979] text-white"
                      : "border-slate-300 bg-white text-slate-400 hover:border-[#007979] hover:text-[#007979]"
                  }`}
                >
                  {choice.isCorrect
                    ? "✓"
                    : String.fromCharCode(65 + index)}
                </button>

                <input
                  type="text"
                  value={choice.content}
                  onChange={(event) =>
                    updateChoice(choice.id, event.target.value)
                  }
                  placeholder={`Answer ${index + 1}`}
                  className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />

                <button
                  type="button"
                  onClick={() => removeChoice(choice.id)}
                  disabled={choices.length <= 2}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Remove answer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addChoice}
            disabled={choices.length >= 6}
            className="mt-4 rounded-xl border border-dashed border-[#007979] px-4 py-2.5 text-sm font-semibold text-[#007979] transition hover:bg-[#D9FFF4] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
          >
            + Add answer
          </button>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50"
            >
              Delete
            </button>
          )}

          <button
            type="submit"
            className="rounded-xl bg-[#4E1F6E] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3f1859] hover:shadow-md"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default Question;