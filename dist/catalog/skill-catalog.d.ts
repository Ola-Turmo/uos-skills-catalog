import { type Skill, type SearchOptions, type SearchResult, type EventHandler } from './types';
import { type HealthScorerConfig } from './health-scorer';
export interface SkillCatalogConfig {
    healthScorer?: HealthScorerConfig;
    enableAutoHealthCheck?: boolean;
    autoHealthCheckIntervalMs?: number;
}
export declare class SkillCatalog {
    private skills;
    private eventHandlers;
    private healthScorer;
    private versionManager;
    private config;
    constructor(config?: SkillCatalogConfig);
    private emit;
    onEvent(handler: EventHandler): () => void;
    generateId(): string;
    add(data: {
        id?: string;
    } & Omit<Skill, 'id' | 'createdAt' | 'updatedAt' | 'versions' | 'health'>): Skill;
    get(id: string): Skill | undefined;
    getByName(name: string): Skill | undefined;
    update(id: string, data: Partial<Skill>): Skill | null;
    remove(id: string): boolean;
    search(options: SearchOptions): SearchResult[];
    getAll(): Skill[];
    getByCategory(category: string): Skill[];
    getByTag(tag: string): Skill[];
    getDeprecated(): Skill[];
    getDecaying(): Skill[];
    recordUsage(id: string, success: boolean, latencyMs: number): Skill | null;
    deprecate(id: string, reason: string): Skill | null;
    checkHealth(id: string): Skill | null;
    checkAllHealth(): void;
    getStats(): {
        total: number;
        byCategory: Record<string, number>;
        byHealth: {
            healthy: number;
            decaying: number;
            deprecated: number;
        };
        avgHealthScore: number;
    };
    toJSON(): string;
    static fromJSON(json: string): SkillCatalog;
    clear(): void;
}
//# sourceMappingURL=skill-catalog.d.ts.map