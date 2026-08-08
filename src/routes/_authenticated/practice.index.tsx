import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Calculator, Sparkles, Target, Compass } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useSession } from "@/hooks/use-session";
import { attemptsQuery, buildStats } from "@/lib/queries";
import { SECTION_LABELS, TOPICS, type Section } from "@/lib/sat";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/practice/")({
  head: () => ({
    meta: [
      { title: "Практика по темам — Elevate-SAT" },
      {
        name: "description",
        content: "Модули практики Digital SAT: Math (Algebra, Geometry) & Reading/Writing.",
      },
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
    <AppShell title="Практика по темам" subtitle="Выберите модуль Digital SAT — ИИ-сложность адаптивно подстроится под ваш уровень">
      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-xl bg-[#8083ff]/20 text-[#c0c1ff]">
                {section === "math" ? <Calculator className="size-4" /> : <BookOpen className="size-4" />}
              </span>
              <h2 className="text-xl font-headline font-bold text-white">
                {SECTION_LABELS[section]}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {TOPICS.filter((t) => t.section === section).map((topic) => {
                const stat = stats.topics.find((s) => s.slug === topic.slug);
                const accuracy = stat?.accuracy ? Math.round(stat.accuracy * 100) : 0;

                return (
                  <Link
                    key={topic.slug}
                    to="/practice/$topic"
                    params={{ topic: topic.slug }}
                    className="bg-[#1c1f29]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-[#8083ff]/40 transition-all hover:-translate-y-1 shadow-xl group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-lg font-headline font-bold text-white group-hover:text-[#c0c1ff] transition-colors">
                          {topic.name}
                        </h3>
                        <span className="p-2 rounded-xl bg-[#272a34] text-[#c7c4d7] group-hover:bg-[#8083ff] group-hover:text-[#1000a9] transition-all">
                          <ArrowRight className="size-4" />
                        </span>
                      </div>
                      <p className="text-xs text-[#c7c4d7] leading-relaxed mb-6">
                        {topic.blurb}
                      </p>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#908fa0] font-medium">
                          {stat?.total ? `${stat.total} ответов` : "Еще не начато"}
                        </span>
                        <span className="font-bold text-[#4edea3]">
                          {stat?.total ? `${accuracy}% точность` : "0%"}
                        </span>
                      </div>
                      <Progress className="h-1.5 bg-[#272a34]" value={accuracy} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        <div className="bg-gradient-to-r from-[#1c1f29] via-[#181b25] to-[#0b0e17] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#6001d1]/30 text-[#d2bbff] shrink-0">
              <Sparkles className="size-6 animate-pulse" />
            </span>
            <div>
              <h3 className="text-lg font-headline font-bold text-white">Разбор закладок в профиле</h3>
              <p className="text-xs text-[#c7c4d7]">
                Все вопросы, отмеченные значком закладок, сохраняются для итогового повторения.
              </p>
            </div>
          </div>
          <Button asChild className="bg-[#8083ff] text-[#1000a9] hover:bg-[#c0c1ff] font-bold px-6 py-5 rounded-xl shrink-0">
            <Link to="/profile">Открыть закладки →</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
