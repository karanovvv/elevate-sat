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
  Sparkles,
  CheckCircle2,
  Edit,
  ArrowUpRight,
  Flag,
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

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Личный кабинет — Elevate-SAT" },
      {
        name: "description",
        content: "Ваш прогресс, задания на сегодня, серия дней и аналитика подготовки к SAT.",
      },
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
  const target = profile?.target_score ?? 1500;
  const currentScore = stats.total ? stats.estimatedScore : 1320;
  const pointsAway = Math.max(0, target - currentScore);

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
    : [
        { label: "Пн", score: 1280 },
        { label: "Ср", score: 1340 },
        { label: "Пт", score: 1380 },
        { label: "Сегодня", score: currentScore },
      ];

  const firstName = profile?.full_name?.split(" ")[0] ?? "Друг";

  return (
    <AppShell
      title={`Привет, ${firstName}! 👋`}
      subtitle={
        daysLeft !== null
          ? `До экзамена SAT осталось ${daysLeft} дн. Ваша цель — ${target} баллов.`
          : `Цель — ${target} баллов. Укажите дату экзамена в профиле.`
      }
    >
      <div className="space-y-8">
        {/* SAT Trajectory Target Banner */}
        <div className="relative w-full overflow-hidden rounded-3xl bg-[#0b0e17] p-6 sm:p-10 flex flex-col lg:flex-row gap-8 items-center justify-between border border-white/10 shadow-2xl isolate">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8083ff]/10 via-transparent to-[#6001d1]/10 opacity-60 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#8083ff]/15 blur-[140px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-4 w-full lg:w-5/12">
            <div>
              <span className="text-[#d2bbff] text-xs font-bold uppercase tracking-widest block mb-1">
                SAT Trajectory
              </span>
              <h2 className="text-3xl sm:text-5xl font-headline font-extrabold text-white">
                Target {target}+
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#c7c4d7] leading-relaxed">
              {pointsAway > 0
                ? `Вам осталось всего ${pointsAway} баллов до цели. Системные тренировки приносят результат.`
                : "Отличный результат! Вы вышли на целевой диапазон баллов."}
            </p>

            <div className="flex items-baseline gap-4 mt-2">
              <span className="text-4xl sm:text-5xl font-headline font-extrabold text-[#c0c1ff]">
                {currentScore}
              </span>
              <span className="text-sm font-semibold text-[#4edea3] flex items-center gap-1">
                <TrendingUp className="size-4" />
                +80 баллов в этом месяце
              </span>
            </div>
          </div>

          {/* SVG Trajectory Curve */}
          <div className="relative z-10 w-full lg:w-7/12 h-[220px] flex items-center">
            <div className="w-full relative h-32">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path
                  className="text-white/20"
                  d="M0,80 Q25,70 50,40 T100,10"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  strokeWidth="2"
                />
                <path
                  className="text-[#8083ff]"
                  d="M0,80 Q25,70 50,40 T75,25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
              </svg>
              <div className="absolute top-[80%] left-0 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#1c1f29] border-2 border-[#8083ff]" />
                <span className="text-[11px] font-semibold text-[#908fa0] mt-1">1320</span>
              </div>
              <div className="absolute top-[55%] left-[37.5%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#1c1f29] border-2 border-[#8083ff]" />
                <span className="text-[11px] font-semibold text-[#908fa0] mt-1">1380</span>
              </div>
              <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#1c1f29] border-2 border-[#8083ff]" />
                <span className="text-[11px] font-semibold text-[#908fa0] mt-1">1420</span>
              </div>
              <div className="absolute top-[25%] left-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-[#8083ff] flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(192,193,255,0.6)]">
                  <div className="w-2 h-2 rounded-full bg-[#1000a9]" />
                </div>
                <div className="bg-[#1c1f29] px-2.5 py-0.5 rounded-full mt-1.5 border border-white/10 shadow-md">
                  <span className="text-xs text-[#c0c1ff] font-bold">{currentScore}</span>
                </div>
              </div>
              <div className="absolute top-[10%] left-[100%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-[#1c1f29] border-2 border-dashed border-white/40 flex items-center justify-center">
                  <Flag className="size-3 text-[#c7c4d7]" />
                </div>
                <span className="text-[11px] font-bold text-white mt-1">{target}+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Stat Tiles */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon={<TrendingUp className="size-4 text-[#c0c1ff]" />}
            label="Оценка балла"
            value={stats.total ? String(stats.estimatedScore) : "1320"}
            hint={stats.total ? `по ${stats.total} вопросам` : "решите первые вопросы"}
          />
          <StatTile
            icon={<Flame className="size-4 text-[#d2bbff]" />}
            label="Серия дней"
            value={`${profile?.streak_days ?? 1} день`}
            hint="занимайтесь каждый день 🔥"
          />
          <StatTile
            icon={<Target className="size-4 text-[#4edea3]" />}
            label="Точность"
            value={stats.total ? `${Math.round(stats.accuracy * 100)}%` : "84%"}
            hint={`${stats.correct} из ${stats.total || 25} верно`}
          />
          <StatTile
            icon={<BookmarkCheck className="size-4 text-[#8083ff]" />}
            label="В закладках"
            value={String(bookmarks.length)}
            hint="вопросов для разбора"
          />
        </div>

        {/* Score Chart & Today's Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Chart Column */}
          <div className="lg:col-span-7 bg-[#1c1f29]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-headline font-bold text-white">Динамика результатов</h3>
                <p className="text-xs text-[#c7c4d7] mt-0.5">Оценка балла по шкале 400–1600</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#8083ff]/20 text-[#c0c1ff] border border-[#8083ff]/30">
                Digital SAT 2026
              </span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" stroke="#908fa0" fontSize={12} />
                  <YAxis domain={[1000, 1600]} stroke="#908fa0" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "#181b25",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#white",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8083ff"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#c0c1ff" }}
                    name="Балл"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-[#c7c4d7]">
              <span>Прогресс до цели ({target} баллов)</span>
              <span className="font-bold text-[#c0c1ff]">
                {Math.min(100, Math.round((currentScore / target) * 100))}%
              </span>
            </div>
            <Progress
              className="h-2 bg-[#272a34]"
              value={Math.min(100, (currentScore / target) * 100)}
            />
          </div>

          {/* Today's Mission Column */}
          <div className="lg:col-span-5 bg-[#1c1f29]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-headline font-bold text-white">Задания на сегодня</h3>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#6001d1]/30 text-[#d2bbff]">
                  66% выполнено
                </span>
              </div>
              <p className="text-xs text-[#c7c4d7] mb-6">
                Рекомендуемый план подготовки от ИИ на 20 минут.
              </p>

              <div className="space-y-4">
                {recommended.map((topic, i) => (
                  <div
                    key={topic.slug}
                    className="p-4 rounded-2xl bg-[#181b25] border border-white/5 flex items-center justify-between group hover:border-[#8083ff]/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#8083ff]/20 text-[#c0c1ff] flex items-center justify-center font-bold text-xs">
                        0{i + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{topic.name}</h4>
                        <p className="text-xs text-[#908fa0]">
                          {topic.total ? `Точность ${Math.round(topic.accuracy * 100)}%` : "Новая тема"}
                        </p>
                      </div>
                    </div>
                    <Button asChild size="sm" className="bg-[#8083ff] text-[#1000a9] hover:bg-[#c0c1ff] font-bold rounded-xl gap-1">
                      <Link to="/practice/$topic" params={{ topic: topic.slug }}>
                        <span>Решать</span>
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button asChild variant="outline" className="w-full border-white/10 bg-[#272a34]/50 text-white hover:bg-[#272a34] mt-6">
              <Link to="/practice">Все 8 модулей практики →</Link>
            </Button>
          </div>
        </div>
      </div>
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
    <div className="bg-[#1c1f29]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-lg space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#908fa0]">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-3xl font-headline font-extrabold text-white">{value}</p>
      <p className="text-xs text-[#c7c4d7]">{hint}</p>
    </div>
  );
}
