import { SkillSchema, type Skill, type SearchOptions, type SearchResult, type CatalogEvent, type EventHandler } from './types';
import { HealthScorer, type HealthScorerConfig } from './health-scorer';
import { VersionManager } from './version-manager';

export interface SkillCatalogConfig {
  healthScorer?: HealthScorerConfig;
  enableAutoHealthCheck?: boolean;
  autoHealthCheckIntervalMs?: number;
}

export class SkillCatalog {
  private skills: Map<string, Skill> = new Map();
  private eventHandlers: Set<EventHandler> = new Set();
  private healthScorer: HealthScorer;
  private versionManager: VersionManager;
  private config: Required<SkillCatalogConfig>;

  constructor(config: SkillCatalogConfig = {}) {
    this.config = {
      healthScorer: config.healthScorer || {},
      enableAutoHealthCheck: config.enableAutoHealthCheck ?? true,
      autoHealthCheckIntervalMs: config.autoHealthCheckIntervalMs || 60000,
    };
    this.healthScorer = new HealthScorer(this.config.healthScorer);
    this.versionManager = new VersionManager();
  }

  private emit(event: CatalogEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('Event handler error:', error);
      }
    }
  }

  onEvent(handler: EventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => this.eventHandlers.delete(handler);
  }

  generateId(): string {
    return `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  add(data: { id?: string } & Omit<Skill, 'id' | 'createdAt' | 'updatedAt' | 'versions' | 'health'>): Skill {
    const now = new Date().toISOString();
    const skillId = data.id || this.generateId();
    
    const skillData: Skill = {
      id: skillId,
      name: data.name,
      description: data.description,
      version: data.version || '1.0.0',
      author: data.author,
      tags: data.tags || [],
      category: data.category,
      dependencies: data.dependencies || [],
      versions: [],
      metrics: data.metrics || {
        usageCount: 0,
        successRate: 1,
        avgLatencyMs: 0,
        errorCount: 0,
      },
      health: {
        score: 50,
        isDeprecated: false,
        isDecaying: false,
        lastHealthCheck: now,
      },
      createdAt: now,
      updatedAt: now,
      metadata: data.metadata || {},
    };

    // Validate and parse
    const skill = SkillSchema.parse(skillData);

    // Add initial version
    skill.versions.push(this.versionManager.createVersionEntry(skill, 'Initial version'));

    this.skills.set(skill.id, skill);

    this.emit({
      type: 'skill_added',
      skillId: skill.id,
      timestamp: now,
    });

    return skill;
  }

  get(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  getByName(name: string): Skill | undefined {
    for (const skill of this.skills.values()) {
      if (skill.name.toLowerCase() === name.toLowerCase()) {
        return skill;
      }
    }
    return undefined;
  }

  update(id: string, data: Partial<Skill>): Skill | null {
    const existing = this.skills.get(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updated: Skill = {
      ...existing,
      ...data,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: now,
    };

    // If version changed, add to version history
    if (data.version && data.version !== existing.version) {
      const withVersion = this.versionManager.addVersion(updated, data.metadata?.changelog as string | undefined);
      if (withVersion) {
        updated.versions = withVersion.versions;
      }
    }

    // Recalculate health
    updated.health = this.healthScorer.evaluateSkill(updated);

    this.skills.set(id, updated);

    this.emit({
      type: 'skill_updated',
      skillId: id,
      timestamp: now,
      data: { changes: Object.keys(data) },
    });

    return updated;
  }

  remove(id: string): boolean {
    const skill = this.skills.get(id);
    if (!skill) return false;

    this.skills.delete(id);

    this.emit({
      type: 'skill_removed',
      skillId: id,
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  search(options: SearchOptions): SearchResult[] {
    const results: SearchResult[] = [];
    const { query, tags, category, includeDeprecated, minHealthScore, limit = 50, offset = 0 } = options;

    for (const skill of this.skills.values()) {
      // Filter deprecated
      if (!includeDeprecated && skill.health.isDeprecated) {
        continue;
      }

      // Filter by health score
      if (minHealthScore !== undefined && skill.health.score < minHealthScore) {
        continue;
      }

      // Filter by category
      if (category && skill.category !== category) {
        continue;
      }

      // Filter by tags
      if (tags && tags.length > 0) {
        const hasMatchingTag = tags.some(tag => skill.tags.includes(tag));
        if (!hasMatchingTag) continue;
      }

      // Calculate relevance
      let relevanceScore = 1;
      const matchedFields: string[] = [];

      if (query) {
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/);

        // Check name
        if (skill.name.toLowerCase().includes(queryLower)) {
          relevanceScore += 10;
          matchedFields.push('name');
        }

        // Check description
        if (skill.description.toLowerCase().includes(queryLower)) {
          relevanceScore += 5;
          matchedFields.push('description');
        }

        // Check tags
        const tagMatches = skill.tags.filter(t => 
          queryWords.some(w => t.toLowerCase().includes(w))
        );
        if (tagMatches.length > 0) {
          relevanceScore += tagMatches.length * 3;
          matchedFields.push('tags');
        }

        // Check author
        if (skill.author?.toLowerCase().includes(queryLower)) {
          relevanceScore += 2;
          matchedFields.push('author');
        }

        // Semantic-ish matching based on word overlap
        const skillWords = `${skill.name} ${skill.description} ${skill.tags.join(' ')}`.toLowerCase().split(/\s+/);
        const overlap = queryWords.filter(w => skillWords.some(sw => sw.includes(w) || w.includes(sw)));
        relevanceScore += overlap.length;
      } else {
        relevanceScore = skill.health.score;
        matchedFields.push('health');
      }

      if (relevanceScore > 0) {
        results.push({ skill, relevanceScore, matchedFields });
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Apply pagination
    return results.slice(offset, offset + limit);
  }

  getAll(): Skill[] {
    return Array.from(this.skills.values());
  }

  getByCategory(category: string): Skill[] {
    return this.getAll().filter(s => s.category === category);
  }

  getByTag(tag: string): Skill[] {
    return this.getAll().filter(s => s.tags.includes(tag));
  }

  getDeprecated(): Skill[] {
    return this.getAll().filter(s => s.health.isDeprecated);
  }

  getDecaying(): Skill[] {
    return this.getAll().filter(s => s.health.isDecaying);
  }

  recordUsage(id: string, success: boolean, latencyMs: number): Skill | null {
    const skill = this.skills.get(id);
    if (!skill) return null;

    const updatedMetrics = this.healthScorer.recordUsage(skill, success, latencyMs);
    return this.update(id, { metrics: updatedMetrics });
  }

  deprecate(id: string, reason: string): Skill | null {
    const skill = this.skills.get(id);
    if (!skill) return null;

    const updatedHealth = this.healthScorer.suggestDeprecation(skill, reason);
    const updated = this.update(id, { health: updatedHealth });

    if (updated) {
      this.emit({
        type: 'skill_deprecated',
        skillId: id,
        timestamp: new Date().toISOString(),
        data: { reason },
      });
    }

    return updated;
  }

  checkHealth(id: string): Skill | null {
    const skill = this.skills.get(id);
    if (!skill) return null;

    const updatedHealth = this.healthScorer.evaluateSkill(skill);
    return this.update(id, { health: updatedHealth });
  }

  checkAllHealth(): void {
    for (const skill of this.skills.values()) {
      this.checkHealth(skill.id);
    }
  }

  getStats(): {
    total: number;
    byCategory: Record<string, number>;
    byHealth: { healthy: number; decaying: number; deprecated: number };
    avgHealthScore: number;
  } {
    const skills = this.getAll();
    const byCategory: Record<string, number> = {};
    let healthy = 0;
    let decaying = 0;
    let deprecated = 0;
    let totalHealthScore = 0;

    for (const skill of skills) {
      // By category
      const cat = skill.category || 'uncategorized';
      byCategory[cat] = (byCategory[cat] || 0) + 1;

      // By health status
      if (skill.health.isDeprecated) {
        deprecated++;
      } else if (skill.health.isDecaying) {
        decaying++;
      } else {
        healthy++;
      }

      totalHealthScore += skill.health.score;
    }

    return {
      total: skills.length,
      byCategory,
      byHealth: { healthy, decaying, deprecated },
      avgHealthScore: skills.length > 0 ? Math.round(totalHealthScore / skills.length) : 0,
    };
  }

  // Persistence helpers
  toJSON(): string {
    return JSON.stringify({
      skills: Array.from(this.skills.entries()),
      exportedAt: new Date().toISOString(),
    });
  }

  static fromJSON(json: string): SkillCatalog {
    const data = JSON.parse(json);
    const catalog = new SkillCatalog();
    for (const [id, skill] of data.skills) {
      catalog.skills.set(id, skill as Skill);
    }
    return catalog;
  }

  clear(): void {
    this.skills.clear();
  }
}
