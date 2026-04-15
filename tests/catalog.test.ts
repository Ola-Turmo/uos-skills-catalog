import { describe, it, expect, beforeEach } from 'vitest';
import { SkillCatalog } from '../src/catalog/skill-catalog';
import type { Skill } from '../src/catalog/types';

describe('SkillCatalog', () => {
  let catalog: SkillCatalog;

  const createTestSkill = (overrides = {}): Omit<Skill, 'id' | 'createdAt' | 'updatedAt' | 'versions' | 'health'> => ({
    name: 'Test Skill',
    description: 'A test skill for unit testing',
    version: '1.0.0',
    tags: ['test', 'unit'],
    category: 'testing',
    dependencies: [],
    metrics: {
      usageCount: 0,
      successRate: 1,
      avgLatencyMs: 0,
      errorCount: 0,
    },
    ...overrides,
  });

  beforeEach(() => {
    catalog = new SkillCatalog();
  });

  describe('add', () => {
    it('should add a skill to the catalog', () => {
      const skillData = createTestSkill();
      const skill = catalog.add(skillData);

      expect(skill).toBeDefined();
      expect(skill.id).toBeDefined();
      expect(skill.name).toBe('Test Skill');
      expect(skill.version).toBe('1.0.0');
      expect(skill.createdAt).toBeDefined();
      expect(skill.updatedAt).toBeDefined();
      expect(skill.versions).toHaveLength(1);
    });

    it('should emit skill_added event', () => {
      let eventReceived = false;
      catalog.onEvent((event) => {
        if (event.type === 'skill_added') {
          eventReceived = true;
        }
      });

      catalog.add(createTestSkill());
      expect(eventReceived).toBe(true);
    });
  });

  describe('get', () => {
    it('should retrieve a skill by id', () => {
      const added = catalog.add(createTestSkill());
      const retrieved = catalog.get(added.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(added.id);
      expect(retrieved?.name).toBe(added.name);
    });

    it('should return undefined for non-existent skill', () => {
      const retrieved = catalog.get('non-existent-id');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getByName', () => {
    it('should find skill by name (case insensitive)', () => {
      catalog.add(createTestSkill({ name: 'My Special Skill' }));
      const found = catalog.getByName('my special skill');

      expect(found).toBeDefined();
      expect(found?.name).toBe('My Special Skill');
    });
  });

  describe('update', () => {
    it('should update an existing skill', () => {
      const skill = catalog.add(createTestSkill());
      const updated = catalog.update(skill.id, { name: 'Updated Name' });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.id).toBe(skill.id);
    });

    it('should return null for non-existent skill', () => {
      const result = catalog.update('non-existent', { name: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove a skill from the catalog', () => {
      const skill = catalog.add(createTestSkill());
      expect(catalog.get(skill.id)).toBeDefined();

      const removed = catalog.remove(skill.id);
      expect(removed).toBe(true);
      expect(catalog.get(skill.id)).toBeUndefined();
    });

    it('should return false for non-existent skill', () => {
      const result = catalog.remove('non-existent');
      expect(result).toBe(false);
    });

    it('should emit skill_removed event', () => {
      let eventReceived = false;
      catalog.onEvent((event) => {
        if (event.type === 'skill_removed') {
          eventReceived = true;
        }
      });

      const skill = catalog.add(createTestSkill());
      catalog.remove(skill.id);

      expect(eventReceived).toBe(true);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      catalog.add(createTestSkill({ name: 'Web Search', tags: ['search', 'web'] }));
      catalog.add(createTestSkill({ name: 'Code Analysis', tags: ['code', 'analysis'] }));
      catalog.add(createTestSkill({ name: 'File Operations', tags: ['file', 'io'] }));
    });

    it('should search by query string', () => {
      const results = catalog.search({ query: 'search' });
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].skill.name).toContain('Search');
    });

    it('should filter by tags', () => {
      const results = catalog.search({ tags: ['code'] });
      expect(results.length).toBe(1);
      expect(results[0].skill.name).toBe('Code Analysis');
    });

    it('should filter by category', () => {
      catalog.add(createTestSkill({ category: 'ai' }));
      const results = catalog.search({ category: 'ai' });
      expect(results.every(r => r.skill.category === 'ai')).toBe(true);
    });

    it('should exclude deprecated skills by default', () => {
      const skill = catalog.add(createTestSkill());
      catalog.deprecate(skill.id, 'No longer needed');

      const results = catalog.search({});
      expect(results.find(r => r.skill.id === skill.id)).toBeUndefined();
    });

    it('should include deprecated skills when specified', () => {
      const skill = catalog.add(createTestSkill());
      catalog.deprecate(skill.id, 'No longer needed');

      const results = catalog.search({ includeDeprecated: true });
      expect(results.find(r => r.skill.id === skill.id)).toBeDefined();
    });
  });

  describe('getAll', () => {
    it('should return all skills', () => {
      catalog.add(createTestSkill());
      catalog.add(createTestSkill({ name: 'Second Skill' }));
      catalog.add(createTestSkill({ name: 'Third Skill' }));

      const all = catalog.getAll();
      expect(all).toHaveLength(3);
    });
  });

  describe('recordUsage', () => {
    it('should track usage metrics', () => {
      const skill = catalog.add(createTestSkill());

      catalog.recordUsage(skill.id, true, 100);
      catalog.recordUsage(skill.id, true, 150);
      catalog.recordUsage(skill.id, false, 200);

      const updated = catalog.get(skill.id);
      expect(updated?.metrics.usageCount).toBe(3);
      expect(updated?.metrics.errorCount).toBe(1);
      expect(updated?.metrics.successRate).toBeCloseTo(0.667, 2);
    });
  });

  describe('deprecate', () => {
    it('should mark skill as deprecated', () => {
      const skill = catalog.add(createTestSkill());
      const deprecated = catalog.deprecate(skill.id, 'Outdated');

      expect(deprecated?.health.isDeprecated).toBe(true);
      expect(deprecated?.health.deprecationReason).toBe('Outdated');
    });
  });

  describe('getStats', () => {
    it('should return catalog statistics', () => {
      catalog.add(createTestSkill({ category: 'ai' }));
      catalog.add(createTestSkill({ category: 'ai' }));
      catalog.add(createTestSkill({ category: 'io' }));

      const stats = catalog.getStats();
      expect(stats.total).toBe(3);
      expect(stats.byCategory.ai).toBe(2);
      expect(stats.byCategory.io).toBe(1);
      expect(stats.avgHealthScore).toBeGreaterThan(0);
    });
  });

  describe('toJSON/fromJSON', () => {
    it('should serialize and deserialize catalog', () => {
      catalog.add(createTestSkill());
      catalog.add(createTestSkill({ name: 'Second' }));

      const json = catalog.toJSON();
      const restored = SkillCatalog.fromJSON(json);

      expect(restored.getAll()).toHaveLength(2);
      expect(restored.getByName('Second')).toBeDefined();
    });
  });
});
