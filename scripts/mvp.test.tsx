import assert from "node:assert/strict";
import { renderToString } from "react-dom/server";
import {
  curriculum,
  bossQuestions,
  lessonIds,
} from "../src/features/learning/curriculum";
import { topics } from "../src/features/island/data/topics";
import {
  initialProgress,
  migrateLegacyProgress,
  submitLesson,
  submitBoss,
  claimQuest,
  currentDaily,
  canBattle,
  unlocked,
  levelInfo,
  mastery,
  visibleStreak,
  battleStatus,
  grade,
} from "../src/domain/progression";
import { LearningSession } from "../src/features/learning/LearningSession";
import { TopicPanel } from "../src/features/island/TopicPanel";
import { TutorPanel } from "../src/features/learning/TutorPanel";
import { newSession, sessionReducer } from "../src/features/learning/session";
import { tutorReply } from "../src/features/learning/tutor";
import { useGame } from "../src/store/game";

let checks = 0;
function check(name: string, run: () => void) {
  run();
  checks++;
  console.log(`✓ ${name}`);
}
const today = "2026-11-02";
const perfect = (index: number) =>
  curriculum[index].questions.map((q) => q.answer);
const wrong = (index: number) =>
  curriculum[index].questions.map((q) => (q.answer + 1) % 4);
check(
  "Quiz lifecycle blocks empty/double answers and resets cleanly on retry",
  () => {
    let state = newSession();
    state = sessionReducer(state, { type: "choose", choice: 1 });
    assert.equal(state.choice, null);
    state = sessionReducer(state, { type: "start" });
    assert.equal(state.phase, "quiz");
    assert.equal(sessionReducer(state, { type: "check" }), state);
    assert.equal(sessionReducer(state, { type: "next" }), state);
    for (let i = 0; i < 3; i++) {
      state = sessionReducer(state, { type: "choose", choice: i });
      state = sessionReducer(state, { type: "check" });
      assert.equal(state.answers.length, i + 1);
      assert.equal(sessionReducer(state, { type: "check" }), state);
      assert.equal(sessionReducer(state, { type: "choose", choice: 3 }), state);
      if (i < 2) state = sessionReducer(state, { type: "next" });
    }
    state = sessionReducer(state, { type: "result" });
    assert.equal(state.phase, "result");
    assert.equal(state.answers.length, 3);
    state = sessionReducer(state, { type: "retry" });
    assert.equal(state.phase, "quiz");
    assert.deepEqual(state.answers, []);
    assert.equal(state.choice, null);
    assert.equal(state.checked, false);
  },
);
check(
  "Tutor gives hints before checking and explanations only after checking, in both languages",
  () => {
    for (const unit of curriculum)
      for (const question of unit.questions)
        for (const language of ["id", "en"] as const) {
          assert.equal(
            tutorReply(unit, question, false, "hint", language),
            question.hint[language],
          );
          assert.notEqual(
            tutorReply(unit, question, false, "example", language),
            question.explanation[language],
          );
          assert.ok(
            tutorReply(unit, question, false, "example", language).includes(
              question.hint[language],
            ),
          );
          assert.equal(
            tutorReply(unit, question, true, "example", language),
            question.explanation[language],
          );
          assert.equal(
            tutorReply(unit, undefined, false, "example", language),
            unit.steps[1][language],
          );
        }
  },
);
check(
  "Legacy demo completions become reading history without fake mastery or rewards",
  () => {
    const state = migrateLegacyProgress([
      "fungsi-1",
      "fungsi-1",
      "fungsi-2",
      "unknown",
      3,
    ]);
    assert.deepEqual(state.readLessons, ["fungsi-1", "fungsi-2"]);
    assert.deepEqual(state.completedLessons, []);
    assert.equal(state.xp, 0);
    assert.equal(mastery(state), 0);
    assert.equal(canBattle(state), false);
    assert.deepEqual(migrateLegacyProgress(null).readLessons, []);
  },
);
check(
  "24 units match the map; 72 unique bilingual questions and worked lessons",
  () => {
    assert.deepEqual(
      lessonIds,
      topics.flatMap((t) => t.lessons.map((l) => l.id)),
    );
    assert.equal(curriculum.length, 24);
    const ids = new Set<string>();
    for (const unit of curriculum) {
      assert.equal(unit.questions.length, 3);
      assert.equal(unit.steps.length, 2);
      for (const step of unit.steps)
        assert.ok(step.id.length > 20 && step.en.length > 20);
      for (const q of unit.questions) {
        assert.ok(!ids.has(q.id));
        ids.add(q.id);
        assert.equal(q.options.length, 4);
        assert.ok(q.answer >= 0 && q.answer < 4);
        for (const text of [q.prompt, q.hint, q.explanation, ...q.options])
          assert.ok(text.id && text.en);
        assert.equal(new Set(q.options.map((o) => o.id)).size, 4);
      }
    }
    assert.equal(ids.size, 72);
  },
);
check("Incomplete, invalid and locked submissions are rejected", () => {
  const state = initialProgress();
  assert.throws(() => submitLesson(state, "functie", [0, 0, 0]));
  assert.throws(() => submitLesson(state, lessonIds[1], perfect(1)));
  for (const answers of [
    [],
    [0],
    [NaN, 0, 0],
    [-1, 0, 0],
    [4, 0, 0],
    [0.5, 0, 0],
    new Array<number>(3),
  ])
    assert.throws(() => submitLesson(state, lessonIds[0], answers));
  assert.throws(() => submitBoss(state, []));
  assert.equal(unlocked(state, lessonIds[0]), true);
  assert.equal(unlocked(state, lessonIds[1]), false);
});
check(
  "Failed quiz keeps next lesson locked without subtracting rewards",
  () => {
    const { state, outcome } = submitLesson(
      initialProgress(),
      lessonIds[0],
      wrong(0),
      today,
    );
    assert.equal(outcome.passed, false);
    assert.equal(state.xp, 0);
    assert.equal(state.coins, 0);
    assert.equal(state.completedLessons.length, 0);
    assert.equal(state.daily.questions.length, 3);
    assert.equal(unlocked(state, lessonIds[1]), false);
  },
);
check(
  "Two of three passes; reward is once-only and best score never decreases",
  () => {
    const answers = perfect(0);
    answers[2] = (answers[2] + 1) % 4;
    const first = submitLesson(initialProgress(), lessonIds[0], answers, today);
    assert.equal(first.outcome.passed, true);
    assert.equal(first.state.xp, 80);
    assert.equal(first.state.coins, 20);
    assert.ok(unlocked(first.state, lessonIds[1]));
    const repeat = submitLesson(first.state, lessonIds[0], perfect(0), today);
    assert.equal(repeat.outcome.xp, 0);
    assert.equal(repeat.state.results[lessonIds[0]].best, 3);
    assert.equal(repeat.state.results[lessonIds[0]].attempts, 2);
    assert.equal(repeat.state.daily.questions.length, 3);
    const fail = submitLesson(repeat.state, lessonIds[0], wrong(0), today);
    assert.equal(fail.state.results[lessonIds[0]].best, 3);
    assert.equal(fail.state.xp, 80);
    assert.equal(fail.state.completedLessons.length, 1);
  },
);
check("Daily claims require completion and are idempotent", () => {
  let state = initialProgress();
  assert.equal(claimQuest(state, "lesson", today), state);
  state = submitLesson(state, lessonIds[0], perfect(0), today).state;
  state = claimQuest(state, "lesson", today);
  assert.equal(state.xp, 130);
  assert.equal(state.coins, 30);
  assert.equal(claimQuest(state, "lesson", today), state);
  assert.equal(claimQuest(state, "questions", today), state);
  state = submitLesson(state, lessonIds[1], perfect(1), today).state;
  state = claimQuest(state, "questions", today);
  assert.equal(state.xp, 310);
  assert.equal(state.daily.questions.length, 6);
  assert.equal(levelInfo(state.xp).level, 2);
  assert.equal(levelInfo(state.xp).current, 10);
});
check(
  "New local day resets quests while streak increments only once per day",
  () => {
    let state = submitLesson(
      initialProgress(),
      lessonIds[0],
      perfect(0),
      today,
    ).state;
    state = claimQuest(state, "lesson", today);
    assert.equal(state.streak, 1);
    state = submitLesson(state, lessonIds[0], perfect(0), today).state;
    assert.equal(state.streak, 1);
    assert.equal(currentDaily(state, "2026-11-03").claimed.length, 0);
    state = submitLesson(state, lessonIds[0], perfect(0), "2026-11-03").state;
    assert.equal(state.streak, 2);
    assert.equal(state.daily.questions.length, 3);
    const oldXP = state.xp;
    state = claimQuest(state, "lesson", "2026-11-03");
    assert.equal(state.xp, oldXP + 50);
    assert.equal(visibleStreak(state, "2026-11-05"), 0);
    state = submitLesson(state, lessonIds[0], perfect(0), "2026-11-06").state;
    assert.equal(state.streak, 1);
  },
);
let full = initialProgress();
check("All 24 lessons form a complete progression and unlock boss", () => {
  for (let i = 0; i < curriculum.length; i++) {
    assert.ok(unlocked(full, lessonIds[i]));
    full = submitLesson(full, lessonIds[i], perfect(i), today).state;
  }
  assert.equal(full.completedLessons.length, 24);
  assert.equal(full.xp, 1920);
  assert.equal(full.coins, 480);
  assert.equal(mastery(full), 100);
  assert.ok(canBattle(full));
  full = claimQuest(full, "topics", today);
  assert.equal(full.daily.topics.length, 6);
  assert.equal(full.xp, 1970);
});
check(
  "Boss HP, defeat, victory, and replay rewards obey the same rules",
  () => {
    const hits = bossQuestions.slice(0, 5).map((q) => q.answer);
    assert.equal(battleStatus(hits).bossHP, 0);
    assert.ok(battleStatus(hits).victory);
    const victory = submitBoss(full, hits, today);
    assert.ok(victory.state.bossWon);
    assert.equal(victory.outcome.xp, 300);
    assert.equal(victory.outcome.coins, 100);
    const replay = submitBoss(victory.state, hits, today);
    assert.equal(replay.outcome.xp, 0);
    assert.equal(replay.outcome.coins, 0);
    const misses = bossQuestions.slice(0, 2).map((q) => (q.answer + 1) % 4);
    assert.equal(battleStatus(misses).playerHP, 0);
    const defeat = submitBoss(full, misses, today);
    assert.equal(defeat.outcome.passed, false);
    assert.equal(defeat.state.xp, full.xp);
    assert.equal(defeat.state.bossWon, false);
    assert.throws(() => submitBoss(full, hits.slice(0, 3), today));
    assert.throws(() =>
      submitBoss(full, [...misses, bossQuestions[2].answer], today),
    );
    assert.throws(() =>
      submitBoss(full, [...hits, bossQuestions[5].answer], today),
    );
  },
);
check("Boss checkpoints include every topic", () => {
  assert.equal(bossQuestions.length, 6);
  assert.equal(new Set(bossQuestions.map((q) => q.id.split("-")[0])).size, 6);
  assert.equal(
    grade(
      bossQuestions,
      bossQuestions.map((q) => q.answer),
    ),
    6,
  );
});
localStorage.setItem(
  "qwizo-sprint1",
  JSON.stringify({
    version: 0,
    state: {
      name: "QA",
      loggedIn: true,
      language: "id",
      completedLessons: ["fungsi-1", "fungsi-2"],
      claimed: true,
    },
  }),
);
await useGame.persist.rehydrate();
check(
  "Zustand migrates old saves, persists earned progress and rejects duplicate rewards",
  () => {
    const game = useGame.getState();
    assert.equal(game.name, "QA");
    assert.ok(game.loggedIn);
    assert.ok(game.migrationNotice);
    assert.deepEqual(game.readLessons, ["fungsi-1", "fungsi-2"]);
    assert.equal(game.completedLessons.length, 0);
    assert.equal(game.finishQuiz(lessonIds[0], perfect(0)).xp, 80);
    assert.equal(useGame.getState().finishQuiz(lessonIds[0], perfect(0)).xp, 0);
    const stored = JSON.parse(localStorage.getItem("qwizo-sprint1")!);
    assert.equal(stored.version, 2);
    assert.equal(stored.state.xp, 80);
    assert.deepEqual(stored.state.completedLessons, ["fungsi-1"]);
    assert.equal(stored.state.results["fungsi-1"].attempts, 2);
  },
);
check(
  "Reading pages, locked topic, tutor and boss arena render without runtime errors",
  () => {
    // Sheet captures the previously focused DOM node during rendering.
    Object.defineProperty(globalThis, "document", {
      value: { activeElement: null },
      configurable: true,
    });
    for (const unit of curriculum) {
      const html = renderToString(
        <LearningSession id={unit.id} close={() => {}} next={() => {}} />,
      );
      assert.ok(html.includes("Siap! Mulai kuis"));
      assert.ok(html.includes("worked-steps"));
    }
    const boss = renderToString(
      <LearningSession id="boss" close={() => {}} next={() => {}} />,
    );
    assert.ok(boss.includes("crystal-guardian"));
    assert.ok(boss.includes("Kirim serangan"));
    const topic = renderToString(
      <TopicPanel topic={topics[0]} close={() => {}} start={() => {}} />,
    );
    assert.ok(topic.includes("Lulus materi sebelumnya"));
    const tutor = renderToString(
      <TutorPanel unit={curriculum[0]} answered={false} close={() => {}} />,
    );
    assert.ok(tutor.includes("bukan AI langsung"));
  },
);
console.log(
  `Passed ${checks} MVP checks: learning → quiz → rewards → unlock → boss, quests/streak, and component rendering.`,
);
