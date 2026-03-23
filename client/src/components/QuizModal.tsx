import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, Brain, ChevronRight, CheckCircle2, XCircle, Loader2, Trophy, RotateCcw } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizModalProps {
  lessonId: string;
  lessonTitle: string;
  lessonContent: string;
  onClose: () => void;
}

type Phase = "loading" | "quiz" | "results";

export default function QuizModal({ lessonId, lessonTitle, lessonContent, onClose }: QuizModalProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<Array<{ questionIndex: number; selectedIndex: number; isCorrect: boolean }>>([]);
  const [score, setScore] = useState(0);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lessonId, lessonTitle, lessonContent }),
      });
      if (!res.ok) throw new Error("Failed to generate quiz");
      return res.json();
    },
    onSuccess: (data) => {
      setQuestions(data.questions);
      setPhase("quiz");
    },
    onError: () => setPhase("loading"),
  });

  const saveResultMutation = useMutation({
    mutationFn: async (data: { score: number; total: number; answers: typeof answers }) => {
      await fetch("/api/ai/quiz-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          lessonId,
          lessonTitle,
          score: data.score,
          totalQuestions: data.total,
          answers: data.answers,
        }),
      });
    },
  });

  // Start the quiz
  if (phase === "loading" && !generateMutation.isPending && !generateMutation.isError) {
    generateMutation.mutate();
  }

  function handleSelect(optionIndex: number) {
    if (answered) return;
    setSelected(optionIndex);
  }

  function handleConfirm() {
    if (selected === null || answered) return;
    const q = questions[current];
    const isCorrect = selected === q.correctIndex;
    const newAnswers = [...answers, { questionIndex: current, selectedIndex: selected, isCorrect }];
    const newScore = score + (isCorrect ? 1 : 0);

    setAnswered(true);
    setAnswers(newAnswers);
    setScore(newScore);

    // Auto-advance after 1.8 seconds
    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
        setSelected(null);
        setAnswered(false);
      } else {
        saveResultMutation.mutate({ score: newScore, total: questions.length, answers: newAnswers });
        setPhase("results");
      }
    }, 1800);
  }

  function restart() {
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setAnswers([]);
    setScore(0);
    setPhase("loading");
    generateMutation.reset();
  }

  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const q = questions[current];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#1a1840] rounded-2xl border border-indigo-600/40 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#312e7a] to-[#1e1b4b] border-b border-indigo-700/40">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Test Your Knowledge</p>
              <p className="text-[11px] text-indigo-400 truncate max-w-[220px]">{lessonTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-indigo-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Loading */}
        {phase === "loading" && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            {generateMutation.isError ? (
              <>
                <XCircle className="h-10 w-10 text-red-400" />
                <p className="text-red-400 text-sm">Failed to generate quiz.</p>
                <button onClick={() => { generateMutation.reset(); generateMutation.mutate(); }} className="btn-gold rounded-xl px-4 py-2 text-sm">
                  Try Again
                </button>
              </>
            ) : (
              <>
                <Loader2 className="h-8 w-8 text-brand-gold animate-spin" />
                <p className="text-muted-foreground text-sm">Generating your quiz...</p>
              </>
            )}
          </div>
        )}

        {/* Quiz */}
        {phase === "quiz" && q && (
          <div className="p-5 space-y-5">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Question {current + 1} of {questions.length}</span>
                <span>{score} correct</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${((current) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <p className="text-white font-semibold leading-relaxed">{q.question}</p>

            {/* Options */}
            <div className="space-y-2.5">
              {q.options.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrect = i === q.correctIndex;
                let style = "bg-white/5 border-white/15 text-muted-foreground hover:bg-white/8 hover:border-indigo-500/40 hover:text-white";
                if (answered) {
                  if (isCorrect) style = "bg-emerald-500/20 border-emerald-500/60 text-emerald-300";
                  else if (isSelected && !isCorrect) style = "bg-red-500/20 border-red-500/60 text-red-300";
                  else style = "bg-white/3 border-white/10 text-muted-foreground";
                } else if (isSelected) {
                  style = "bg-indigo-500/20 border-indigo-500/60 text-white";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={answered}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${style} disabled:cursor-default`}
                  >
                    <span className="inline-block w-5 h-5 rounded-full border border-current text-center text-[10px] leading-5 mr-2.5 flex-shrink-0 font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {answered && (
              <div className={`rounded-xl p-4 text-xs leading-relaxed border ${
                selected === q.correctIndex
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}>
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {selected === q.correctIndex
                    ? <><CheckCircle2 className="h-3.5 w-3.5" /> Correct!</>
                    : <><XCircle className="h-3.5 w-3.5" /> Incorrect</>
                  }
                </div>
                <p className="text-indigo-200">{q.explanation}</p>
              </div>
            )}

            {/* Submit button */}
            {!answered && (
              <button
                onClick={handleConfirm}
                disabled={selected === null}
                className="w-full btn-gold rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Submit Answer
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {phase === "results" && (
          <div className="p-6 space-y-5 text-center">
            <div className={`h-16 w-16 rounded-2xl mx-auto flex items-center justify-center ${
              pct >= 80 ? "bg-emerald-500/20" : pct >= 60 ? "bg-yellow-500/20" : "bg-red-500/20"
            }`}>
              <Trophy className={`h-8 w-8 ${pct >= 80 ? "text-emerald-400" : pct >= 60 ? "text-yellow-400" : "text-red-400"}`} />
            </div>

            <div>
              <p className="text-4xl font-bold text-white">{pct}%</p>
              <p className="text-muted-foreground text-sm mt-1">
                {score} out of {questions.length} correct
              </p>
            </div>

            <p className="text-sm text-indigo-200 leading-relaxed">
              {pct >= 80
                ? "Excellent! You have a strong grasp of this lesson. You're ready to apply these concepts."
                : pct >= 60
                ? "Good effort! Review the concepts you missed and try again to reinforce your understanding."
                : "This lesson has more to offer. Review the material and retake the quiz to solidify your learning."}
            </p>

            {/* Answer breakdown */}
            <div className="grid grid-cols-5 gap-2 py-2">
              {answers.map((a, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full ${a.isCorrect ? "bg-emerald-500" : "bg-red-500"}`}
                  title={`Q${i + 1}: ${a.isCorrect ? "Correct" : "Incorrect"}`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={restart}
                className="flex-1 flex items-center justify-center gap-2 text-sm border border-border text-muted-foreground hover:text-white hover:border-white/30 rounded-xl py-2.5 transition-all"
              >
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </button>
              <button
                onClick={onClose}
                className="flex-1 btn-gold rounded-xl py-2.5 text-sm font-semibold"
              >
                Continue Learning
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
