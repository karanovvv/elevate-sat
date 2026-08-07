import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap,
  BookOpen,
  Calculator,
  Compass,
  FileText,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
            <Link to="/test-prep" className="text-sm font-semibold text-primary">
              Test Prep
            </Link>
            <Link to="/free-resources" className="text-sm font-medium text-muted-foreground hover:text-foreground">
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
              <Compass className="size-3.5" /> Вводный гайд по Digital SAT
            </span>
            <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl tracking-tight text-white font-sans">
              Всё о подготовке к Digital SAT
            </h1>
            <p className="mt-4 text-base sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Разберитесь в структуре экзамена, изучите ключевые темы секций и выстройте эффективную стратегию подготовки.
            </p>
          </div>
        </section>

        {/* Structure Overview */}
        <section className="mx-auto max-w-5xl px-4 mt-12">
          <h2 className="text-2xl font-bold tracking-tight">Структура экзамена Digital SAT</h2>
          <p className="text-muted-foreground mt-1">Основные параметры формата, внедренного College Board с 2023/2024 года.</p>

          <div className="grid gap-6 md:grid-cols-3 mt-6">
            <div className="surface-card p-6 flex flex-col justify-between">
              <div>
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Clock className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold">Время проведения</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Общая длительность теста составляет 2 часа 14 минут. На секцию Reading & Writing отводится 64 минуты, на Math — 70 минут.
                </p>
              </div>
            </div>

            <div className="surface-card p-6 flex flex-col justify-between">
              <div>
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <FileText className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold">Количество вопросов</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Всего на тесте 98 вопросов (54 в языковой секции и 44 в математической). Вопросы разделены на модули с адаптивной сложностью.
                </p>
              </div>
            </div>

            <div className="surface-card p-6 flex flex-col justify-between">
              <div>
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Calculator className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold font-sans">Desmos встроен</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Графический калькулятор Desmos встроен прямо в приложение Bluebook и разрешен на протяжении всей математической секции.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sections Detail */}
        <section className="mx-auto max-w-5xl px-4 mt-16">
          <h2 className="text-2xl font-bold tracking-tight">Подробный разбор секций</h2>
          
          <div className="grid gap-8 md:grid-cols-2 mt-6">
            {/* Reading & Writing */}
            <div className="surface-card p-8 border-t-4 border-t-primary">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
                  <BookOpen className="size-5" />
                </span>
                <h3 className="text-xl font-bold">Reading & Writing</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Содержит короткие отрывки (один вопрос на текст). Темы включают литературу, историю, обществознание и науку.
              </p>
              
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-2.5 text-sm">
                  <ChevronRight className="size-4 text-primary mt-0.5 shrink-0" />
                  <span><strong>Craft and Structure:</strong> анализ значений слов в контексте, структуры и связей между текстами.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <ChevronRight className="size-4 text-primary mt-0.5 shrink-0" />
                  <span><strong>Information and Ideas:</strong> поиск главных мыслей, деталей, интерпретация графиков и логических выводов.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <ChevronRight className="size-4 text-primary mt-0.5 shrink-0" />
                  <span><strong>Standard English Conventions:</strong> грамматика, пунктуация и структура предложений.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <ChevronRight className="size-4 text-primary mt-0.5 shrink-0" />
                  <span><strong>Expression of Ideas:</strong> риторический синтез, переработка заметок для достижения определенной цели.</span>
                </li>
              </ul>
            </div>

            {/* Math */}
            <div className="surface-card p-8 border-t-4 border-t-accent">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent">
                  <Calculator className="size-5" />
                </span>
                <h3 className="text-xl font-bold">Math</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Оценивает навыки решения задач, моделирования и критического анализа математических данных.
              </p>
              
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-2.5 text-sm">
                  <ChevronRight className="size-4 text-accent mt-0.5 shrink-0" />
                  <span><strong>Algebra:</strong> линейные уравнения, системы уравнений, неравенства и графики.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <ChevronRight className="size-4 text-accent mt-0.5 shrink-0" />
                  <span><strong>Advanced Math:</strong> квадратичные и экспоненциальные функции, полиномы, рациональные выражения.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <ChevronRight className="size-4 text-accent mt-0.5 shrink-0" />
                  <span><strong>Problem Solving and Data Analysis:</strong> проценты, пропорции, статистика, интерпретация таблиц и графиков.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <ChevronRight className="size-4 text-accent mt-0.5 shrink-0" />
                  <span><strong>Geometry and Trigonometry:</strong> углы, треугольники, окружности, синусы, косинусы и теоремы.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Strategies Section */}
        <section className="mx-auto max-w-5xl px-4 mt-16">
          <div className="bg-secondary/40 rounded-3xl p-8 md:p-12">
            <h2 className="text-2xl font-bold tracking-tight">3 золотых правила для сдачи Digital SAT</h2>
            <div className="grid gap-6 md:grid-cols-3 mt-8">
              <div className="space-y-2">
                <div className="text-3xl font-extrabold text-primary">01</div>
                <h4 className="font-semibold text-lg">Контролируйте время</h4>
                <p className="text-sm text-muted-foreground">
                  Поскольку у вас есть чуть более минуты на вопрос, пропускайте сложные задачи и возвращайтесь к ним позже, используя функцию флага в интерфейсе.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-extrabold text-primary">02</div>
                <h4 className="font-semibold text-lg font-sans">Изучите Desmos на 100%</h4>
                <p className="text-sm text-muted-foreground">
                  Многие задачи по математике, включая системы уравнений и нахождение пересечений функций, решаются в графическом калькуляторе за считанные секунды.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-extrabold text-primary">03</div>
                <h4 className="font-semibold text-lg">Не оставляйте пустых ответов</h4>
                <p className="text-sm text-muted-foreground">
                  В SAT нет штрафов за неверные ответы. Если время заканчивается, обязательно выберите наугад любой вариант для каждого оставшегося вопроса.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section Accordion */}
        <section className="mx-auto max-w-3xl px-4 mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-center">Часто задаваемые вопросы (FAQ)</h2>
          <div className="mt-8">
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="surface-card px-5 border-b-0 rounded-xl">
                <AccordionTrigger className="hover:no-underline font-semibold text-left">
                  Как часто проводится Digital SAT?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                  Экзамен проводится на международном уровне 7 раз в год: в марте, мае, июне, августе, октябре, ноябре и декабре. Рекомендуется регистрироваться за месяц до желаемой даты.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="surface-card px-5 border-b-0 rounded-xl">
                <AccordionTrigger className="hover:no-underline font-semibold text-left">
                  Что такое адаптивность модулей?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                  Каждая секция состоит из двух модулей. Сложность вопросов во втором модуле напрямую зависит от того, насколько успешно вы решили первый модуль. Высокий балл (более 600+) доступен только при переходе на сложный второй модуль.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="surface-card px-5 border-b-0 rounded-xl">
                <AccordionTrigger className="hover:no-underline font-semibold text-left">
                  Каков максимальный и средний балл на экзамене?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                  Максимальный балл — 1600 (по 800 за каждую из двух секций). Средний мировой показатель колеблется в районе 1050-1080 баллов. Для поступления в топ-университеты США обычно требуется 1450-1500+ баллов.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="surface-card px-5 border-b-0 rounded-xl">
                <AccordionTrigger className="hover:no-underline font-semibold text-left">
                  Можно ли сдавать тест на своем ноутбуке или планшете?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                  Да! Вы должны установить официальное приложение Bluebook от College Board на свой ноутбук (Windows/Mac) или iPad и прийти с ним в аккредитованный тест-центр.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-4 mt-16">
          <div className="surface-card p-8 md:p-12 text-center relative overflow-hidden rounded-3xl">
            <h2 className="text-2xl font-bold sm:text-3xl">Готовы проверить свои силы?</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
              Пройдите короткую диагностику на нашей платформе, чтобы узнать свой текущий прогнозируемый балл по шкале 400–1600.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link to={ctaTo}>Начать подготовку бесплатно</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
