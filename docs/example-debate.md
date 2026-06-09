# Example Debate

This is an illustrative transcript showing the shape of Agent Debate output.
It was lightly edited for length; real runs are saved automatically to `runs/`
as Markdown. It shows the three debate rounds across agents followed by the
final synthesis, which **Codex** produces by default.

- Topic: Should we move debate transcript storage from flat Markdown files to SQLite?
- Project: agent-debate
- Workflow: Custom 5-step debate workflow
- Language: English
- Participants: Codex, Gemini, Claude

## Round 1: Codex

- Markdown files are the project's current contract: greppable, diffable, and
  openable without tooling. That is a real feature for a local-first tool.
- SQLite buys indexed search and structured queries once transcript counts grow
  into the thousands.
- Risk: a database is a migration and a backup story the project does not have yet.
- Opening stance: keep Markdown; revisit only if search becomes a felt problem.

## Round 1: Gemini

- The run list already caps at 20 and sorts by mtime; that hints the flat-file
  approach is straining at the edges.
- SQLite would make filtering by agent, date, or topic trivial.
- But it adds a binary dependency surface to a zero-dependency project.
- Opening stance: adopt SQLite, scoped to an index over the Markdown files.

## Round 1: Claude

- The transcripts themselves are the durable artifact; storage is secondary.
- A hybrid is possible: keep Markdown as the source of truth, add a lightweight
  index for search.
- Pure SQLite would couple the user's data to the app and weaken portability.
- Opening stance: keep Markdown as truth; add an optional index later.

## Round 2: Codex

- Gemini's point about the 20-item cap is fair, but that is a UI limit, not a
  storage limit. It can be paged without changing the storage model.
- Aligning with Claude: Markdown stays the source of truth.

## Round 2: Gemini

- Conceding the dependency concern: an index built on demand from Markdown keeps
  the zero-dependency promise for the core path.
- Updated stance: index, do not migrate.

## Round 2: Claude

- Agreement is converging on "Markdown is truth, index is derived."
- The remaining question is whether the index ships now or later.

## Round 3: Codex

- Strongest direction: keep Markdown as the canonical store; defer any database.
- If/when search is needed, build an in-memory index at startup from `runs/`.

## Round 3: Gemini

- Endorse deferring the database. An in-memory index is cheap and disposable.

## Round 3: Claude

- Settled. No storage migration; revisit search as a separate, additive feature.

## Final: Codex Synthesis

The agents converged: keep flat Markdown as the source of truth and avoid a
database migration now. Search, if it becomes a real need, should be a derived,
in-memory index rebuilt from `runs/` at startup.

| Agent  | Opening view              | Strongest shift                         | Final stance                  |
| ------ | ------------------------- | --------------------------------------- | ----------------------------- |
| Codex  | Keep Markdown             | Reframed UI cap vs storage limit        | Keep Markdown, defer database |
| Gemini | Adopt SQLite              | Dependency concern → index, not migrate | Derived index, no migration   |
| Claude | Markdown truth + index    | Helped converge on "truth vs derived"   | Markdown truth, additive index |

**Recommendation**

- Keep `runs/*.md` as the canonical storage format.
- Do not add a database dependency.
- If search is requested, add an in-memory index built from `runs/` at startup,
  behind a clearly optional code path.
