import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  GraduationCap,
  ArrowRight,
  PlayCircle,
  Verified,
  RefreshCw,
  Sparkles,
  Brain,
  BarChart3,
  Target,
  Flame,
  CheckCircle2,
  Bookmark,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { Footer } from "@/components/Footer";
import { AiHelperSheet } from "@/components/AiHelperSheet";
import { AiShaderCanvas } from "@/components/AiShaderCanvas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Elevate-SAT — Сдай Digital SAT на 1500+ с помощью ИИ" },
      {
        name: "description",
        content:
          "Персональный ИИ-репетитор от MK Education. Диагностика, адаптивная практика по модулям, прогнозирование баллов 400-1600.",
      },
      { property: "og:title", content: "Elevate-SAT — Сдай Digital SAT на 1500+ с помощью ИИ" },
      {
        property: "og:description",
        content:
          "Персональный ИИ-репетитор от MK Education. Диагностика, адаптивная практика по модулям, прогнозирование баллов 400-1600.",
      },
    ],
  }),
  component: Landing,
});

const UNIVERSITIES = [
  { id: "nw", name: "Northwestern University", code: "NW", req: 1500, color: "bg-[#4E2A84]" },
  { id: "nyu", name: "New York University", code: "NYU", req: 1520, color: "bg-[#57068c]" },
  { id: "uoft", name: "University of Toronto", code: "UofT", req: 1450, color: "bg-[#002A5C]" },
  { id: "nu", name: "Nazarbayev University", code: "NU", req: 1400, color: "bg-[#00703c]" },
  { id: "kaist", name: "KAIST University", code: "KAIST", req: 1480, color: "bg-[#00479d]" },
];

function Landing() {
  const { user, loading } = useSession();
  const ctaTo = user ? "/dashboard" : "/auth";

  const [score, setScore] = useState(1450);

  const percentage = ((score - 400) / (1600 - 400)) * 100;

  return (
    <div className="min-h-screen bg-[#080b14] text-[#e0e2ef] font-sans ambient-glow overflow-x-hidden">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 h-20 bg-[#080b14]/70 backdrop-blur-xl border-b border-white/5 flex items-center px-4 sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#8083ff] to-[#6001d1] text-white shadow-[0_0_20px_rgba(128,131,255,0.4)]">
              <GraduationCap className="size-6" />
            </span>
            <div className="flex flex-col">
              <span className="font-headline font-extrabold text-xl tracking-tight text-white">Elevate-SAT</span>
              <span className="text-[10px] uppercase tracking-widest text-[#8083ff] font-bold">MK Education</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/test-prep" className="text-sm font-medium text-[#c7c4d7] hover:text-white transition-colors">
              Test Prep
            </Link>
            <Link to="/free-resources" className="text-sm font-medium text-[#c7c4d7] hover:text-white transition-colors">
              Free Resources
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {loading ? null : user ? (
              <Button asChild className="bg-gradient-to-r from-[#8083ff] to-[#6001d1] text-white font-semibold shadow-lg shadow-[#8083ff]/20 hover:scale-105 transition-all">
                <Link to="/dashboard">Мой кабинет</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-[#c7c4d7] hover:text-white hover:bg-white/5">
                  <Link to="/auth">Войти</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-[#8083ff] to-[#6001d1] text-white font-semibold shadow-lg shadow-[#8083ff]/20 hover:scale-105 transition-all">
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Начать бесплатно
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-24 min-h-[calc(100vh-80px)]">
        {/* Glow Spheres */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#8083ff]/15 rounded-full blur-[140px] mix-blend-screen animate-pulse duration-[8000ms]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#6001d1]/15 rounded-full blur-[150px] mix-blend-screen" />
        </div>

        <section className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-6">
          {/* Hero Content Left */}
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#1c1f29]/80 backdrop-blur-md border border-white/10 shadow-lg">
              <Sparkles className="size-4 text-[#d2bbff] animate-pulse" />
              <span className="text-xs uppercase tracking-wider text-[#c7c4d7] font-semibold">
                Новый формат подготовки к SAT
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-headline font-extrabold tracking-tight text-white leading-none">
                Сдай Digital SAT <br />
                на <span className="text-[#c0c1ff] drop-shadow-[0_0_25px_rgba(192,193,255,0.4)]">1500+</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#c7c4d7] leading-relaxed max-w-xl">
                Персональный ИИ-репетитор от MK Education, который помогает дойти от текущего уровня до заветной цели.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-[#8083ff] to-[#6001d1] text-white font-bold px-8 py-6 rounded-2xl shadow-[0_0_25px_rgba(128,131,255,0.35)] hover:shadow-[0_0_35px_rgba(128,131,255,0.5)] transition-all hover:scale-105"
              >
                <Link to={ctaTo} className="flex items-center justify-center gap-2">
                  <span>Начать бесплатно</span>
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-[#1c1f29]/60 backdrop-blur-md border-white/10 text-white hover:bg-[#272a34] px-8 py-6 rounded-2xl"
              >
                <Link to="/test-prep" className="flex items-center justify-center gap-2">
                  <PlayCircle className="size-5 opacity-70" />
                  <span>Узнать про экзамен</span>
                </Link>
              </Button>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#908fa0] font-medium">
              <div className="flex items-center gap-2">
                <Verified className="size-4 text-[#4edea3]" />
                <span>College Board Aligned</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="size-4 text-[#4edea3]" />
                <span>Digital Format 2026</span>
              </div>
            </div>
          </div>

          {/* Hero Interactive Interactive Widget Right */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[460px]">
            {/* Interactive Shader Canvas */}
            <div className="absolute inset-[-15%] pointer-events-none rounded-full overflow-hidden opacity-60">
              <AiShaderCanvas />
            </div>

            {/* Score Calculator Card */}
            <div className="relative z-10 w-full max-w-lg bg-[#1c1f29]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
              {/* Floating Badges */}
              <div className="absolute -top-4 -right-4 px-3.5 py-1.5 bg-[#272a34]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce-slow">
                <Flame className="size-4 text-[#d2bbff]" />
                <span className="text-xs font-bold text-white">+80 баллов за месяц</span>
              </div>
              <div className="absolute top-1/3 -left-6 px-3.5 py-1.5 bg-[#272a34]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl flex items-center gap-2">
                <Target className="size-4 text-[#4edea3]" />
                <span className="text-xs font-bold text-white">86% Accuracy Math</span>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-headline font-bold text-white">Твой целевой балл</h3>
                <p className="text-xs text-[#c7c4d7]">Потяни слайдер, чтобы узнать вузы в твоем диапазоне</p>
              </div>

              <div className="space-y-4">
                <div className="text-center text-4xl font-headline font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#c0c1ff] to-[#d2bbff]">
                  {score}
                </div>

                <div className="relative w-full h-3 bg-[#272a34] rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#8083ff] to-[#6001d1] transition-all duration-150 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                  <input
                    type="range"
                    min="400"
                    max="1600"
                    step="10"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                </div>
                <div className="flex justify-between text-xs text-[#908fa0] px-1 font-semibold">
                  <span>400</span>
                  <span>1000</span>
                  <span>1600</span>
                </div>
              </div>

              {/* Matching Universities */}
              <div className="space-y-2.5 pt-2">
                {UNIVERSITIES.map((uni) => {
                  const inRange = score >= uni.req;
                  return (
                    <div
                      key={uni.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
                        inRange
                          ? "bg-[#8083ff]/10 border-[#8083ff]/40 shadow-sm"
                          : "bg-[#181b25]/40 border-white/5 opacity-40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${uni.color} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
                          {uni.code}
                        </div>
                        <span className="text-sm font-semibold text-white">{uni.name}</span>
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          inRange ? "text-[#c0c1ff]" : "text-[#908fa0]"
                        }`}
                      >
                        {inRange ? "В диапазоне ✓" : `Требуется: ${uni.req}+`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="relative z-10 py-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-[#181b25]/50 backdrop-blur-md border border-white/5 hover:border-[#8083ff]/30 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#8083ff]/20 text-[#c0c1ff] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain className="size-6" />
            </div>
            <h3 className="text-xl font-headline font-bold text-white mb-2">Адаптивный ИИ-алгоритм</h3>
            <p className="text-sm text-[#c7c4d7] leading-relaxed">
              Система подстраивается под твой уровень знания Math и Reading, предлагая задачи, которые максимизируют рост баллов.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#181b25]/50 backdrop-blur-md border border-white/5 hover:border-[#d2bbff]/30 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#6001d1]/20 text-[#d2bbff] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="size-6" />
            </div>
            <h3 className="text-xl font-headline font-bold text-white mb-2">Глубокая аналитика</h3>
            <p className="text-sm text-[#c7c4d7] leading-relaxed">
              Понимание слабых мест до мелочей. Показываем паттерны мышления и подтягиваем сложные правила пунктуации и алгебры.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#181b25]/50 backdrop-blur-md border border-white/5 hover:border-[#4edea3]/30 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#00885d]/20 text-[#4edea3] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="size-6" />
            </div>
            <h3 className="text-xl font-headline font-bold text-white mb-2">Фокус на результат</h3>
            <p className="text-sm text-[#c7c4d7] leading-relaxed">
              Только те концепции и стратегии, которые реально проверяются на экзамене Digital SAT 2026 года.
            </p>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="relative z-10 py-12">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#1c1f29] via-[#181b25] to-[#0b0e17] border border-white/10 p-8 sm:p-12 overflow-hidden shadow-2xl text-center space-y-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#8083ff]/10 rounded-full blur-[100px] pointer-events-none" />
            <h2 className="text-3xl sm:text-4xl font-headline font-extrabold text-white">
              Готов проверить свой балл SAT?
            </h2>
            <p className="text-sm sm:text-base text-[#c7c4d7] max-w-xl mx-auto">
              Пройдите короткую бесплатную практику и получите персональный разбор от ИИ-репетитора MK Education.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-[#8083ff] to-[#6001d1] text-white font-bold px-10 py-6 rounded-2xl shadow-[0_0_25px_rgba(128,131,255,0.35)] hover:scale-105 transition-all"
            >
              <Link to={ctaTo}>Начать подготовку бесплатно</Link>
            </Button>
          </div>
        </section>
      </main>

      <AiHelperSheet floating />
      <Footer />
    </div>
  );
}
