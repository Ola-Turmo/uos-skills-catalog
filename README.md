# @uos/skills-catalog

Skills catalog package for vendored skill content and generated catalogs.

Part of the Universal Operating System stack built on top of [Paperclip](https://github.com/paperclipai/paperclip), the open-source control plane for agentic teams.

## Why This Repo Exists

This package is the dedicated home for vendored skills, generated catalogs, and enablement content. The goal is to make that capability independently versionable, easier to explain, and easier to harden as the UOS stack continues to split out of the original monorepo.

## What You Get

- A focused package boundary around vendored skills, generated catalogs, and enablement content
- A clean place to evolve APIs, tests, and release process without dragging the whole stack with it
- A repo that stays explicitly connected to the upstream Paperclip platform instead of pretending to replace it

## Relationship To Paperclip

Paperclip remains the platform substrate: company primitives, agents, projects, workspaces, skills, routines, budgets, approvals, and runtime enforcement live there. This repo exists to extend that platform, not fork it. See the upstream project at [paperclipai/paperclip](https://github.com/paperclipai/paperclip).

## Current Status

- This repo is CI-backed and intentionally narrow.
- It is still earlier in the extraction sequence than `@uos/core`, so expect the implementation surface to grow over time.
- Transitional cross-workspace verification still lives in the main UOS monorepo via `npm run split:verify`.

## Validation

```bash
npm install
npm test
```

