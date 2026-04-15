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
// Discovery types
export const DiscoveredSkillSchema = z.object({
    name: z.string(),
    description: z.string(),
    source: z.enum(['github', 'marketplace', 'codebase', 'workflow']),
    sourceUrl: z.string().optional(),
    confidence: z.number().min(0).max(1).default(0.5),
    suggestedDependencies: z.array(z.string()).default([]),
});
//# sourceMappingURL=types.js.map