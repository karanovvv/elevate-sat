import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { profileQuery } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Настройка плана — SATPrep" },
      {
        name: "description",
        content: "Ответьте на 4 вопроса, чтобы получить персональный план подготовки к SAT.",
      },
      { property: "og:title", content: "Настройка плана — SATPrep" },
      { property: "og:description", content: "Уровень, целевой балл, дата экзамена и время в день." },
    ],
  }),
  component: Onboarding,
});

const LEVELS = [
  { value: "beginner", label: "Только начинаю", hint: "Ещё не сдавал(а) пробный тест" },
  { value: "intermediate", label: "Средний уровень", hint: "Примерно 1000–1250" },
  { value: "advanced", label: "Сильный уровень", hint: "1300 и выше" },
];

const MINUTES = [15, 30, 45, 60];

function Onboarding() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState("intermediate");
  const [target, setTarget] = useState(1400);
  const [examDate, setExamDate] = useState("");
  const [minutes, setMinutes] = useState(30);
  const [busy, setBusy] = useState(false);

  const { data: profile } = useQuery({
    ...profileQuery(user?.id ?? ""),
    enabled: Boolean(user?.id),
  });

  async function finish() {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        current_level: level,
        target_score: target,
        exam_date: examDate || null,
        daily_minutes: minutes,
        onboarded: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      toast.error("Не удалось сохранить план");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    toast.success("План готов!");
    navigate({ to: "/dashboard" });
  }

  const steps = [
    {
      title: "Какой у вас уровень сейчас?",
      body: (
        <div className="space-y-3">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLevel(l.value)}
              className={cn(
                "w-full rounded-xl border border-border p-4 text-left transition-colors",
                level === l.value ? "border-primary bg-primary-soft" : "hover:bg-secondary",
              )}
            >
              <span className="font-semibold">{l.label}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{l.hint}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Какой балл хотите получить?",
      body: (
        <div className="space-y-4">
          <div className="text-center text-4xl font-extrabold text-primary">{target}</div>
          <input
            type="range"
            min={400}
            max={1600}
            step={10}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="w-full accent-[var(--primary)]"
            aria-label="Целевой балл"
          />
          <p className="text-center text-sm text-muted-foreground">Шкала Digital SAT: 400–1600</p>
        </div>
      ),
    },
    {
      title: "Когда экзамен?",
      body: (
        <div className="space-y-2">
          <Label htmlFor="exam-date">Дата экзамена</Label>
          <Input
            id="exam-date"
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Можно пропустить — дату получится указать позже в профиле.
          </p>
        </div>
      ),
    },
    {
      title: "Сколько минут в день готовы заниматься?",
      body: (
        <div className="grid grid-cols-2 gap-3">
          {MINUTES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMinutes(m)}
              className={cn(
                "rounded-xl border border-border p-4 font-semibold transition-colors",
                minutes === m ? "border-primary bg-primary-soft text-primary" : "hover:bg-secondary",
              )}
            >
              {m} минут
            </button>
          ))}
        </div>
      ),
    },
  ];

  const current = steps[step];

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <div className="surface-card p-6">
        <Progress value={((step + 1) / steps.length) * 100} className="h-2" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Шаг {step + 1} из {steps.length}
        </p>
        <h1 className="mt-2 text-2xl font-bold">{current?.title}</h1>
        <div className="mt-6">{current?.body}</div>
        <div className="mt-8 flex gap-3">
          {step > 0 ? (
            <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
              Назад
            </Button>
          ) : null}
          {step < steps.length - 1 ? (
            <Button className="flex-1" onClick={() => setStep(step + 1)}>
              Далее
            </Button>
          ) : (
            <Button className="flex-1" disabled={busy} onClick={finish}>
              {profile?.onboarded ? "Обновить план" : "Готово"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
