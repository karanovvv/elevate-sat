import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  Flame,
  GraduationCap,
  Timer,
} from "lucide-react";
import heroImage from "@/assets/hero-sat.jpg";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SATPrep — умная подготовка к Digital SAT" },
      {
        name: "description",
        content:
          "Диагностика, персональный план, практика по темам с объяснениями и аналитика роста баллов 400–1600. Начните бесплатно.",
      },
      { property: "og:title", content: "SATPrep — умная подготовка к Digital SAT" },
      {
        property: "og:description",
        content:
          "Диагностика, персональный план, практика по темам с объяснениями и аналитика роста баллов 400–1600. Начните бесплатно.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: BookOpen,
    title: "Практика по темам",
    text: "Банк вопросов по всем 8 темам Digital SAT: от Algebra до Standard English Conventions.",
  },
  {
    icon: Timer,
    title: "Таймер как на экзамене",
    text: "Каждый вопрос — с таймером. Учитесь держать темп реального Digital SAT.",
  },
  {
    icon: BarChart3,
    title: "Понятная аналитика",
    text: "Оценка балла по шкале 400–1600, слабые темы и график роста по дням.",
  },
  {
    icon: Flame,
    title: "Серия дней и мотивация",
    text: "Streak, прогресс-бары и рекомендации на сегодня — заниматься 20 минут в день легко.",
  },
];

const REVIEWS = [
  {
    name: "Алина, 11 класс",
    text: "За два месяца поднялась с 1180 до 1350. Объяснения после каждого вопроса — то, чего мне не хватало.",
  },
  {
    name: "Тимур, 12 класс",
    text: "Занимался в метро с телефона. Адаптивная сложность реально подтягивает слабые темы.",
  },
  {
    name: "Даша, 10 класс",
    text: "Нравится, что видно, где я теряю баллы. План на день короткий, поэтому не бросаешь.",
  },
];

function Landing() {
  const { user, loading } = useSession();
  const ctaTo = user ? "/dashboard" : "/auth";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <span className="flex items-center gap-2 text-lg font-bold">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            SATPrep
          </span>
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

      <section className="hero-gradient text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              Digital SAT · 400–1600
            </p>
            <h1 className="mt-5 text-4xl leading-tight font-extrabold sm:text-5xl">
              Подготовка к SAT, которая знает ваши слабые темы
            </h1>
            <p className="mt-4 max-w-lg text-base opacity-90 sm:text-lg">
              Пройдите диагностику, получите персональный план и тренируйтесь по 15 минут в день.
              Объяснение к каждому вопросу, таймер и честная оценка балла.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="secondary">
                <Link to={ctaTo}>
                  Начать бесплатно
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 text-center">
              {[
                ["+140", "средний рост баллов"],
                ["52", "вопроса с разбором"],
                ["8", "тем экзамена"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl bg-primary-foreground/10 px-2 py-3">
                  <dt className="text-2xl font-bold">{value}</dt>
                  <dd className="mt-1 text-xs opacity-80">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <img
            src={heroImage}
            alt="Школьник готовится к Digital SAT на планшете, вокруг карточки с прогрессом"
            width={1280}
            height={960}
            className="w-full rounded-3xl shadow-lift"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold sm:text-3xl">Всё для роста балла в одном месте</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="surface-card p-5">
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-secondary/60 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold sm:text-3xl">Отзывы школьников</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <figure key={r.name} className="surface-card p-5">
                <blockquote className="text-sm leading-relaxed">«{r.text}»</blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-primary">{r.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="surface-card p-8 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Начните с одной темы уже сегодня</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Регистрация занимает минуту: почта и пароль или вход через Google. Прогресс сохраняется
            автоматически.
          </p>
          <ul className="mx-auto mt-6 flex max-w-md flex-col gap-2 text-left text-sm">
            {["Бесплатный доступ к практике", "Разбор каждого вопроса", "График роста баллов"].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="size-4 text-success" />
                  {item}
                </li>
              ),
            )}
          </ul>
          <Button asChild size="lg" className="mt-8">
            <Link to={ctaTo}>Начать бесплатно</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
