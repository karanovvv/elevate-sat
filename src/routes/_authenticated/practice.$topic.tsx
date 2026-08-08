import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, CheckCircle2, Timer, XCircle, Sparkles, ArrowRight, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { bookmarksQuery, profileQuery, questionsQuery, type Question } from "@/lib/queries";
import { AiHelperSheet } from "@/components/AiHelperSheet";
import {
  DIFFICULTY_LABEL,
  formatClock,
  nextDifficulty,
  sectionScore,
  topicBySlug,
  type Difficulty,
} from "@/lib/sat";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/practice/$topic")({
  loader: ({ params }) => {
    const topic = topicBySlug(params.topic);
    if (!topic) throw notFound();
    return { topic };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.topic.name ?? "Практика";
    return {
      meta: [
        { title: `${name} — практика Digital SAT` },
        {
          name: "description",
          content: `Вопросы по теме ${name} с таймером, проверкой ответа и объяснением от ИИ.`,
        },
      ],
    };
  },
  component: PracticeSession,
  notFoundComponent: () => (
    <AppShell title="Тема не найдена">
      <Button asChild className="bg-[#8083ff] text-[#1000a9] font-bold">
        <Link to="/practice">Ко всем темам</Link>
      </Button>
    </AppShell>
  ),
});

type Answered = { id: string; correct: boolean };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function PracticeSession() {
  const { topic } = Route.useLoaderData();
  const { user } = useSession();
  const userId = user?.id ?? "";
  const queryClient = useQueryClient();

  const { data: questions = [], isLoading } = useQuery(questionsQuery(topic.dbTopic));
  const { data: profile } = useQuery({ ...profileQuery(userId), enabled: Boolean(userId) });
  const { data: bookmarks = [] } = useQuery({
    ...bookmarksQuery(userId),
    enabled: Boolean(userId),
  });

  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [answered, setAnswered] = useState<Answered[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [saving, setSaving] = useState(false);

  const usedIds = useMemo(() => new Set(answered.map((a) => a.id)), [answered]);

  const pickNext = (pool: Question[], diff: Difficulty, used: Set<string>) => {
    const remaining = pool.filter((q) => !used.has(q.id));
    if (!remaining.length) return null;
    return remaining.find((q) => q.difficulty === diff) ?? remaining[0] ?? null;
  };

  useEffect(() => {
    if (!currentId && questions.length) {
      const next = pickNext(questions, difficulty, usedIds);
      if (next) setCurrentId(next.id);
    }
  }, [questions, currentId, difficulty, usedIds]);

  const current = questions.find((q) => q.id === currentId) ?? null;
  const finished = !isLoading && questions.length > 0 && !current;

  useEffect(() => {
    if (finished || !current) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [finished, currentId, current]);

  const correctCount = answered.filter((a) => a.correct).length;
  const isBookmarked = current ? bookmarks.some((b) => b.question_id === current.id) : false;

  async function toggleBookmark() {
    if (!current || !userId) return;
    try {
      if (isBookmarked) {
        await supabase
          .from("user_bookmarks")
          .delete()
          .eq("user_id", userId)
          .eq("question_id", current.id);
        toast.success("Удалено из закладок");
      } else {
        await supabase
          .from("user_bookmarks")
          .insert({ user_id: userId, question_id: current.id });
        toast.success("Сохранено в «разобрать позже»");
      }
      queryClient.invalidateQueries({ queryKey: ["bookmarks", userId] });
    } catch {
      toast.error("Не удалось обновить закладку");
    }
  }

  async function checkAnswer() {
    if (selected === null || !current || !userId || checked) return;
    const isCorrect = selected === current.correct_index;
    setChecked(true);
    setSaving(true);

    try {
      await supabase.from("user_attempts").insert({
        user_id: userId,
        question_id: current.id,
        is_correct: isCorrect,
        seconds_spent: seconds,
        created_at: new Date().toISOString(),
      });

      const today = todayISO();
      const lastActive = profile?.last_active_date;
      let newStreak = profile?.streak_days ?? 0;

      if (!lastActive) {
        newStreak = 1;
      } else if (lastActive !== today) {
        const diffDays = Math.round(
          (new Date(today).getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24),
        );
        newStreak = diffDays === 1 ? newStreak + 1 : 1;
      }

      await supabase.from("profiles").upsert({
        id: userId,
        streak_days: newStreak,
        last_active_date: today,
        updated_at: new Date().toISOString(),
      });

      queryClient.invalidateQueries({ queryKey: ["attempts", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    } catch {
      toast.error("Ошибка сохранения ответа");
    } finally {
      setSaving(false);
    }
  }

  function goNext() {
    if (!current) return;
    const isCorrect = selected === current.correct_index;
    const newAnswered = [...answered, { id: current.id, correct: isCorrect }];
    setAnswered(newAnswered);
    const newUsed = new Set(newAnswered.map((a) => a.id));

    const nextDiff = nextDifficulty(difficulty, isCorrect);
    setDifficulty(nextDiff);
    setSelected(null);
    setChecked(false);
    setSeconds(0);

    const next = pickNext(questions, nextDiff, newUsed);
    setCurrentId(next ? next.id : null);
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
          <Sparkles className="size-8 text-[#8083ff] animate-spin" />
          <p className="text-sm text-[#c7c4d7]">Загрузка базы вопросов Digital SAT...</p>
        </div>
      </AppShell>
    );
  }

  if (finished) {
    const total = answered.length;
    const accuracy = total ? correctCount / total : 0;
    return (
      <AppShell title="Сессия завершена! 🎉">
        <div className="bg-[#1c1f29]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 shadow-2xl">
          <h2 className="text-3xl font-headline font-bold text-white">Тема: {topic.name}</h2>
          <p className="text-[#c7c4d7] text-sm">
            Вы ответили на все {total} вопросов сессии!
          </p>
          <div className="p-6 rounded-2xl bg-[#181b25] border border-white/5 space-y-2">
            <span className="text-4xl font-headline font-extrabold text-[#4edea3]">
              {Math.round(accuracy * 100)}%
            </span>
            <p className="text-xs text-[#908fa0]">
              Точность ответов · оценка раздела ≈ {sectionScore(accuracy)} баллов
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild className="flex-1 bg-[#8083ff] text-[#1000a9] font-bold py-6 rounded-xl">
              <Link to="/practice">Другая тема</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 border-white/10 text-white hover:bg-[#272a34] py-6 rounded-xl">
              <Link to="/analytics">Прогресс</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!current) return null;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Practice Top Navigation HUD */}
        <div className="bg-[#1c1f29]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="text-[#c7c4d7] hover:text-white hover:bg-white/5">
              <Link to="/practice">← Все темы</Link>
            </Button>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#8083ff]/20 text-[#c0c1ff] border border-[#8083ff]/30">
              {topic.name}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#272a34] text-[#c7c4d7]">
              {DIFFICULTY_LABEL[current.difficulty]}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm font-mono font-semibold text-[#e0e2ef] bg-[#181b25] px-3 py-1.5 rounded-xl border border-white/5">
              <Timer className="size-4 text-[#8083ff]" />
              <span>{formatClock(seconds)}</span>
            </div>

            <AiHelperSheet question={current} topicName={topic.name} floating={false} />

            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-xl border transition-all ${
                isBookmarked
                  ? "bg-[#d2bbff]/20 border-[#d2bbff] text-[#d2bbff]"
                  : "bg-[#181b25] border-white/5 text-[#908fa0] hover:text-white"
              }`}
              title="Разобрать позже"
            >
              {isBookmarked ? <BookmarkCheck className="size-5" /> : <Bookmark className="size-5" />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[#908fa0] font-medium">
            <span>Вопрос {answered.length + 1} из {questions.length}</span>
            <span>Верно: {correctCount}</span>
          </div>
          <Progress className="h-2 bg-[#272a34]" value={(answered.length / questions.length) * 100} />
        </div>

        {/* Question Card Box */}
        <div className="bg-[#1c1f29]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl">
          {current.passage ? (
            <div className="p-5 rounded-2xl bg-[#181b25]/80 border border-white/5 text-sm leading-relaxed text-[#c7c4d7] border-l-4 border-l-[#8083ff]">
              {current.passage}
            </div>
          ) : null}

          <h1 className="text-lg sm:text-xl font-headline font-bold text-white leading-relaxed">
            {current.prompt}
          </h1>

          {/* Choices List */}
          <div className="space-y-3 pt-2">
            {current.choices.map((choice, index) => {
              const isSelected = selected === index;
              const isCorrect = index === current.correct_index;
              const state = checked
                ? isCorrect
                  ? "correct"
                  : isSelected
                    ? "wrong"
                    : "idle"
                : isSelected
                  ? "selected"
                  : "idle";

              return (
                <button
                  key={index}
                  type="button"
                  disabled={checked}
                  onClick={() => setSelected(index)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border p-4 sm:p-5 text-left text-sm transition-all duration-200",
                    state === "idle" && "bg-[#181b25]/50 border-white/5 text-[#e0e2ef] hover:bg-[#272a34]/60 hover:border-white/20",
                    state === "selected" && "bg-[#8083ff]/20 border-[#8083ff] text-white shadow-[0_0_15px_rgba(128,131,255,0.2)]",
                    state === "correct" && "bg-[#4edea3]/20 border-[#4edea3] text-[#4edea3] font-semibold",
                    state === "wrong" && "bg-rose-500/20 border-rose-500 text-rose-300",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-xl font-bold text-xs shadow-md transition-colors",
                      state === "selected" ? "bg-[#8083ff] text-[#1000a9]" : "bg-[#272a34] text-white",
                    )}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 text-sm font-medium leading-normal">{choice}</span>
                  {state === "correct" ? <CheckCircle2 className="size-5 text-[#4edea3] shrink-0" /> : null}
                  {state === "wrong" ? <XCircle className="size-5 text-rose-400 shrink-0" /> : null}
                </button>
              );
            })}
          </div>

          {/* Solution Explanation Box */}
          {checked ? (
            <div className="p-6 rounded-2xl bg-[#181b25] border border-white/10 space-y-2 animate-fadeIn">
              <h4 className="text-sm font-bold text-[#c0c1ff] flex items-center gap-2">
                <Sparkles className="size-4 text-[#d2bbff]" />
                {selected === current.correct_index ? "Отлично! Верное решение" : "Разбор решения"}
              </h4>
              <p className="text-sm text-[#c7c4d7] leading-relaxed">
                {current.explanation}
              </p>
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="pt-4 flex gap-4">
            {checked ? (
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-[#8083ff] to-[#6001d1] text-white font-bold py-6 rounded-2xl shadow-[0_0_20px_rgba(128,131,255,0.3)] hover:scale-102 transition-all gap-2"
                onClick={goNext}
              >
                <span>Следующий вопрос</span>
                <ArrowRight className="size-5" />
              </Button>
            ) : (
              <Button
                size="lg"
                disabled={selected === null || saving}
                className="w-full bg-gradient-to-r from-[#8083ff] to-[#6001d1] text-white font-bold py-6 rounded-2xl shadow-[0_0_20px_rgba(128,131,255,0.3)] hover:scale-102 transition-all disabled:opacity-40"
                onClick={checkAnswer}
              >
                Проверить ответ
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
