# @uos/skills-catalog

@uos/skills-catalog is the home for extracted skills, generated catalogs, metadata, and skill quality intelligence. It should make skills discoverable, evaluable, and portable while removing catalog debt from core.

Built as part of the UOS split workspace on top of [Paperclip](https://github.com/paperclipai/paperclip), which remains the upstream control-plane substrate.

## What This Repo Owns

- Skill metadata schemas, generated catalogs, and indexing.
- Extraction flow from core and related tool bundles.
- Skill quality evaluation, tagging, lineage, and discoverability.
- Packaging, versioning, and compatibility notes for skills.
- Benchmarking and curation of active/high-value skills.

## Runtime Form

- Split repo with package code as the source of truth and a Paperclip plugin scaffold available for worker, manifest, UI, and validation surfaces when the repo needs runtime or operator-facing behavior.

## Highest-Value Workflows

- Extracting a skill from core or a tools bundle into the catalog.
- Normalizing metadata and publishing searchable indexes.
- Evaluating skill quality, coverage, and safety.
- Deprecating, replacing, or merging overlapping skills.
- Tracking skill usage and task outcome feedback.

## Key Connections and Operating Surfaces

- GitHub repos, local skill bundles, docs, READMEs, package registries, web search, and browser extraction workflows needed to discover, compare, classify, and improve skills.
- Google Drive, Docs, Sheets, Notion, internal wikis, CSV exports, and structured metadata stores when skills are documented, scored, or curated outside code repositories.
- Embeddings, vector indexes, lexical search, evaluation datasets, telemetry, and usage logs when better retrieval, deduplication, or quality measurement requires them.
- Any tool or connection that helps turn skills into portable, reviewable, searchable, and measurable assets across the rest of UOS.

## KPI Targets

- 100% of active catalog entries have normalized metadata, ownership, and lifecycle status fields.
- Duplicate or materially overlapping skills fall below 10% of the active catalog.
- The top 20 highest-traffic skills have evaluation scorecards covering quality, safety, and task fit.
- Search precision at 5 reaches >= 0.80 on the maintained benchmark query set.

## Implementation Backlog

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

## Local Plugin Use

```bash
curl -X POST http://127.0.0.1:3100/api/plugins/install \
  -H "Content-Type: application/json" \
  -d '{"packageName":"<absolute-path-to-this-repo>","isLocalPath":true}'
```

## Validation

```bash
npm install
npm test
npm run plugin:typecheck
npm run plugin:test
```
