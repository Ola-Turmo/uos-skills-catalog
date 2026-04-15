import { z } from 'zod';
export declare const SkillDependencySchema: z.ZodObject<{
    skillId: z.ZodString;
    version: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodEnum<["required", "optional", "conflicts"]>>;
}, "strip", z.ZodTypeAny, {
    skillId: string;
    type: "required" | "optional" | "conflicts";
    version?: string | undefined;
}, {
    skillId: string;
    version?: string | undefined;
    type?: "required" | "optional" | "conflicts" | undefined;
}>;
export declare const SkillVersionSchema: z.ZodObject<{
    version: z.ZodString;
    createdAt: z.ZodString;
    changelog: z.ZodOptional<z.ZodString>;
    diff: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    version: string;
    createdAt: string;
    changelog?: string | undefined;
    diff?: string | undefined;
    author?: string | undefined;
}, {
    version: string;
    createdAt: string;
    changelog?: string | undefined;
    diff?: string | undefined;
    author?: string | undefined;
}>;
export declare const SkillMetricsSchema: z.ZodObject<{
    usageCount: z.ZodDefault<z.ZodNumber>;
    successRate: z.ZodDefault<z.ZodNumber>;
    avgLatencyMs: z.ZodDefault<z.ZodNumber>;
    lastUsed: z.ZodOptional<z.ZodString>;
    errorCount: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    usageCount: number;
    successRate: number;
    avgLatencyMs: number;
    errorCount: number;
    lastUsed?: string | undefined;
}, {
    usageCount?: number | undefined;
    successRate?: number | undefined;
    avgLatencyMs?: number | undefined;
    lastUsed?: string | undefined;
    errorCount?: number | undefined;
}>;
export declare const SkillHealthSchema: z.ZodObject<{
    score: z.ZodDefault<z.ZodNumber>;
    isDeprecated: z.ZodDefault<z.ZodBoolean>;
    deprecationReason: z.ZodOptional<z.ZodString>;
    isDecaying: z.ZodDefault<z.ZodBoolean>;
    lastHealthCheck: z.ZodString;
}, "strip", z.ZodTypeAny, {
    score: number;
    isDeprecated: boolean;
    isDecaying: boolean;
    lastHealthCheck: string;
    deprecationReason?: string | undefined;
}, {
    lastHealthCheck: string;
    score?: number | undefined;
    isDeprecated?: boolean | undefined;
    deprecationReason?: string | undefined;
    isDecaying?: boolean | undefined;
}>;
export declare const SkillSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    version: z.ZodDefault<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    category: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodDefault<z.ZodArray<z.ZodObject<{
        skillId: z.ZodString;
        version: z.ZodOptional<z.ZodString>;
        type: z.ZodDefault<z.ZodEnum<["required", "optional", "conflicts"]>>;
    }, "strip", z.ZodTypeAny, {
        skillId: string;
        type: "required" | "optional" | "conflicts";
        version?: string | undefined;
    }, {
        skillId: string;
        version?: string | undefined;
        type?: "required" | "optional" | "conflicts" | undefined;
    }>, "many">>;
    versions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        version: z.ZodString;
        createdAt: z.ZodString;
        changelog: z.ZodOptional<z.ZodString>;
        diff: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        version: string;
        createdAt: string;
        changelog?: string | undefined;
        diff?: string | undefined;
        author?: string | undefined;
    }, {
        version: string;
        createdAt: string;
        changelog?: string | undefined;
        diff?: string | undefined;
        author?: string | undefined;
    }>, "many">>;
    metrics: z.ZodDefault<z.ZodObject<{
        usageCount: z.ZodDefault<z.ZodNumber>;
        successRate: z.ZodDefault<z.ZodNumber>;
        avgLatencyMs: z.ZodDefault<z.ZodNumber>;
        lastUsed: z.ZodOptional<z.ZodString>;
        errorCount: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        usageCount: number;
        successRate: number;
        avgLatencyMs: number;
        errorCount: number;
        lastUsed?: string | undefined;
    }, {
        usageCount?: number | undefined;
        successRate?: number | undefined;
        avgLatencyMs?: number | undefined;
        lastUsed?: string | undefined;
        errorCount?: number | undefined;
    }>>;
    health: z.ZodObject<{
        score: z.ZodDefault<z.ZodNumber>;
        isDeprecated: z.ZodDefault<z.ZodBoolean>;
        deprecationReason: z.ZodOptional<z.ZodString>;
        isDecaying: z.ZodDefault<z.ZodBoolean>;
        lastHealthCheck: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        score: number;
        isDeprecated: boolean;
        isDecaying: boolean;
        lastHealthCheck: string;
        deprecationReason?: string | undefined;
    }, {
        lastHealthCheck: string;
        score?: number | undefined;
        isDeprecated?: boolean | undefined;
        deprecationReason?: string | undefined;
        isDecaying?: boolean | undefined;
    }>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    version: string;
    createdAt: string;
    id: string;
    name: string;
    description: string;
    tags: string[];
    dependencies: {
        skillId: string;
        type: "required" | "optional" | "conflicts";
        version?: string | undefined;
    }[];
    versions: {
        version: string;
        createdAt: string;
        changelog?: string | undefined;
        diff?: string | undefined;
        author?: string | undefined;
    }[];
    metrics: {
        usageCount: number;
        successRate: number;
        avgLatencyMs: number;
        errorCount: number;
        lastUsed?: string | undefined;
    };
    health: {
        score: number;
        isDeprecated: boolean;
        isDecaying: boolean;
        lastHealthCheck: string;
        deprecationReason?: string | undefined;
    };
    updatedAt: string;
    metadata: Record<string, unknown>;
    author?: string | undefined;
    category?: string | undefined;
}, {
    createdAt: string;
    id: string;
    name: string;
    description: string;
    health: {
        lastHealthCheck: string;
        score?: number | undefined;
        isDeprecated?: boolean | undefined;
        deprecationReason?: string | undefined;
        isDecaying?: boolean | undefined;
    };
    updatedAt: string;
    version?: string | undefined;
    author?: string | undefined;
    tags?: string[] | undefined;
    category?: string | undefined;
    dependencies?: {
        skillId: string;
        version?: string | undefined;
        type?: "required" | "optional" | "conflicts" | undefined;
    }[] | undefined;
    versions?: {
        version: string;
        createdAt: string;
        changelog?: string | undefined;
        diff?: string | undefined;
        author?: string | undefined;
    }[] | undefined;
    metrics?: {
        usageCount?: number | undefined;
        successRate?: number | undefined;
        avgLatencyMs?: number | undefined;
        lastUsed?: string | undefined;
        errorCount?: number | undefined;
    } | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export type SkillDependency = z.infer<typeof SkillDependencySchema>;
export type SkillVersion = z.infer<typeof SkillVersionSchema>;
export type SkillMetrics = z.infer<typeof SkillMetricsSchema>;
export type SkillHealth = z.infer<typeof SkillHealthSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export declare const SkillRatingSchema: z.ZodObject<{
    id: z.ZodString;
    skillId: z.ZodString;
    userId: z.ZodString;
    rating: z.ZodNumber;
    review: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    skillId: string;
    createdAt: string;
    id: string;
    userId: string;
    rating: number;
    review?: string | undefined;
}, {
    skillId: string;
    createdAt: string;
    id: string;
    userId: string;
    rating: number;
    review?: string | undefined;
}>;
export declare const SkillBundleSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    skillIds: z.ZodArray<z.ZodString, "many">;
    category: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    id: string;
    name: string;
    description: string;
    tags: string[];
    updatedAt: string;
    skillIds: string[];
    category?: string | undefined;
}, {
    createdAt: string;
    id: string;
    name: string;
    description: string;
    updatedAt: string;
    skillIds: string[];
    tags?: string[] | undefined;
    category?: string | undefined;
}>;
export type SkillRating = z.infer<typeof SkillRatingSchema>;
export type SkillBundle = z.infer<typeof SkillBundleSchema>;
export declare const DiscoveredSkillSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    source: z.ZodEnum<["github", "marketplace", "codebase", "workflow"]>;
    sourceUrl: z.ZodOptional<z.ZodString>;
    confidence: z.ZodDefault<z.ZodNumber>;
    suggestedDependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    source: "github" | "marketplace" | "codebase" | "workflow";
    confidence: number;
    suggestedDependencies: string[];
    sourceUrl?: string | undefined;
}, {
    name: string;
    description: string;
    source: "github" | "marketplace" | "codebase" | "workflow";
    sourceUrl?: string | undefined;
    confidence?: number | undefined;
    suggestedDependencies?: string[] | undefined;
}>;
export type DiscoveredSkill = z.infer<typeof DiscoveredSkillSchema>;
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
export interface CatalogEvent {
    type: 'skill_added' | 'skill_updated' | 'skill_removed' | 'skill_deprecated' | 'health_check';
    skillId: string;
    timestamp: string;
    data?: Record<string, unknown>;
}
export type EventHandler = (event: CatalogEvent) => void;
//# sourceMappingURL=types.d.ts.map