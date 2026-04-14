// uos-skills-catalog - Living Skill Ecosystem
// A vibrant marketplace where skills are continuously discovered, evaluated, improved, and deployed

export { SkillCatalog } from './catalog/skill-catalog';
export { HealthScorer } from './catalog/health-scorer';
export { VersionManager } from './catalog/version-manager';
export { DependencyGraph } from './catalog/dependency-graph';
export { DiscoveryEngine } from './catalog/discovery';
export { Marketplace } from './catalog/marketplace';

export type { Skill, SkillDependency, SkillVersion, SkillMetrics, SkillHealth } from './catalog/types';
export type { SearchOptions, SearchResult, CatalogEvent, EventHandler } from './catalog/types';
export type { SkillRating, SkillBundle, DiscoveredSkill } from './catalog/types';

export { createPlugin } from './plugin';
