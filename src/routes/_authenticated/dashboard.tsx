import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  ArrowRight,
  BookmarkCheck,
  CalendarDays,
  Flame,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { useSession } from "@/hooks/use-session";
import { attemptsQuery, bookmarksQuery, buildStats, profileQuery } from "@/lib/queries";
import { TOPICS } from "@/lib/sat";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Личный кабинет — SATPrep" },
      {
        name: "description",
        content: "Ваш прогресс, задания на сегодня, серия дней и слабые темы подготовки к SAT.",
      },
      { property: "og:title", content: "Личный кабинет — SATPrep" },
      { property: "og:description", content: "Прогресс по баллам, streak и рекомендации на день." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useSession();
  const navigate = useNavigate();
  const userId = user?.id ?? "";
  const enabled = Boolean(userId);

  const { data: profile } = useQuery({ ...profileQuery(userId), enabled });
  const { data: attempts = [] } = useQuery({ ...attemptsQuery(userId), enabled });
  const { data: bookmarks = [] } = useQuery({ ...bookmarksQuery(userId), enabled });

  useEffect(() => {
    if (profile && !profile.onboarded) navigate({ to: "/onboarding", replace: true });
  }, [profile, navigate]);

  const stats = buildStats(attempts);
  const target = profile?.target_score ?? 1400;
  const daysLeft = profile?.exam_date
    ? Math.max(
        0,
        Math.ceil(
          (new Date(profile.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  const untouched = stats.topics.filter((t) => t.total === 0);
  const recommended = [...stats.weakest, ...untouched].slice(0, 3);
  const chartData = stats.daily.length
    ? stats.daily.map((d) => ({ ...d, label: d.date.slice(5) }))
    : [];

  const firstName = profile?.full_name?.split(" ")[0] ?? "друг";

  return (
    <AppShell
      title={`Привет, ${firstName}!`}
      subtitle={
        daysLeft !== null
          ? `До экзамена ${daysLeft} дн. Цель — ${target} баллов.`
          : `Цель — ${target} баллов. Укажите дату экзамена в профиле.`
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={<TrendingUp className="size-4" />}
          label="Оценка балла"
          value={stats.total ? String(stats.estimatedScore) : "—"}
          hint={stats.total ? `по ${stats.total} ответам` : "решите первые вопросы"}
        />
        <StatTile
          icon={<Flame className="size-4 text-accent" />}
          label="Серия дней"
          value={String(profile?.streak_days ?? 0)}
          hint="занимайтесь каждый день"
        />
        <StatTile
          icon={<Target className="size-4" />}
          label="Точность"
          value={stats.total ? `${Math.round(stats.accuracy * 100)}%` : "—"}
          hint={`${stats.correct} из ${stats.total} верно`}
        />
        <StatTile
          icon={<BookmarkCheck className="size-4" />}
          label="Разобрать позже"
          value={String(bookmarks.length)}
          hint="вопросов в закладках"
        />
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Динамика балла</h2>
            <Badge variant="secondary">оценка 400–1600</Badge>
          </div>
          {chartData.length > 1 ? (
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis domain={[400, 1600]} stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--chart-1)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name="Балл"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              График появится после занятий в двух разных днях. Решите несколько вопросов, чтобы
              начать историю прогресса.
            </p>
          )}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Путь к цели {target}</span>
              <span className="font-semibold">
                {stats.total ? Math.round((stats.estimatedScore / target) * 100) : 0}%
              </span>
            </div>
            <Progress
              className="mt-2 h-2"
              value={stats.total ? Math.min(100, (stats.estimatedScore / target) * 100) : 0}
            />
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-lg font-semibold">Задания на сегодня</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile?.daily_minutes ?? 30} минут — примерно {Math.max(5, Math.round((profile?.daily_minutes ?? 30) / 2))} вопросов.
          </p>
          <ul className="mt-4 space-y-3">
            {recommended.map((topic) => (
              <li key={topic.slug} className="rounded-xl border border-border p-3">
                <p className="text-sm font-semibold">{topic.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {topic.total
                    ? `точность ${Math.round(topic.accuracy * 100)}% — стоит подтянуть`
                    : "новая тема — попробуйте"}
                </p>
                <Button asChild size="sm" variant="secondary" className="mt-3 w-full">
                  <Link to="/practice/$topic" params={{ topic: topic.slug }}>
                    Тренировать
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6 surface-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Слабые темы</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/practice">Все темы</Link>
          </Button>
        </div>
        {stats.weakest.length ? (
          <ul className="mt-4 space-y-4">
            {stats.weakest.map((t) => (
              <li key={t.slug}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted-foreground">
                    {t.correct}/{t.total}
                  </span>
                </div>
                <Progress className="mt-2 h-2" value={t.accuracy * 100} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Пока нет данных. Начните с темы {TOPICS[0]?.name} — она даст первую диагностику.
          </p>
        )}
      </section>

      <section className="mt-6 surface-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
        <CalendarDays className="size-8 text-primary" />
        <div className="flex-1">
          <h2 className="font-semibold">Полные пробные тесты</h2>
          <p className="text-sm text-muted-foreground">
            Адаптивные модули с итоговым баллом 400–1600 появятся в следующей итерации. Пока
            тренируйтесь по темам — оценка балла считается автоматически.
          </p>
        </div>
      </section>
    </AppShell>
  );
}

function StatTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
