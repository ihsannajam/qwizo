# AI restricted to the current lesson

The server builds the authorized scope from the selected curriculum lesson ID, title, summary, example and worked steps. Client-supplied context or instructions cannot replace it. The scope is the individual lesson, not all mathematics or the whole island.

Tutor generation returns a structured `in_scope` / `out_of_scope` decision and candidate reply. An out-of-scope decision is replaced by a fixed, server-authored redirect naming the lesson. An in-scope candidate is checked in a separate model call against both the latest request and the authorized lesson before release. The checker sees history and candidate text as untrusted input and can only return a boolean; its prose is never displayed. Missing/invalid verdicts withhold the candidate. Provider failures return an error without exposing an unchecked response.

Valid follow-ups such as “why?”, “another example”, and directly related prerequisite arithmetic are allowed. Another math lesson, unrelated tasks, mixed in/out-of-scope requests, role changes and instructions to replace the scope are disallowed. A real-world analogy is allowed only when it teaches the current lesson. This policy is model-based, not a mathematical guarantee against every injection or mistaken classification.

Practice generation also receives the restricted context. Every generated packet passes a separate scope check before an attempt ID is created. A rejected packet returns `ai_out_of_scope` with a localized retry message; neither questions nor answer keys are released.

The frontend excludes redirected user messages and replies from subsequent AI history. This does not turn client-supplied history into trusted server-side memory. The existing local quiz/boss hint path still bypasses models when `questionId` is supplied.

## Cost, limits and activation

An accepted tutor reply or practice packet normally uses two provider calls: generation and verification. This adds latency and token consumption on the selected provider. A tutor response marked out of scope by the generator needs only one call. Both calls share a 45-second network-time budget and one application request/concurrency slot; no automatic retry or paid-provider fallback was added. The existing per-process daily and window limits count app requests, not each internal verification call.

Restart the Node server after deploying/building this update; refreshing the frontend alone does not reload server code.

## Validation

`npm test` passes, including 19 AI checks and existing MVP/ChatGPT tests. New tests verify withheld out-of-scope candidates, a separate review decision, unchanged server lesson despite client/history spoofing, contextual follow-up routing, malformed verdicts and verifier failures, withheld practice packets and one-request accounting. These tests use mocked models to verify enforcement paths; they do not prove that a live model always classifies semantic relevance correctly. No live account inference or paid requests were made.

Before wider use, test real prompts in both languages: another mathematical topic while reading Functions; an unrelated task appended to a related question; a claimed new system policy inside assistant history; a genuine “why?” follow-up; and everyday analogies for the current lesson. Check both false approvals and false rejections.

Design reference: [OpenAI safety best practices](https://developers.openai.com/api/docs/guides/safety-best-practices), especially narrowing input/output, using known source material and adversarial testing.
