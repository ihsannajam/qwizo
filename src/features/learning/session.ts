export interface SessionState {
  phase: "read" | "quiz" | "result";
  answers: number[];
  choice: number | null;
  checked: boolean;
}
export type SessionEvent =
  | { type: "start" | "check" | "next" | "result" | "retry" | "review" }
  | { type: "choose"; choice: number };
export const newSession = (boss = false): SessionState => ({
  phase: boss ? "quiz" : "read",
  answers: [],
  choice: null,
  checked: false,
});
export function sessionReducer(
  state: SessionState,
  event: SessionEvent,
): SessionState {
  switch (event.type) {
    case "start":
      return state.phase === "read" ? { ...state, phase: "quiz" } : state;
    case "choose":
      return state.phase === "quiz" &&
        !state.checked &&
        Number.isInteger(event.choice) &&
        event.choice >= 0 &&
        event.choice < 4
        ? { ...state, choice: event.choice }
        : state;
    case "check":
      return state.phase === "quiz" && !state.checked && state.choice !== null
        ? { ...state, answers: [...state.answers, state.choice], checked: true }
        : state;
    case "next":
      return state.phase === "quiz" && state.checked
        ? { ...state, choice: null, checked: false }
        : state;
    case "result":
      return state.phase === "quiz" && state.checked
        ? { ...state, phase: "result" }
        : state;
    case "retry":
      return state.phase === "result" ? newSession(true) : state;
    case "review":
      return state.phase === "result" ? newSession() : state;
  }
}
