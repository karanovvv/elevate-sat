import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { bookmarksQuery, labelForDbTopic, profileQuery } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Профиль и настройки — SATPrep" },
      {
        name: "description",
        content: "Целевой балл, дата экзамена, время занятий, уведомления и закладки вопросов.",
      },
      { property: "og:title", content: "Профиль и настройки — SATPrep" },
      { property: "og:description", content: "Настройте цель и план подготовки к SAT." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useSession();
  const userId = user?.id ?? "";
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({ ...profileQuery(userId), enabled: Boolean(userId) });
  const { data: bookmarks = [] } = useQuery({
    ...bookmarksQuery(userId),
    enabled: Boolean(userId),
  });

  const [name, setName] = useState("");
  const [target, setTarget] = useState("1400");
  const [examDate, setExamDate] = useState("");
  const [minutes, setMinutes] = useState("30");
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.full_name ?? "");
    setTarget(String(profile.target_score ?? 1400));
    setExamDate(profile.exam_date ?? "");
    setMinutes(String(profile.daily_minutes ?? 30));
    setNotify(profile.notifications_enabled);
  }, [profile]);

  async function save() {
    if (!user) return;
    const targetNumber = Number(target);
    if (Number.isNaN(targetNumber) || targetNumber < 400 || targetNumber > 1600) {
      toast.error("Целевой балл должен быть от 400 до 1600");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name.trim().slice(0, 80) || null,
        target_score: Math.round(targetNumber / 10) * 10,
        exam_date: examDate || null,
        daily_minutes: Number(minutes) || 30,
        notifications_enabled: notify,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      toast.error("Не удалось сохранить настройки");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    toast.success("Настройки сохранены");
  }

  async function removeBookmark(id: string) {
    await supabase.from("bookmarks").delete().eq("id", id);
    await queryClient.invalidateQueries({ queryKey: ["bookmarks", userId] });
  }

  return (
    <AppShell title="Профиль" subtitle={profile?.email ?? user?.email ?? ""}>
      <section className="surface-card p-5">
        <h2 className="text-lg font-semibold">Настройки подготовки</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input id="name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target">Целевой балл</Label>
            <Input
              id="target"
              type="number"
              min={400}
              max={1600}
              step={10}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam">Дата экзамена</Label>
            <Input
              id="exam"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minutes">Минут в день</Label>
            <Input
              id="minutes"
              type="number"
              min={5}
              max={240}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between rounded-xl border border-border p-4">
          <div>
            <p className="font-medium">Напоминания о занятиях</p>
            <p className="text-sm text-muted-foreground">
              Присылать напоминание, если серия дней под угрозой
            </p>
          </div>
          <Switch checked={notify} onCheckedChange={setNotify} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={save} disabled={busy}>
            Сохранить
          </Button>
          <Button asChild variant="outline">
            <Link to="/onboarding">Пройти опрос заново</Link>
          </Button>
        </div>
      </section>

      <section className="surface-card mt-6 p-5">
        <h2 className="text-lg font-semibold">Разобрать позже ({bookmarks.length})</h2>
        {bookmarks.length ? (
          <ul className="mt-4 space-y-3">
            {bookmarks.map((b) => {
              const row = b as {
                id: string;
                questions: { topic: string; prompt: string; explanation: string } | null;
              };
              return (
                <li key={row.id} className="rounded-xl border border-border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {labelForDbTopic(row.questions?.topic ?? "")}
                  </p>
                  <p className="mt-2 text-sm font-medium">{row.questions?.prompt}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{row.questions?.explanation}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => removeBookmark(row.id)}
                  >
                    Убрать из закладок
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Пока пусто. Отмечайте сложные вопросы закладкой во время практики.
          </p>
        )}
      </section>
    </AppShell>
  );
}
