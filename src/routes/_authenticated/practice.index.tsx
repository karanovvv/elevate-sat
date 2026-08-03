import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useSession } from "@/hooks/use-session";
import { attemptsQuery, buildStats } from "@/lib/queries";
import { SECTION_LABELS, TOPICS, type Section } from "@/lib/sat";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/practice/")({
  head: () => ({
    meta: [
      { title: "Практика по темам — SATPrep" },
      {
        name: "description",
        content:
          "Тренируйтесь по темам Digital SAT: Algebra, Advanced Math, Reading & Writing и другие.",
      },
      { property: "og:title", content: "Практика по темам — SATPrep" },
      { property: "og:description", content: "Банк вопросов с таймером и разбором решений." },
    ],
  }),
  component: PracticeIndex,
});

function PracticeIndex() {
  const { user } = useSession();
  const userId = user?.id ?? "";
  const { data: attempts = [] } = useQuery({
    ...attemptsQuery(userId),
    enabled: Boolean(userId),
  });
  const stats = buildStats(attempts);

  const sections: Section[] = ["math", "rw"];

  return (
    <AppShell title="Практика по темам" subtitle="Выберите тему — сложность подстроится под вас">
      {sections.map((section) => (
        <section key={section} className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">{SECTION_LABELS[section]}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {TOPICS.filter((t) => t.section === section).map((topic) => {
              const stat = stats.topics.find((s) => s.slug === topic.slug);
              return (
                <Link
                  key={topic.slug}
                  to="/practice/$topic"
                  params={{ topic: topic.slug }}
                  className="surface-card group p-5 transition-shadow hover:shadow-lift"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{topic.name}</h3>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{topic.blurb}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {stat?.total
                        ? `Точность ${Math.round(stat.accuracy * 100)}% · ${stat.total} ответов`
                        : "Ещё не начато"}
                    </span>
                  </div>
                  <Progress className="mt-2 h-1.5" value={(stat?.accuracy ?? 0) * 100} />
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <div className="surface-card p-5">
        <h2 className="font-semibold">Закладки «разобрать позже»</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Отмечайте сложные вопросы во время практики — они собираются в профиле.
        </p>
        <Button asChild variant="secondary" size="sm" className="mt-3">
          <Link to="/profile">Открыть профиль</Link>
        </Button>
      </div>
    </AppShell>
  );
}
