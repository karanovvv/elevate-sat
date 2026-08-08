import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  GraduationCap,
  Download,
  BookOpen,
  CheckSquare,
  Square,
  Bookmark,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { Footer } from "@/components/Footer";
import { AiHelperSheet } from "@/components/AiHelperSheet";

export const Route = createFileRoute("/free-resources")({
  head: () => ({
    meta: [
      { title: "Free Digital SAT Resources — MK Education" },
      {
        name: "description",
        content: "Скачивайте полезные чек-листы, формулы для Math, списки слов и гайды по подготовке к Digital SAT абсолютно бесплатно.",
      },
    ],
  }),
  component: FreeResources,
});

const RESOURCES_LIST = [
  {
    title: "SAT Math Formula Sheet",
    description: "Все ключевые формулы по алгебре, геометрии и тригонометрии, которые нужно знать наизусть.",
    type: "PDF Чек-лист",
    size: "1.2 MB",
  },
  {
    title: "Grammar & Punctuation Rules",
    description: "Шпаргалка по правилам пунктуации (запятые, точки с запятой, двоеточия) и грамматики для Writing.",
    type: "PDF Гайд",
    size: "850 KB",
  },
  {
    title: "Must-Know Vocabulary Words",
    description: "Список из 150 часто встречающихся академических слов с определениями и примерами контекста.",
    type: "Список слов",
    size: "640 KB",
  },
];

const INITIAL_CHECKLIST = [
  { id: 1, text: "Зарегистрироваться на официальном сайте College Board", checked: false },
  { id: 2, text: "Скачать и установить приложение Bluebook на свое устройство", checked: false },
  { id: 3, text: "Пройти пробный тест Test 1 в Bluebook для определения начального балла", checked: false },
  { id: 4, text: "Изучить базовые формулы по математике и графический калькулятор Desmos", checked: false },
  { id: 5, text: "Разобрать правила пунктуации и типы грамматических ошибок", checked: false },
  { id: 6, text: "Начать регулярную ежедневную практику по 15-20 минут на Elevate-SAT", checked: false },
];

function FreeResources() {
  const { user, loading } = useSession();
  const ctaTo = user ? "/dashboard" : "/auth";

  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);

  const toggleCheck = (id: number) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

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
            <Link to="/test-prep" className="text-sm font-medium text-[#c7c4d7] hover:text-white transition-colors">
              Test Prep
            </Link>
            <Link to="/free-resources" className="text-sm font-bold text-[#c0c1ff]">
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
            <Bookmark className="size-4" /> Библиотека бесплатных материалов
          </span>
          <h1 className="text-3xl sm:text-5xl font-headline font-extrabold text-white tracking-tight">
            Бесплатные ресурсы для подготовки
          </h1>
          <p className="text-sm sm:text-lg text-[#c7c4d7] max-w-2xl mx-auto leading-relaxed">
            Скачивайте шпаргалки, формулы и гайды от преподавателей MK Education.
          </p>
        </section>

        {/* Cheat Sheets and Downloadables */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-headline font-bold text-white">Полезные материалы для скачивания</h2>
            <p className="text-sm text-[#c7c4d7] mt-1">Подготовлены преподавателями MK Education.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {RESOURCES_LIST.map((resource) => (
              <div key={resource.title} className="bg-[#1c1f29]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-xl space-y-6">
                <div>
                  <span className="inline-block rounded-full bg-[#8083ff]/20 text-[#c0c1ff] text-xs font-semibold px-3 py-1 border border-[#8083ff]/30">
                    {resource.type}
                  </span>
                  <h3 className="mt-4 text-lg font-headline font-bold text-white">{resource.title}</h3>
                  <p className="mt-2 text-sm text-[#c7c4d7] leading-relaxed">
                    {resource.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-[#908fa0]">{resource.size}</span>
                  <Button size="sm" variant="outline" className="gap-1.5 border-white/10 bg-[#272a34]/50 text-white hover:bg-[#272a34]">
                    <Download className="size-3.5 text-[#c0c1ff]" /> Скачать
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Preparation Checklist */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-[#1c1f29]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6">
            <div>
              <h2 className="text-2xl font-headline font-bold text-white">Интерактивный чек-лист подготовки</h2>
              <p className="text-sm text-[#c7c4d7] mt-1">Отметьте шаги, чтобы отслеживать свой прогресс перед регистрацией на тест.</p>
            </div>

            <div className="space-y-3">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="w-full flex items-start gap-4 p-4 rounded-2xl bg-[#181b25]/60 border border-white/5 hover:bg-[#272a34]/50 transition-all text-left"
                >
                  <span className="shrink-0 mt-0.5">
                    {item.checked ? (
                      <CheckSquare className="size-5 text-[#4edea3]" />
                    ) : (
                      <Square className="size-5 text-[#908fa0]" />
                    )}
                  </span>
                  <span className={`text-sm font-medium ${item.checked ? "line-through text-[#908fa0]" : "text-white"}`}>
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Official Links */}
        <section className="max-w-4xl mx-auto text-center">
          <div className="bg-[#181b25]/60 border border-white/5 rounded-3xl p-8 space-y-6">
            <h2 className="text-xl font-headline font-bold text-white">Полезные ссылки на официальные ресурсы</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline" className="gap-2 border-white/10 bg-[#272a34]/50 text-white hover:bg-[#272a34]">
                <a href="https://bluebook.collegeboard.org/" target="_blank" rel="noreferrer">
                  Приложение Bluebook <ExternalLink className="size-3.5 text-[#c0c1ff]" />
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-2 border-white/10 bg-[#272a34]/50 text-white hover:bg-[#272a34]">
                <a href="https://satsuite.collegeboard.org/digital" target="_blank" rel="noreferrer">
                  Сайт College Board <ExternalLink className="size-3.5 text-[#c0c1ff]" />
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-2 border-white/10 bg-[#272a34]/50 text-white hover:bg-[#272a34]">
                <a href="https://www.khanacademy.org/prep/sat" target="_blank" rel="noreferrer">
                  SAT на Khan Academy <ExternalLink className="size-3.5 text-[#c0c1ff]" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <AiHelperSheet floating />
      <Footer />
    </div>
  );
}
