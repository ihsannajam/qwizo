import {
  bossQuestions,
  findUnit,
  lessonIds,
  type Question,
} from "../features/learning/curriculum";
export const RULES = {
  pass: 2,
  lessonXP: 80,
  lessonCoins: 20,
  bossXP: 300,
  bossCoins: 100,
  xpPerLevel: 300,
} as const;
export type QuestId = "lesson" | "questions" | "topics";
export interface DailyProgress {
  date: string;
  lessons: string[];
  questions: string[];
  topics: string[];
  claimed: QuestId[];
}
export interface LessonResult {
  best: number;
  attempts: number;
  last: number;
}
export interface Progression {
  xp: number;
  coins: number;
  results: Record<string, LessonResult>;
  readLessons: string[];
  completedLessons: string[];
  streak: number;
  lastActivity: string | null;
  daily: DailyProgress;
  bossWon: boolean;
  bossAttempts: number;
}
export interface Outcome {
  correct: number;
  total: number;
  passed: boolean;
  xp: number;
  coins: number;
  first: boolean;
}
export const dateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const dayNumber = (key: string) => Date.parse(`${key}T00:00:00Z`) / 86400000;
export const emptyDaily = (date = dateKey()): DailyProgress => ({
  date,
  lessons: [],
  questions: [],
  topics: [],
  claimed: [],
});
export const initialProgress = (): Progression => ({
  xp: 0,
  coins: 0,
  results: {},
  readLessons: [],
  completedLessons: [],
  streak: 0,
  lastActivity: null,
  daily: emptyDaily(),
  bossWon: false,
  bossAttempts: 0,
});
export function migrateLegacyProgress(completed: unknown): Progression {
  return {
    ...initialProgress(),
    readLessons: Array.isArray(completed)
      ? [
          ...new Set(
            completed.filter(
              (id): id is string =>
                typeof id === "string" && lessonIds.includes(id),
            ),
          ),
        ]
      : [],
  };
}
export const currentDaily = (state: Progression, today = dateKey()) =>
  state.daily.date === today ? state.daily : emptyDaily(today);
export const visibleStreak = (state: Progression, today = dateKey()) =>
  state.lastActivity && dayNumber(today) - dayNumber(state.lastActivity) <= 1
    ? state.streak
    : 0;
export const unlocked = (state: Progression, id: string) => {
  const index = lessonIds.indexOf(id);
  return (
    index >= 0 &&
    (index === 0 || state.completedLessons.includes(lessonIds[index - 1]))
  );
};
export const canBattle = (state: Progression) =>
  lessonIds.every((id) => state.completedLessons.includes(id));
export const mastery = (state: Progression, ids = lessonIds) =>
  Math.round(
    ids.reduce(
      (sum, id) => sum + ((state.results[id]?.best ?? 0) / 3) * 100,
      0,
    ) / ids.length,
  );
export const levelInfo = (xp: number) => ({
  level: Math.floor(xp / RULES.xpPerLevel) + 1,
  current: xp % RULES.xpPerLevel,
  next: RULES.xpPerLevel,
});
const unique = (items: string[]) => [...new Set(items)];
export const quests = [
  { id: "lesson" as const, target: 1, xp: 50, coins: 10 },
  { id: "questions" as const, target: 5, xp: 100, coins: 20 },
  { id: "topics" as const, target: 2, xp: 50, coins: 10 },
];
export const questValue = (day: DailyProgress, id: QuestId) =>
  id === "lesson"
    ? day.lessons.length
    : id === "questions"
      ? day.questions.length
      : day.topics.length;
function activity(state: Progression, today: string) {
  return {
    streak:
      state.lastActivity === today
        ? state.streak
        : state.lastActivity &&
            dayNumber(today) - dayNumber(state.lastActivity) === 1
          ? state.streak + 1
          : 1,
    lastActivity: today,
  };
}
export function grade(questions: Question[], answers: number[]) {
  if (
    answers.length !== questions.length ||
    Array.from(answers).some(
      (a, i) =>
        !Number.isInteger(a) || a < 0 || a >= questions[i].options.length,
    )
  )
    throw new Error("Invalid answer set");
  return questions.filter((q, i) => q.answer === answers[i]).length;
}
export function submitLesson(
  state: Progression,
  id: string,
  answers: number[],
  today = dateKey(),
): { state: Progression; outcome: Outcome } {
  const unit = findUnit(id);
  if (!unit || !unlocked(state, id)) throw new Error("Lesson is locked");
  const correct = grade(unit.questions, answers),
    passed = correct >= RULES.pass;
  const first = passed && !state.completedLessons.includes(id);
  const xp = first ? RULES.lessonXP : 0,
    coins = first ? RULES.lessonCoins : 0;
  const previous = state.results[id];
  const day = currentDaily(state, today);
  return {
    state: {
      ...state,
      ...activity(state, today),
      xp: state.xp + xp,
      coins: state.coins + coins,
      results: {
        ...state.results,
        [id]: {
          best: Math.max(previous?.best ?? 0, correct),
          last: correct,
          attempts: (previous?.attempts ?? 0) + 1,
        },
      },
      completedLessons: first
        ? [...state.completedLessons, id]
        : state.completedLessons,
      readLessons: unique([...state.readLessons, id]),
      daily: {
        ...day,
        lessons: passed ? unique([...day.lessons, id]) : day.lessons,
        questions: unique([
          ...day.questions,
          ...unit.questions.map((q) => q.id),
        ]),
        topics: unique([...day.topics, id.split("-")[0]]),
      },
    },
    outcome: { correct, total: 3, passed, xp, coins, first },
  };
}
export function claimQuest(
  state: Progression,
  id: QuestId,
  today = dateKey(),
): Progression {
  const quest = quests.find((q) => q.id === id),
    day = currentDaily(state, today);
  if (!quest || day.claimed.includes(id) || questValue(day, id) < quest.target)
    return state;
  return {
    ...state,
    xp: state.xp + quest.xp,
    coins: state.coins + quest.coins,
    daily: { ...day, claimed: [...day.claimed, id] },
  };
}
export function battleStatus(answers: number[]) {
  const answered = bossQuestions.slice(0, answers.length);
  const hits = grade(answered, answers),
    misses = answers.length - hits;
  return {
    hits,
    playerHP: Math.max(0, 100 - misses * 50),
    bossHP: Math.max(0, 100 - hits * 20),
    finished:
      hits >= 5 || misses >= 2 || answers.length === bossQuestions.length,
    victory: hits >= 5,
  };
}
export function submitBoss(
  state: Progression,
  answers: number[],
  today = dateKey(),
): { state: Progression; outcome: Outcome } {
  if (!canBattle(state) || answers.length > bossQuestions.length)
    throw new Error("Boss is locked");
  for (let n = 1; n < answers.length; n++)
    if (battleStatus(answers.slice(0, n)).finished)
      throw new Error("Battle already ended");
  const battle = battleStatus(answers);
  if (!battle.finished) throw new Error("Battle is unfinished");
  const first = battle.victory && !state.bossWon,
    xp = first ? RULES.bossXP : 0,
    coins = first ? RULES.bossCoins : 0;
  const day = currentDaily(state, today);
  return {
    state: {
      ...state,
      ...activity(state, today),
      xp: state.xp + xp,
      coins: state.coins + coins,
      bossWon: state.bossWon || battle.victory,
      bossAttempts: state.bossAttempts + 1,
      daily: {
        ...day,
        questions: unique([
          ...day.questions,
          ...bossQuestions.slice(0, answers.length).map((q) => q.id),
        ]),
      },
    },
    outcome: {
      correct: battle.hits,
      total: answers.length,
      passed: battle.victory,
      first,
      xp,
      coins,
    },
  };
}
