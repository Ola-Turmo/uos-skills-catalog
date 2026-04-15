import { z } from 'zod';

// Skill schema definitions
export const SkillDependencySchema = z.object({
  skillId: z.string(),
  version: z.string().optional(),
  type: z.enum(['required', 'optional', 'conflicts']).default('required'),
});

export const SkillVersionSchema = z.object({
  version: z.string(),
  createdAt: z.string(),
  changelog: z.string().optional(),
  diff: z.string().optional(),
  author: z.string().optional(),
});

export const SkillMetricsSchema = z.object({
  usageCount: z.number().default(0),
  successRate: z.number().min(0).max(1).default(1),
  avgLatencyMs: z.number().default(0),
  lastUsed: z.string().optional(),
  errorCount: z.number().default(0),
});

export const SkillHealthSchema = z.object({
  score: z.number().min(0).max(100).default(50),
  isDeprecated: z.boolean().default(false),
  deprecationReason: z.string().optional(),
  isDecaying: z.boolean().default(false),
  lastHealthCheck: z.string(),
});

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string().default('1.0.0'),
  author: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  dependencies: z.array(SkillDependencySchema).default([]),
  versions: z.array(SkillVersionSchema).default([]),
  metrics: SkillMetricsSchema.default({}),
  health: SkillHealthSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.record(z.unknown()).default({}),
});

export type SkillDependency = z.infer<typeof SkillDependencySchema>;
export type SkillVersion = z.infer<typeof SkillVersionSchema>;
export type SkillMetrics = z.infer<typeof SkillMetricsSchema>;
export type SkillHealth = z.infer<typeof SkillHealthSchema>;
export type Skill = z.infer<typeof SkillSchema>;

// Marketplace types
export const SkillRatingSchema = z.object({
  id: z.string(),
  skillId: z.string(),
  userId: z.string(),
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
  createdAt: z.string(),
});

export const SkillBundleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  skillIds: z.array(z.string()),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SkillRating = z.infer<typeof SkillRatingSchema>;
export type SkillBundle = z.infer<typeof SkillBundleSchema>;

// Discovery types
export const DiscoveredSkillSchema = z.object({
  name: z.string(),
  description: z.string(),
  source: z.enum(['github', 'marketplace', 'codebase', 'workflow']),
  sourceUrl: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0.5),
  suggestedDependencies: z.array(z.string()).default([]),
});

export type DiscoveredSkill = z.infer<typeof DiscoveredSkillSchema>;

// Search types
export interface SearchOptions {
  query?: string;
  tags?: string[];
  category?: string;
  includeDeprecated?: boolean;
  minHealthScore?: number;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  skill: Skill;
  relevanceScore: number;
  matchedFields: string[];
}

// Catalog events
export interface CatalogEvent {
  type: 'skill_added' | 'skill_updated' | 'skill_removed' | 'skill_deprecated' | 'health_check';
  skillId: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export type EventHandler = (event: CatalogEvent) => void;
