import { useGame } from "../../store/game";
import {
  currentDaily,
  levelInfo,
  mastery,
  questValue,
  quests,
  visibleStreak,
} from "../../domain/progression";
export function useProgress() {
  const game = useGame();
  const day = currentDaily(game);
  return {
    ...levelInfo(game.xp),
    xp: game.xp,
    coins: game.coins,
    mastery: mastery(game),
    streak: visibleStreak(game),
    day,
    badges:
      Math.floor(game.completedLessons.length / 4) + (game.bossWon ? 1 : 0),
    questsDone: quests.filter((q) => questValue(day, q.id) >= q.target).length,
  };
}
