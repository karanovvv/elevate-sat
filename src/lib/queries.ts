import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Difficulty, Section } from "./sat";
import { TOPICS, sectionScore, topicByDbName } from "./sat";

export type Question = {
  id: string;
  section: Section;
  topic: string;
  difficulty: Difficulty;
  passage: string | null;
  prompt: string;
  choices: string[];
  correct_index: number;
  explanation: string;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  current_level: string | null;
  target_score: number | null;
  exam_date: string | null;
  daily_minutes: number | null;
  onboarded: boolean;
  streak_days: number;
  last_practice_date: string | null;
  notifications_enabled: boolean;
};

export type AttemptRow = {
  id: string;
  question_id: string;
  is_correct: boolean;
  seconds_spent: number;
  created_at: string;
  questions: { topic: string; section: string; difficulty: string } | null;
};

export type TestAttempt = {
  id: string;
  label: string;
  math_score: number;
  rw_score: number;
  total_score: number;
  created_at: string;
};

export const profileQuery = (userId: string) =>
  queryOptions({
    queryKey: ["profile", userId],
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return (data as Profile | null) ?? null;
    },
  });

export const questionsQuery = (dbTopic: string) =>
  queryOptions({
    queryKey: ["questions", dbTopic],
    queryFn: async (): Promise<Question[]> => {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("topic", dbTopic)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Question[];
    },
  });

export const attemptsQuery = (userId: string) =>
  queryOptions({
    queryKey: ["attempts", userId],
    queryFn: async (): Promise<AttemptRow[]> => {
      const { data, error } = await supabase
        .from("question_attempts")
        .select("id, question_id, is_correct, seconds_spent, created_at, questions(topic, section, difficulty)")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as AttemptRow[];
    },
  });

export const bookmarksQuery = (userId: string) =>
  queryOptions({
    queryKey: ["bookmarks", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("id, question_id, created_at, questions(id, topic, section, difficulty, prompt, explanation)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const testAttemptsQuery = (userId: string) =>
  queryOptions({
    queryKey: ["test-attempts", userId],
    queryFn: async (): Promise<TestAttempt[]> => {
      const { data, error } = await supabase
        .from("test_attempts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as TestAttempt[];
    },
  });

export type TopicStat = {
  slug: string;
  name: string;
  section: Section;
  total: number;
  correct: number;
  accuracy: number;
};

export type Stats = {
  total: number;
  correct: number;
  accuracy: number;
  mathAccuracy: number;
  rwAccuracy: number;
  estimatedScore: number;
  topics: TopicStat[];
  weakest: TopicStat[];
  daily: { date: string; score: number; answered: number }[];
  avgSeconds: number;
};

export function buildStats(attempts: AttemptRow[]): Stats {
  const byTopic = new Map<string, { total: number; correct: number }>();
  let mathTotal = 0;
  let mathCorrect = 0;
  let rwTotal = 0;
  let rwCorrect = 0;
  let seconds = 0;

  for (const a of attempts) {
    const topic = a.questions?.topic ?? "";
    const entry = byTopic.get(topic) ?? { total: 0, correct: 0 };
    entry.total += 1;
    if (a.is_correct) entry.correct += 1;
    byTopic.set(topic, entry);
    seconds += a.seconds_spent;
    if (a.questions?.section === "math") {
      mathTotal += 1;
      if (a.is_correct) mathCorrect += 1;
    } else if (a.questions?.section === "rw") {
      rwTotal += 1;
      if (a.is_correct) rwCorrect += 1;
    }
  }

  const topics: TopicStat[] = TOPICS.map((t) => {
    const entry = byTopic.get(t.dbTopic) ?? { total: 0, correct: 0 };
    return {
      slug: t.slug,
      name: t.name,
      section: t.section,
      total: entry.total,
      correct: entry.correct,
      accuracy: entry.total ? entry.correct / entry.total : 0,
    };
  });

  const dailyMap = new Map<string, { total: number; correct: number }>();
  for (const a of attempts) {
    const date = a.created_at.slice(0, 10);
    const entry = dailyMap.get(date) ?? { total: 0, correct: 0 };
    entry.total += 1;
    if (a.is_correct) entry.correct += 1;
    dailyMap.set(date, entry);
  }
  const daily = [...dailyMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => {
      const acc = v.correct / v.total;
      return { date, score: sectionScore(acc) * 2, answered: v.total };
    });

  const total = attempts.length;
  const correct = attempts.filter((a) => a.is_correct).length;
  const mathAccuracy = mathTotal ? mathCorrect / mathTotal : 0;
  const rwAccuracy = rwTotal ? rwCorrect / rwTotal : 0;

  return {
    total,
    correct,
    accuracy: total ? correct / total : 0,
    mathAccuracy,
    rwAccuracy,
    estimatedScore: sectionScore(mathAccuracy) + sectionScore(rwAccuracy),
    topics,
    weakest: topics
      .filter((t) => t.total > 0)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3),
    daily,
    avgSeconds: total ? Math.round(seconds / total) : 0,
  };
}

export function labelForDbTopic(dbTopic: string) {
  return topicByDbName(dbTopic)?.name ?? dbTopic;
}
