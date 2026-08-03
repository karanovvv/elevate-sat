import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { useSession } from "@/hooks/use-session";
import { attemptsQuery, buildStats, testAttemptsQuery } from "@/lib/queries";
import { sectionScore } from "@/lib/sat";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Прогресс и аналитика — SATPrep" },
      {
        name: "description",
        content: "Графики роста баллов, сильные и слабые темы, история занятий и пробных тестов.",
      },
      { property: "og:title", content: "Прогресс и аналитика — SATPrep" },
      { property: "og:description", content: "Точность по темам и динамика оценки балла SAT." },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const { user } = useSession();
  const userId = user?.id ?? "";
  const enabled = Boolean(userId);
  const { data: attempts = [] } = useQuery({ ...attemptsQuery(userId), enabled });
  const { data: tests = [] } = useQuery({ ...testAttemptsQuery(userId), enabled });
  const stats = buildStats(attempts);

  const lineData = stats.daily.map((d) => ({ ...d, label: d.date.slice(5) }));
  const barData = stats.topics
    .filter((t) => t.total > 0)
    .map((t) => ({ name: t.name, accuracy: Math.round(t.accuracy * 100) }));

  return (
    <AppShell title="Прогресс" subtitle="Как меняется ваш результат от занятия к занятию">
      <div className="grid gap-4 sm:grid-cols-3">
        <Tile label="Оценка балла" value={stats.total ? String(stats.estimatedScore) : "—"} />
        <Tile label="Math" value={stats.total ? String(sectionScore(stats.mathAccuracy)) : "—"} />
        <Tile
          label="Reading & Writing"
          value={stats.total ? String(sectionScore(stats.rwAccuracy)) : "—"}
        />
      </div>

      <section className="surface-card mt-6 p-5">
        <h2 className="text-lg font-semibold">Рост балла по дням</h2>
        {lineData.length > 1 ? (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
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
                  name="Балл"
                  stroke="var(--chart-1)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Нужны занятия минимум в двух разных днях, чтобы построить линию роста.
          </p>
        )}
      </section>

      <section className="surface-card mt-6 p-5">
        <h2 className="text-lg font-semibold">Точность по темам</h2>
        {barData.length ? (
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="accuracy" name="Точность, %" radius={[0, 8, 8, 0]}>
                  {barData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.accuracy >= 75
                          ? "var(--chart-2)"
                          : entry.accuracy >= 50
                            ? "var(--chart-3)"
                            : "var(--destructive)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Ответьте на первые вопросы — здесь появится разбивка по темам.
          </p>
        )}
      </section>

      <section className="surface-card mt-6 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">История</h2>
          <Badge variant="secondary">
            {stats.total} ответов · среднее {stats.avgSeconds} с
          </Badge>
        </div>
        {tests.length ? (
          <ul className="mt-4 divide-y divide-border">
            {tests.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                <span>
                  {t.label} · {new Date(t.created_at).toLocaleDateString("ru-RU")}
                </span>
                <span className="font-semibold">{t.total_score}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Пробные тесты ещё не пройдены. Полные адаптивные тесты появятся в следующей итерации, а
            практика по темам уже учитывается в оценке балла.
          </p>
        )}
      </section>
    </AppShell>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-primary">{value}</p>
    </div>
  );
}
