import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Calculator,
  Compass,
  FileText,
  Clock,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { Footer } from "@/components/Footer";
import { AiHelperSheet } from "@/components/AiHelperSheet";

export const Route = createFileRoute("/test-prep")({
  head: () => ({
    meta: [
      { title: "Digital SAT Test Prep — MK Education" },
      {
        name: "description",
        content: "Всё о формате экзамена Digital SAT, структура секций Math и Reading & Writing, стратегии сдачи и разбор тем.",
      },
    ],
  }),
  component: TestPrep,
});

function TestPrep() {
  const { user, loading } = useSession();
  const ctaTo = user ? "/dashboard" : "/auth";

  return (
    <div className="min-h-screen bg-[#080b14] text-[#e0e2ef] font-sans ambient-glow flex flex-col">
      {/* Header */}
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
            <Link to="/test-prep" className="text-sm font-bold text-[#c0c1ff]">
              Test Prep
            </Link>
            <Link to="/free-resources" className="text-sm font-medium text-[#c7c4d7] hover:text-white transition-colors">
              Free Resources
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {loading ? null : user ? (
              <Button asChild className="bg-gradient-to-r from-[#8083ff] to-[#6001d1] text-white font-semibold shadow-lg shadow-[#8083ff]/20">
                <Link to="/dashboard">Мой кабинет</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-[#c7c4d7] hover:text-white hover:bg-white/5">
                  <Link to="/auth">Войти</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-[#8083ff] to-[#6001d1] text-white font-semibold shadow-lg shadow-[#8083ff]/20">
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Начать бесплатно
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-16 max-w-7xl mx-auto px-4 sm:px-8 w-full space-y-16 pt-8 flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1c1f29] via-[#181b25] to-[#0b0e17] border border-white/10 p-8 sm:p-14 text-center space-y-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8083ff]/10 rounded-full blur-[120px] pointer-events-none" />
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8083ff]/20 text-[#c0c1ff] border border-[#8083ff]/30 text-xs font-bold uppercase tracking-wider">
            <Compass className="size-4" /> Гайд по Digital SAT 2026
          </span>
          <h1 className="text-3xl sm:text-5xl font-headline font-extrabold text-white tracking-tight">
            Всё о подготовке к Digital SAT
          </h1>
          <p className="text-sm sm:text-lg text-[#c7c4d7] max-w-2xl mx-auto leading-relaxed">
            Разберитесь в структуре адаптивного экзамена, изучите ключевые темы секций и выстройте эффективную стратегию.
          </p>
        </section>

        {/* Structure Overview */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-headline font-bold text-white">Структура экзамена Digital SAT</h2>
            <p className="text-sm text-[#c7c4d7] mt-1">Основные параметры формата, внедренного College Board.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-[#1c1f29]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="w-10 h-10 rounded-2xl bg-[#8083ff]/20 text-[#c0c1ff] flex items-center justify-center font-bold">
                <Clock className="size-5" />
              </div>
              <h3 className="text-lg font-headline font-bold text-white">Время и вопросы</h3>
              <p className="text-sm text-[#c7c4d7] leading-relaxed">
                Всего 2 часа 14 минут. 98 вопросов (Reading & Writing: 54 вопроса за 64 мин, Math: 44 вопроса за 70 мин).
              </p>
            </div>

            <div className="bg-[#1c1f29]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="w-10 h-10 rounded-2xl bg-[#6001d1]/20 text-[#d2bbff] flex items-center justify-center font-bold">
                <Sparkles className="size-5" />
              </div>
              <h3 className="text-lg font-headline font-bold text-white">Адаптивность модулей</h3>
              <p className="text-sm text-[#c7c4d7] leading-relaxed">
                Сложность второго модуля в каждой секции зависит от ваших результатов в первом модуле.
              </p>
            </div>

            <div className="bg-[#1c1f29]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="w-10 h-10 rounded-2xl bg-[#00885d]/20 text-[#4edea3] flex items-center justify-center font-bold">
                <Calculator className="size-5" />
              </div>
              <h3 className="text-lg font-headline font-bold text-white">Desmos Calculator</h3>
              <p className="text-sm text-[#c7c4d7] leading-relaxed">
                Графический калькулятор Desmos встроен прямо в интерфейс приложения Bluebook на протяжении всей секции Math.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-headline font-bold text-white text-center">Часто задаваемые вопросы (FAQ)</h2>
          <div className="space-y-4">
            <FaqItem
              question="Как часто проводится Digital SAT?"
              answer="Экзамен проводится на международном уровне 7 раз в год: в марте, мае, июне, августе, октябре, ноябре и декабре."
            />
            <FaqItem
              question="Что такое адаптивность модулей?"
              answer="Каждая секция состоит из двух модулей. Сложность второго модуля определяется точностью ответов в первом."
            />
            <FaqItem
              question="Какой максимальный балл?"
              answer="Максимальный балл — 1600 (800 за Math и 800 за Reading & Writing). Для топ-вузов обычно требуется 1450-1500+."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="text-center pt-8">
          <Button asChild size="lg" className="bg-gradient-to-r from-[#8083ff] to-[#6001d1] text-white font-bold px-10 py-6 rounded-2xl shadow-[0_0_25px_rgba(128,131,255,0.35)] hover:scale-105 transition-all">
            <Link to={ctaTo}>Начать подготовку бесплатно</Link>
          </Button>
        </section>
      </main>

      <AiHelperSheet floating />
      <Footer />
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-[#1c1f29]/70 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-6 py-5 text-left text-base font-headline font-bold text-white hover:bg-white/5 transition-colors cursor-pointer"
      >
        <span>{question}</span>
        <ChevronDown
          className={`size-5 shrink-0 text-[#908fa0] transition-transform duration-200 ${open ? "rotate-180 text-[#c0c1ff]" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm leading-relaxed text-[#c7c4d7] border-t border-white/5 pt-3">
          {answer}
        </div>
      )}
    </div>
  );
}
