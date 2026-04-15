# PLAN: uos-skills-catalog — Living Skill Ecosystem

## 1. Project Overview

- **Project Name**: uos-skills-catalog
- **Type**: Paperplane Plugin / Skill Management System
- **Core Functionality**: A living skill ecosystem that provides skill storage, search, health scoring, versioning, lineage tracking, auto-discovery, dependency management, and marketplace capabilities.
- **Target Users**: AI agents and developers using the Paperclip ecosystem

## 2. Requirements Checklist

### Core Features (from PRD)
- [x] Skill storage with add/get/search/remove operations
- [x] Skill health scoring (usage count, success rate, latency)
- [x] Skill decay detection and deprecated skill alerts
- [x] Skill versioning with diff viewer and rollback
- [x] Skill dependency graph with conflict detection
- [x] Auto-skill discovery from codebase patterns / GitHub
- [x] Skill marketplace with ratings/reviews
- [x] Skill bundle builder by role/use case
- [x] Dashboard UI for skill ecosystem visualization

### Technical Stack
- [x] TypeScript + Zod for type safety and validation
- [x] @paperclipai/plugin-sdk integration
- [x] Embeddings for semantic skill matching
- [x] GitHub API integration for auto-discovery

## 3. Implementation Phases

### Phase 1: Core Infrastructure
- Project setup (package.json, tsconfig, vite config)
- TypeScript types and Zod schemas
- SkillCatalog base class with add/get/search/remove
- Health scorer implementation
- Version manager implementation

### Phase 2: Discovery + Dependencies
- Auto-discovery engine
- Dependency graph
- Suggestion engine

### Phase 3: Marketplace + Dashboard
- Marketplace types and storage
- Rating/review system
- Bundle builder
- Dashboard UI components

## 4. File Structure

```
src/
├── catalog/
│   ├── types.ts           # TypeScript interfaces and Zod schemas
│   ├── skill-catalog.ts   # Main SkillCatalog class
│   ├── health-scorer.ts   # Health scoring logic
│   ├── version-manager.ts  # Version history and diff
│   ├── discovery.ts        # Auto-discovery engine
│   ├── dependency-graph.ts # Skill dependencies
│   ├── marketplace.ts      # Marketplace types
│   └── index.ts            # Exports
├── index.ts                # Plugin entry point
├── plugin.ts               # Paperclip plugin integration
tests/
├── catalog.test.ts        # Core catalog tests
└── health-scorer.test.ts   # Health scorer tests
```

## 5. Success Criteria

- Skill discovery: 10+ skills auto-discovered per week
- Skill effectiveness tracking: 100% of installed skills
- Skill recommendation accuracy: > 80%
- All core CRUD operations work correctly
- Health scoring provides meaningful metrics
- Version diff/rollback functionality works
