import type { DiscoveredSkill } from './types';
export interface DiscoverySource {
    type: 'github' | 'marketplace' | 'codebase' | 'workflow';
    url?: string;
}
export interface DiscoveryOptions {
    sources?: DiscoverySource[];
    maxResults?: number;
    minConfidence?: number;
}
export interface DiscoveryResult {
    discovered: DiscoveredSkill[];
    errors: Array<{
        source: string;
        error: string;
    }>;
}
export declare class DiscoveryEngine {
    private sources;
    private maxResults;
    private minConfidence;
    configure(options: DiscoveryOptions): void;
    discover(options?: DiscoveryOptions): Promise<DiscoveryResult>;
    private discoverFromSource;
    private discoverFromGitHub;
    private discoverFromMarketplace;
    private discoverFromCodebase;
    private discoverFromWorkflow;
    analyzeSkillGaps(currentSkills: string[], requiredCapabilities: string[]): string[];
    private suggestSkillForCapability;
    suggestSkillChains(baseSkillId: string, availableSkills: string[]): string[][];
    rankByCompatibility(skills: DiscoveredSkill[], installedSkills: string[]): DiscoveredSkill[];
}
//# sourceMappingURL=discovery.d.ts.map