import { describe, it, expect } from 'vitest';
import { HealthScorer } from '../src/catalog/health-scorer';
import type { Skill } from '../src/catalog/types';

describe('HealthScorer', () => {
  const createTestSkill = (overrides = {}): Skill => ({
    id: 'test-skill',
    name: 'Test Skill',
    description: 'A test skill',
    version: '1.0.0',
    tags: ['test'],
    dependencies: [],
    versions: [],
    metrics: {
      usageCount: 0,
      successRate: 1,
      avgLatencyMs: 0,
      errorCount: 0,
    },
    health: {
      score: 50,
      isDeprecated: false,
      isDecaying: false,
      lastHealthCheck: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  describe('calculateHealthScore', () => {
    it('should return 100 for perfect metrics', () => {
      const scorer = new HealthScorer();
      const skill = createTestSkill({
        metrics: {
          usageCount: 100,
          successRate: 1,
          avgLatencyMs: 50,
          errorCount: 0,
        },
      });

      expect(scorer.calculateHealthScore(skill)).toBe(100);
    });

    it('should penalize low usage', () => {
      const scorer = new HealthScorer();
      const skill = createTestSkill({
        metrics: {
          usageCount: 2,
          successRate: 1,
          avgLatencyMs: 0,
          errorCount: 0,
        },
      });

      const score = scorer.calculateHealthScore(skill);
      expect(score).toBeLessThan(100);
    });

    it('should penalize low success rate', () => {
      const scorer = new HealthScorer();
      const skill = createTestSkill({
        metrics: {
          usageCount: 50,
          successRate: 0.5,
          avgLatencyMs: 0,
          errorCount: 0,
        },
      });

      const score = scorer.calculateHealthScore(skill);
      expect(score).toBeLessThan(100);
    });

    it('should penalize high latency', () => {
      const scorer = new HealthScorer();
      const skill = createTestSkill({
        metrics: {
          usageCount: 50,
          successRate: 1,
          avgLatencyMs: 10000,
          errorCount: 0,
        },
      });

      const score = scorer.calculateHealthScore(skill);
      expect(score).toBeLessThan(100);
    });

    it('should penalize errors', () => {
      const scorer = new HealthScorer();
      const skill = createTestSkill({
        metrics: {
          usageCount: 50,
          successRate: 1,
          avgLatencyMs: 0,
          errorCount: 10,
        },
      });

      const score = scorer.calculateHealthScore(skill);
      expect(score).toBeLessThan(100);
    });
  });

  describe('isDecaying', () => {
    it('should return false for recently used skill', () => {
      const scorer = new HealthScorer();
      const skill = createTestSkill({
        metrics: {
          usageCount: 10,
          successRate: 1,
          avgLatencyMs: 0,
          lastUsed: new Date().toISOString(),
        },
      });

      expect(scorer.isDecaying(skill)).toBe(false);
    });

    it('should return true for unused skill after threshold', () => {
      const scorer = new HealthScorer();
      const thirtyOneDaysAgo = new Date();
      thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

      const skill = createTestSkill({
        metrics: {
          usageCount: 10,
          successRate: 1,
          avgLatencyMs: 0,
          lastUsed: thirtyOneDaysAgo.toISOString(),
        },
      });

      expect(scorer.isDecaying(skill)).toBe(true);
    });
  });

  describe('recordUsage', () => {
    it('should update metrics on successful usage', () => {
      const scorer = new HealthScorer();
      const skill = createTestSkill({
        metrics: {
          usageCount: 5,
          successRate: 1,
          avgLatencyMs: 100,
          errorCount: 0,
        },
      });

      const updated = scorer.recordUsage(skill, true, 150);

      expect(updated.usageCount).toBe(6);
      expect(updated.successRate).toBe(1);
      expect(updated.avgLatencyMs).toBeCloseTo(108, 0);
      expect(updated.lastUsed).toBeDefined();
    });

    it('should update metrics on failed usage', () => {
      const scorer = new HealthScorer();
      const skill = createTestSkill({
        metrics: {
          usageCount: 5,
          successRate: 1,
          avgLatencyMs: 100,
          errorCount: 0,
        },
      });

      const updated = scorer.recordUsage(skill, false, 200);

      expect(updated.usageCount).toBe(6);
      expect(updated.successRate).toBeLessThan(1);
      expect(updated.errorCount).toBe(1);
    });
  });

  describe('evaluateSkill', () => {
    it('should return complete health evaluation', () => {
      const scorer = new HealthScorer();
      const skill = createTestSkill();

      const health = scorer.evaluateSkill(skill);

      expect(health.score).toBeDefined();
      expect(health.isDeprecated).toBe(false);
      expect(health.isDecaying).toBe(false);
      expect(health.lastHealthCheck).toBeDefined();
    });
  });
});
