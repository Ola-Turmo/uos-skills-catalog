import type { Skill, SkillMetrics, SkillHealth } from './types';
export interface HealthScorerConfig {
    decayThresholdDays?: number;
    lowUsageThreshold?: number;
    lowSuccessRateThreshold?: number;
    highLatencyThresholdMs?: number;
}
export declare class HealthScorer {
    private config;
    constructor(config?: HealthScorerConfig);
    calculateHealthScore(skill: Skill): number;
    isDecaying(skill: Skill): boolean;
    isDeprecated(skill: Skill): boolean;
    evaluateSkill(skill: Skill): SkillHealth;
    recordUsage(skill: Skill, success: boolean, latencyMs: number): SkillMetrics;
    suggestDeprecation(skill: Skill, reason: string): SkillHealth;
}
//# sourceMappingURL=health-scorer.d.ts.map