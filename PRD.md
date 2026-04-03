---
repo: "uos-skills-catalog"
display_name: "@uos/skills-catalog"
package_name: "@uos/skills-catalog"
lane: "skills"
artifact_class: "TypeScript package / extracted skill and catalog home"
maturity: "strategic extraction target"
generated_on: "2026-04-03"
assumptions: "Grounded in the current split-repo contents, package metadata, README/PRD alignment pass, and the Paperclip plugin scaffold presence where applicable; deeper module-level inspection should refine implementation detail as the code evolves."
autonomy_mode: "maximum-capability autonomous work with deep research and explicit learning loops"
---

# PRD: @uos/skills-catalog

## 1. Product Intent

**Package / repo:** `@uos/skills-catalog`  
**Lane:** skills  
**Artifact class:** TypeScript package / extracted skill and catalog home  
**Current maturity:** strategic extraction target  
**Source-of-truth assumption:** Extracted home for vendored skills and generated catalogs; intended to absorb skill content still partly carried in core.
**Runtime form:** Split repo with package code as the source of truth and a Paperclip plugin scaffold available for worker, manifest, UI, and validation surfaces when the repo needs runtime or operator-facing behavior.

@uos/skills-catalog is the home for extracted skills, generated catalogs, metadata, and skill quality intelligence. It should make skills discoverable, evaluable, and portable while removing catalog debt from core.

## 2. Problem Statement

Skills are high-leverage assets, but they become hard to govern when mixed into unrelated repos or carried as vendored snapshots. Catalog quality, metadata discipline, and evaluation rigor determine whether skills scale or rot.

## 3. Target Users and Jobs to Be Done

- Teams discovering and composing skills into UOS workflows.
- Maintainers extracting skills out of core and tool bundles.
- Agents selecting the right skill for a task and learning from outcomes.
- Governance owners evaluating skill quality, duplication, and safety.

## 4. Outcome Thesis

**North star:** Skills become a first-class product surface: easy to find, easy to evaluate, easy to version, and decoupled from core runtime debt.

### 12-month KPI targets
- 100% of active catalog entries have normalized metadata, ownership, and lifecycle status fields.
- Duplicate or materially overlapping skills fall below 10% of the active catalog.
- The top 20 highest-traffic skills have evaluation scorecards covering quality, safety, and task fit.
- Search precision at 5 reaches >= 0.80 on the maintained benchmark query set.
- Usage and outcome feedback is captured for >= 75% of catalog entries surfaced in benchmark workflows.

### Acceptance thresholds for the next implementation wave
- A stable metadata schema and validation process exist for new and migrated skills.
- Deprecation, merge, and replacement rules are documented and enforced for overlapping skills.
- Catalog search and retrieval can explain why a skill was surfaced for a benchmark task.
- The first wave of skill quality evaluations is reproducible rather than anecdotal.

## 5. In Scope

- Skill metadata schemas, generated catalogs, and indexing.
- Extraction flow from core and related tool bundles.
- Skill quality evaluation, tagging, lineage, and discoverability.
- Packaging, versioning, and compatibility notes for skills.
- Benchmarking and curation of active/high-value skills.

## 6. Explicit Non-Goals

- Owning control-plane orchestration logic.
- Storing arbitrary repo assets with no catalog semantics.
- Maximizing raw skill count without quality and metadata discipline.

## 7. Maximum Tool and Connection Surface

- This repo should assume it may use any connection, API, browser flow, CLI, document surface, dataset, or storage system materially relevant to completing the job, as long as the access pattern is lawful, auditable, and proportionate to risk.
- Do not artificially limit execution to the tools already named in the repo if adjacent systems are clearly required to close the loop.
- Prefer first-party APIs and direct integrations when available, but use browser automation, provider CLIs, structured import/export, and human-review queues when they are the most reliable path to completion.
- Treat communication systems, docs, spreadsheets, issue trackers, code hosts, cloud consoles, dashboards, databases, and admin panels as valid operating surfaces whenever the repo's job depends on them.
- Escalate only when the action is irreversible, privacy-sensitive, financially material, or likely to create external side effects without adequate review.

### Priority surfaces for skills and catalog work
- GitHub repos, local skill bundles, docs, READMEs, package registries, web search, and browser extraction workflows needed to discover, compare, classify, and improve skills.
- Google Drive, Docs, Sheets, Notion, internal wikis, CSV exports, and structured metadata stores when skills are documented, scored, or curated outside code repositories.
- Embeddings, vector indexes, lexical search, evaluation datasets, telemetry, and usage logs when better retrieval, deduplication, or quality measurement requires them.
- Any tool or connection that helps turn skills into portable, reviewable, searchable, and measurable assets across the rest of UOS.

### Selection rules
- Start by identifying the systems that would let the repo complete the real job end to end, not just produce an intermediate artifact.
- Use the narrowest safe action for high-risk domains, but not the narrowest tool surface by default.
- When one system lacks the evidence or authority needed to finish the task, step sideways into the adjacent system that does have it.
- Prefer a complete, reviewable workflow over a locally elegant but operationally incomplete one.

## 8. Autonomous Operating Model

This PRD assumes **maximum-capability autonomous work**. The repo should not merely accept tasks; it should research deeply, compare options, reduce uncertainty, ship safely, and learn from every outcome. Autonomy here means higher standards for evidence, reversibility, observability, and knowledge capture—not just faster execution.

### Required research before every material task
1. Read the repo README, this PRD, touched source modules, existing tests, and recent change history before proposing a solution.
1. Trace impact across adjacent UOS repos and shared contracts before changing interfaces, schemas, or runtime behavior.
1. Prefer evidence over assumption: inspect current code paths, add repro cases, and study real failure modes before implementing a fix.
1. Use external official documentation and standards for any upstream dependency, provider API, framework, CLI, or format touched by the task.
1. For non-trivial work, compare at least two approaches and explicitly choose based on reversibility, operational safety, and long-term maintainability.

### Repo-specific decision rules
- Metadata quality and retrieval usefulness beat sheer catalog size.
- A skill is not truly extracted until ownership, evaluation, and compatibility are explicit.
- Overlapping skills should converge where possible rather than multiply.
- Catalog entries should be usable by agents, not only humans reading file names.

### Mandatory escalation triggers
- Skills with unclear safety, trust, or execution boundaries.
- Catalog schema changes that would break selection or automation pipelines.
- Extraction plans that leave core partially dependent on stale skill snapshots.

## 9. Continuous Learning Requirements

### Required learning loop after every task
- Every completed task must leave behind at least one durable improvement: a test, benchmark, runbook, migration note, ADR, or automation asset.
- Capture the problem, evidence, decision, outcome, and follow-up questions in repo-local learning memory so the next task starts smarter.
- Promote repeated fixes into reusable abstractions, templates, linters, validators, or code generation rather than solving the same class of issue twice.
- Track confidence and unknowns; unresolved ambiguity becomes a research backlog item, not a silent assumption.
- Prefer instrumented feedback loops: telemetry, evaluation harnesses, fixtures, or replayable traces should be added whenever feasible.

### Repo-specific research agenda
- What metadata fields best predict successful skill selection?
- Which skills are duplicated, stale, unsafe, or insufficiently benchmarked?
- How should skill lineage and compatibility be represented?
- What evaluation harnesses are needed to move from cataloging to quality assurance?
- Which extraction steps still block full removal of skills from core?

### Repo-specific memory objects that must stay current
- Skill metadata schema history.
- Skill quality scorecards.
- Extraction backlog and dependency map.
- Deprecation/merge ledger.
- Selection outcome feedback archive.

## 10. Core Workflows the Repo Must Master

1. Extracting a skill from core or a tools bundle into the catalog.
1. Normalizing metadata and publishing searchable indexes.
1. Evaluating skill quality, coverage, and safety.
1. Deprecating, replacing, or merging overlapping skills.
1. Tracking skill usage and task outcome feedback.

## 11. Interfaces and Dependencies

- Paperclip plugin scaffold for worker, manifest, UI, and validation surfaces.

- `@uos/core` as the current source of some vendored skill content.
- Tool bundles whose contents may need cataloging.
- Agent selection systems and discovery UIs.
- Any package consuming catalog metadata or packaged skills.

## 12. Implementation Backlog

### Now
- Normalize the metadata model and clean up the first wave of extracted or vendored skills.
- Establish a benchmark query set and evaluation rubric for search and recommendation quality.
- Document the extraction path from core and tool repos into the catalog.

### Next
- Add usage and outcome feedback loops so the catalog learns from real task performance.
- Reduce overlap by merging or deprecating redundant skills and clarifying ownership.
- Improve retrieval with better indexing, embeddings, and metadata-driven ranking.

### Later
- Support package-grade publishing and versioning flows for the strongest catalog entries.
- Expose skill quality and coverage reporting directly into UOS planning and operations surfaces.

## 13. Risks and Mitigations

- Catalog bloat without quality signal.
- Core remaining entangled with stale skill snapshots.
- Inconsistent metadata preventing reliable selection.
- Extraction work stalling because ownership is not explicit.

## 14. Definition of Done

A task in this repo is only complete when all of the following are true:

- The code, configuration, or skill behavior has been updated with clear intent.
- Tests, evals, replay cases, or validation artifacts were added or updated to protect the changed behavior.
- Documentation, runbooks, or decision records were updated when the behavior, contract, or operating model changed.
- The task produced a durable learning artifact rather than only a code diff.
- Cross-repo consequences were checked wherever this repo touches shared contracts, orchestration, or downstream users.

### Repo-specific completion requirements
- New or changed skills have metadata, lineage, and evaluation implications documented.
- Extraction work reduces—not redistributes—core coupling.
- Catalog changes are validated against selection and retrieval quality.

## 15. Recommended Repo-Local Knowledge Layout

- `/docs/research/` for research briefs, benchmark notes, and upstream findings.
- `/docs/adrs/` for decision records and contract changes.
- `/docs/lessons/` for task-by-task learning artifacts and postmortems.
- `/evals/` for executable quality checks, golden cases, and regression suites.
- `/playbooks/` for operator runbooks, migration guides, and incident procedures.
