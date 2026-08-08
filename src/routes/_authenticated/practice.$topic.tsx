import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, CheckCircle2, Timer, XCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
        { title: `${name} — практика SAT` },
        {
          name: "description",
          content: `Вопросы по теме ${name} с таймером, проверкой ответа и подробным объяснением решения.`,
        },
        { property: "og:title", content: `${name} — практика SAT` },
        {
          property: "og:description",
          content: `Тренировка темы ${name} с адаптивной сложностью.`,
        },
      ],
    };
  },
  component: PracticeSession,
  notFoundComponent: () => (
    <AppShell title="Тема не найдена">
      <Button asChild>
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
    if (checked || !current) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [checked, current]);

  const isBookmarked = bookmarks.some(
    (b) => (b as { question_id: string }).question_id === current?.id,
  );

  async function updateStreak() {
    if (!user || !profile) return;
    const today = todayISO();
    if (profile.last_practice_date === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const streak = profile.last_practice_date === yesterday ? profile.streak_days + 1 : 1;
    await supabase
      .from("profiles")
      .update({ streak_days: streak, last_practice_date: today })
      .eq("id", user.id);
    await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
  }

  async function checkAnswer() {
    if (!current || selected === null || !user) return;
    setSaving(true);
    const correct = selected === current.correct_index;
    const { error } = await supabase.from("question_attempts").insert({
      user_id: user.id,
      question_id: current.id,
      selected_index: selected,
      is_correct: correct,
      seconds_spent: seconds,
    });
    setSaving(false);
    if (error) {
      toast.error("Не удалось сохранить ответ");
      return;
    }
    setChecked(true);
    setAnswered((prev) => [...prev, { id: current.id, correct }]);
    setDifficulty(nextDifficulty(current.difficulty, correct));
    await updateStreak();
    await queryClient.invalidateQueries({ queryKey: ["attempts", user.id] });
  }

  function goNext() {
    const next = pickNext(questions, difficulty, new Set([...usedIds, current?.id ?? ""]));
    setCurrentId(next?.id ?? null);
    setSelected(null);
    setChecked(false);
    setSeconds(0);
  }

  async function toggleBookmark() {
    if (!current || !user) return;
    if (isBookmarked) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("question_id", current.id);
      toast.success("Убрано из закладок");
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, question_id: current.id });
      toast.success("Добавлено в «разобрать позже»");
    }
    await queryClient.invalidateQueries({ queryKey: ["bookmarks", user.id] });
  }

  const correctCount = answered.filter((a) => a.correct).length;
  const accuracy = answered.length ? correctCount / answered.length : 0;

  if (isLoading) {
    return (
      <AppShell title={topic.name}>
        <p className="text-sm text-muted-foreground">Загружаем вопросы…</p>
      </AppShell>
    );
  }

  if (!questions.length) {
    return (
      <AppShell title={topic.name} subtitle="Вопросы по этой теме скоро появятся">
        <Button asChild>
          <Link to="/practice">Выбрать другую тему</Link>
        </Button>
      </AppShell>
    );
  }

  if (finished) {
    return (
      <AppShell title="Сессия завершена" subtitle={topic.name}>
        <div className="surface-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Правильных ответов</p>
          <p className="mt-1 text-4xl font-extrabold text-primary">
            {correctCount}/{answered.length}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Точность {Math.round(accuracy * 100)}% · оценка раздела ≈ {sectionScore(accuracy)} баллов
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link to="/practice">Другая тема</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/analytics">Смотреть прогресс</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!current) return null;

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/practice">← Темы</Link>
        </Button>
        <Badge variant="secondary">{topic.name}</Badge>
        <Badge
          className={cn(
            current.difficulty === "Easy" && "bg-success-soft text-success",
            current.difficulty === "Medium" && "bg-primary-soft text-primary",
            current.difficulty === "Hard" && "bg-warning-soft text-warning-foreground",
          )}
        >
          {DIFFICULTY_LABEL[current.difficulty]}
        </Badge>
        <span className="ml-auto flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums mr-2">
            <Timer className="size-4 text-muted-foreground" />
            {formatClock(seconds)}
          </span>
          <AiHelperSheet question={current} topicName={topic.name} floating={false} />
        </span>
        <Button variant="ghost" size="icon" onClick={toggleBookmark} aria-label="Разобрать позже">
          {isBookmarked ? (
            <BookmarkCheck className="size-5 text-accent" />
          ) : (
            <Bookmark className="size-5" />
          )}
        </Button>
      </div>

      <Progress className="h-1.5" value={(answered.length / questions.length) * 100} />
      <p className="mt-2 text-xs text-muted-foreground">
        Вопрос {answered.length + 1} из {questions.length} · верно {correctCount}
      </p>

      <div className="surface-card mt-4 p-5">
        {current.passage ? (
          <p className="mb-4 rounded-xl bg-secondary p-4 text-sm leading-relaxed">
            {current.passage}
          </p>
        ) : null}
        <h1 className="text-lg leading-relaxed font-semibold">{current.prompt}</h1>

        <div className="mt-5 space-y-3">
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
                  "flex w-full items-center gap-3 rounded-xl border border-border p-4 text-left text-sm transition-colors",
                  state === "idle" && "hover:bg-secondary",
                  state === "selected" && "border-primary bg-primary-soft",
                  state === "correct" && "border-success bg-success-soft",
                  state === "wrong" && "border-destructive bg-destructive-soft",
                )}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-card text-xs font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{choice}</span>
                {state === "correct" ? <CheckCircle2 className="size-5 text-success" /> : null}
                {state === "wrong" ? <XCircle className="size-5 text-destructive" /> : null}
              </button>
            );
          })}
        </div>

        {checked ? (
          <div className="mt-5 rounded-xl bg-secondary p-4">
            <p className="text-sm font-semibold">
              {selected === current.correct_index ? "Верно!" : "Разбор решения"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {current.explanation}
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex gap-3">
          {checked ? (
            <Button className="flex-1" size="lg" onClick={goNext}>
              Следующий вопрос
            </Button>
          ) : (
            <Button
              className="flex-1"
              size="lg"
              disabled={selected === null || saving}
              onClick={checkAnswer}
            >
              Проверить ответ
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
