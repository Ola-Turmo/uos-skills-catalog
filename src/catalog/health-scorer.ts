import type { Skill, SkillMetrics, SkillHealth } from './types';

export interface HealthScorerConfig {
  decayThresholdDays?: number;
  lowUsageThreshold?: number;
  lowSuccessRateThreshold?: number;
  highLatencyThresholdMs?: number;
}

const DEFAULT_CONFIG: Required<HealthScorerConfig> = {
  decayThresholdDays: 30,
  lowUsageThreshold: 5,
  lowSuccessRateThreshold: 0.7,
  highLatencyThresholdMs: 5000,
};

export class HealthScorer {
  private config: Required<HealthScorerConfig>;

  constructor(config: HealthScorerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  calculateHealthScore(skill: Skill): number {
    const metrics = skill.metrics;
    let score = 100;

    // Penalize low usage
    if (metrics.usageCount < this.config.lowUsageThreshold) {
      score -= 20;
    } else if (metrics.usageCount < this.config.lowUsageThreshold * 2) {
      score -= 10;
    }

    // Penalize low success rate
    const successPenalty = (1 - metrics.successRate) * 40;
    score -= successPenalty;

    // Penalize high latency
    if (metrics.avgLatencyMs > this.config.highLatencyThresholdMs) {
      score -= 25;
    } else if (metrics.avgLatencyMs > this.config.highLatencyThresholdMs / 2) {
      score -= 10;
    }

    // Penalize errors
    const errorPenalty = Math.min(metrics.errorCount * 2, 20);
    score -= errorPenalty;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  isDecaying(skill: Skill): boolean {
    if (!skill.metrics.lastUsed) {
      return skill.metrics.usageCount > 0;
    }

    const lastUsed = new Date(skill.metrics.lastUsed);
    const now = new Date();
    const daysSinceUse = Math.floor(
      (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceUse > this.config.decayThresholdDays && skill.metrics.usageCount > 0;
  }

  isDeprecated(skill: Skill): boolean {
    return skill.health.isDeprecated;
  }

  evaluateSkill(skill: Skill): SkillHealth {
    return {
      score: this.calculateHealthScore(skill),
      isDeprecated: this.isDeprecated(skill),
      deprecationReason: skill.health.deprecationReason,
      isDecaying: this.isDecaying(skill),
      lastHealthCheck: new Date().toISOString(),
    };
  }

  recordUsage(skill: Skill, success: boolean, latencyMs: number): SkillMetrics {
    const metrics = { ...skill.metrics };
    const now = new Date().toISOString();

    metrics.usageCount += 1;
    metrics.lastUsed = now;

    // Update success rate using weighted average
    const totalSuccesses = metrics.successRate * (metrics.usageCount - 1) + (success ? 1 : 0);
    metrics.successRate = totalSuccesses / metrics.usageCount;

    // Update average latency using weighted average
    const totalLatency = metrics.avgLatencyMs * (metrics.usageCount - 1) + latencyMs;
    metrics.avgLatencyMs = Math.round(totalLatency / metrics.usageCount);

    // Update error count
    if (!success) {
      metrics.errorCount += 1;
    }

    return metrics;
  }

  suggestDeprecation(skill: Skill, reason: string): SkillHealth {
    return {
      ...this.evaluateSkill(skill),
      isDeprecated: true,
      deprecationReason: reason,
    };
  }
}
