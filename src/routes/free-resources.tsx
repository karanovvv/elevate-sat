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
  { id: 6, text: "Начать регулярную ежедневную практику по 15-20 минут на SATPrep", checked: false },
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            SATPrep
          </Link>
          <nav className="hidden md:flex items-center gap-6 ml-8">
            <Link to="/test-prep" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Test Prep
            </Link>
            <Link to="/free-resources" className="text-sm font-semibold text-primary">
              Free Resources
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {loading ? null : user ? (
              <Button asChild size="sm">
                <Link to="/dashboard">Мой кабинет</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">Войти</Link>
                </Button>
                <Button asChild size="sm">
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
      <main className="pb-16">
        {/* Hero Section */}
        <section className="hero-gradient text-primary-foreground py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              <Bookmark className="size-3.5" /> Библиотека бесплатных материалов
            </span>
            <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl tracking-tight text-white font-sans">
              Бесплатные ресурсы для подготовки
            </h1>
            <p className="mt-4 text-base sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Скачивайте шпаргалки, формулы и гайды, чтобы учиться самостоятельно или вместе с платформой SATPrep.
            </p>
          </div>
        </section>

        {/* Cheat Sheets and Downloadables */}
        <section className="mx-auto max-w-5xl px-4 mt-12">
          <h2 className="text-2xl font-bold tracking-tight">Полезные материалы для скачивания</h2>
          <p className="text-muted-foreground mt-1">Подготовленные преподавателями MK Education.</p>

          <div className="grid gap-6 md:grid-cols-3 mt-6">
            {RESOURCES_LIST.map((resource) => (
              <div key={resource.title} className="surface-card p-6 flex flex-col justify-between">
                <div>
                  <span className="inline-block rounded-full bg-primary-soft text-primary text-xs font-semibold px-2.5 py-1">
                    {resource.type}
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{resource.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {resource.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{resource.size}</span>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Download className="size-3.5" /> Скачать
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Preparation Checklist */}
        <section className="mx-auto max-w-4xl px-4 mt-16">
          <div className="surface-card p-8 md:p-12 rounded-3xl">
            <h2 className="text-2xl font-bold tracking-tight">Интерактивный чек-лист подготовки</h2>
            <p className="text-muted-foreground text-sm mt-1">Отметьте шаги, чтобы отслеживать свой прогресс перед регистрацией на тест.</p>
            
            <div className="mt-8 space-y-4">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="w-full flex items-start gap-3.5 p-4 rounded-xl hover:bg-secondary/40 transition-colors text-left"
                >
                  <span className="shrink-0 mt-0.5">
                    {item.checked ? (
                      <CheckSquare className="size-5 text-primary" />
                    ) : (
                      <Square className="size-5 text-muted-foreground" />
                    )}
                  </span>
                  <span className={`text-sm font-medium ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* High-Yield Vocabulary Snippet */}
        <section className="mx-auto max-w-5xl px-4 mt-16">
          <h2 className="text-2xl font-bold tracking-tight">Топ академических слов для Digital SAT</h2>
          <p className="text-muted-foreground mt-1">Слова, которые регулярно встречаются в секции Reading.</p>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mt-6">
            {[
              { word: "Pragmatic", translation: "Прагматичный / практичный", context: "A pragmatic approach to problem-solving focuses on results." },
              { word: "Exacerbate", translation: "Обострять / ухудшать", context: "Failing to practice will only exacerbate test-day anxiety." },
              { word: "Anomalous", translation: "Аномальный / отклоняющийся", context: "The scientists found anomalous test results that contradicted the hypothesis." },
              { word: "Benevolent", translation: "Доброжелательный / щедрый", context: "The benevolent benefactor donated millions to the university." },
            ].map((vocab) => (
              <div key={vocab.word} className="surface-card p-5 space-y-2.5">
                <span className="font-mono text-sm text-primary font-bold">{vocab.word}</span>
                <p className="text-sm font-medium">{vocab.translation}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <em>Example:</em> "{vocab.context}"
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Links to Official Sites */}
        <section className="mx-auto max-w-4xl px-4 mt-16">
          <div className="bg-secondary/40 rounded-3xl p-8 text-center">
            <h2 className="text-xl font-bold tracking-tight">Полезные ссылки на официальные ресурсы</h2>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Button asChild variant="outline" className="gap-1.5">
                <a href="https://bluebook.collegeboard.org/" target="_blank" rel="noreferrer">
                  Приложение Bluebook <ExternalLink className="size-3.5" />
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-1.5">
                <a href="https://satsuite.collegeboard.org/digital" target="_blank" rel="noreferrer">
                  Сайт College Board <ExternalLink className="size-3.5" />
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-1.5">
                <a href="https://www.khanacademy.org/prep/sat" target="_blank" rel="noreferrer">
                  SAT на Khan Academy <ExternalLink className="size-3.5" />
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
