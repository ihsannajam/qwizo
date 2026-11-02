import type { LearningUnit, Question } from "./curriculum";
export type HelpKind = "concept" | "hint" | "example";
export function tutorReply(
  unit: LearningUnit,
  question: Question | undefined,
  answered: boolean,
  kind: HelpKind,
  language: "id" | "en",
) {
  if (kind === "hint" && question) return question.hint[language];
  if (kind === "example") {
    if (question && !answered)
      return (
        (language === "id"
          ? "Selesaikan pilihanmu dahulu. Sementara itu, gunakan petunjuk ini: "
          : "Try your choice first. For now, use this hint: ") +
        question.hint[language]
      );
    return question ? question.explanation[language] : unit.steps[1][language];
  }
  return unit.steps[0][language];
}
