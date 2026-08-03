export type Section = "math" | "rw";
export type Difficulty = "Easy" | "Medium" | "Hard";

export type Topic = {
  slug: string;
  name: string;
  section: Section;
  dbTopic: string;
  blurb: string;
};

export const SECTION_LABELS: Record<Section, string> = {
  math: "Math",
  rw: "Reading & Writing",
};

export const TOPICS: Topic[] = [
  {
    slug: "algebra",
    name: "Algebra",
    section: "math",
    dbTopic: "Algebra",
    blurb: "Линейные уравнения, системы, неравенства, графики прямых",
  },
  {
    slug: "advanced-math",
    name: "Advanced Math",
    section: "math",
    dbTopic: "Advanced Math",
    blurb: "Квадратные уравнения, функции, показательные выражения",
  },
  {
    slug: "data-analysis",
    name: "Problem-Solving & Data Analysis",
    section: "math",
    dbTopic: "Problem-Solving & Data Analysis",
    blurb: "Проценты, отношения, статистика, вероятность",
  },
  {
    slug: "geometry",
    name: "Geometry & Trigonometry",
    section: "math",
    dbTopic: "Geometry & Trigonometry",
    blurb: "Углы, окружности, треугольники, тригонометрия",
  },
  {
    slug: "information-ideas",
    name: "Information & Ideas",
    section: "rw",
    dbTopic: "Information & Ideas",
    blurb: "Главная идея, выводы, работа с доказательствами",
  },
  {
    slug: "craft-structure",
    name: "Craft & Structure",
    section: "rw",
    dbTopic: "Craft & Structure",
    blurb: "Слова в контексте, функция текста, связь двух текстов",
  },
  {
    slug: "expression-of-ideas",
    name: "Expression of Ideas",
    section: "rw",
    dbTopic: "Expression of Ideas",
    blurb: "Переходы и риторический синтез заметок",
  },
  {
    slug: "conventions",
    name: "Standard English Conventions",
    section: "rw",
    dbTopic: "Standard English Conventions",
    blurb: "Грамматика, пунктуация, согласование",
  },
];

export function topicBySlug(slug: string) {
  return TOPICS.find((t) => t.slug === slug);
}

export function topicByDbName(name: string) {
  return TOPICS.find((t) => t.dbTopic === name);
}

/** Переводит точность (0..1) в балл раздела SAT (200–800, шаг 10). */
export function sectionScore(accuracy: number) {
  const raw = 200 + accuracy * 600;
  return Math.round(raw / 10) * 10;
}

export function totalScore(mathAccuracy: number, rwAccuracy: number) {
  return sectionScore(mathAccuracy) + sectionScore(rwAccuracy);
}

export function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  Easy: "Легко",
  Medium: "Средне",
  Hard: "Сложно",
};

export function nextDifficulty(current: Difficulty, wasCorrect: boolean): Difficulty {
  const order: Difficulty[] = ["Easy", "Medium", "Hard"];
  const i = order.indexOf(current);
  const next = wasCorrect ? Math.min(i + 1, 2) : Math.max(i - 1, 0);
  return order[next];
}
