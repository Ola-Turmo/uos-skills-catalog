# PRD: uos-skills-catalog — Living Skill Ecosystem

## Context
Skills catalog plugin — basic skill storage with search, lineage tracking, extraction. Only ping/health actions. Minimal UI. SkillCatalog class with add/get/search/remove.

## Vision (April 2026 — World-Class)
The skills catalog should be a **living skill ecosystem** — a vibrant marketplace where skills are continuously discovered, evaluated, improved, and deployed, making every agent smarter than the last.

## What's Missing / Innovation Opportunities

### 1. Skill Health Scoring
Currently: No quality metrics.
**Add**: Skill effectiveness scoring (usage count, success rate, latency). Skill decay detection. Deprecated skill alerts.

### 2. Skill Dependency Graph
Currently: Independent skills.
**Add**: Skill-to-skill dependencies. Conflict detection. Version compatibility matrix. Chain recommendations.

### 3. Auto-Skill Discovery
Currently: Manual skill addition.
**Add**: Auto-discover skills from codebase patterns, GitHub, skill marketplaces. Skill suggestion engine based on workflow gaps.

### 4. Skill Versioning & Diff
Currently: Latest-only storage.
**Add**: Full version history with diffs. Rollback capability. Migration guides between versions. Breaking change detection.

### 5. Skill Marketplace
Currently: Basic catalog.
**Add**: Public/private skill marketplace. Skill ratings and reviews. One-click install. Skill bundles by role/use case.

### 6. Skills Dashboard (UI)
Currently: Basic health widget.
**Add**: Skill ecosystem dashboard. Usage leaderboards. Health heatmap. Discovery engine UI. Skill chain builder.

## Implementation Phases

### Phase 1: Health + Versioning
- Skill health scorer (`src/catalog/health-scorer.ts`)
- Version manager (`src/catalog/version-manager.ts`)
- Skill diff viewer

### Phase 2: Discovery + Dependencies
- Auto-discovery engine (`src/catalog/discovery.ts`)
- Dependency graph
- Suggestion engine

### Phase 3: Marketplace + Dashboard
- Marketplace UI
- Rating/review system
- Bundle builder

## Technical Approach
- TypeScript + Zod
- `@paperclipai/plugin-sdk`
- Embeddings for semantic skill matching
- GitHub API for auto-discovery

## Success Metrics
- Skill discovery: 10+ skills auto-discovered per week
- Skill effectiveness tracking: 100% of installed skills
- Skill recommendation accuracy: > 80%
