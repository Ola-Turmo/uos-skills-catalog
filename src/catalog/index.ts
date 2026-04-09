/**
 * UOS Skills Catalog - Core catalog management.
 * 
 * This module provides the foundation for:
 * - Managing catalog entries with normalized metadata
 * - Search with explanation
 * - Lineage tracking
 * - Consumer resolution
 */

import { z } from "zod";
import {
  type SkillMetadata,
  type CatalogEntry,
  type CatalogIndexEntry,
  type SkillSearchQuery,
  type SkillSearchResult,
  type SkillSearchResponse,
  type SkillLifecycleState,
  SkillMetadataSchema,
  CatalogEntrySchema,
  CatalogIndexEntrySchema,
  SkillSearchQuerySchema,
  SkillSearchResultSchema,
  SkillSearchResponseSchema,
  SearchRelevanceSchema,
} from "../schema/skill-metadata";

/**
 * In-memory catalog store.
 * In production, this would be backed by a database or file system.
 */
export class SkillCatalog {
  private entries: Map<string, CatalogEntry> = new Map();
  private index: CatalogIndexEntry[] = [];

  constructor(initialEntries: CatalogEntry[] = []) {
    for (const entry of initialEntries) {
      this.addEntry(entry);
    }
  }

  /**
   * Add or update a catalog entry.
   */
  addEntry(entry: CatalogEntry): void {
    const validated = CatalogEntrySchema.parse(entry);
    this.entries.set(validated.metadata.id, validated);
    this.rebuildIndex();
  }

  /**
   * Get a catalog entry by ID.
   */
  getEntry(id: string): CatalogEntry | undefined {
    return this.entries.get(id);
  }

  /**
   * Get metadata only (without content) for an entry.
   */
  getMetadata(id: string): SkillMetadata | undefined {
    return this.entries.get(id)?.metadata;
  }

  /**
   * List all entries with optional filtering.
   */
  listEntries(options?: {
    lifecycleStates?: SkillLifecycleState[];
    bundleIds?: string[];
    roleKeys?: string[];
  }): SkillMetadata[] {
    let entries = Array.from(this.entries.values()).map(e => e.metadata);

    if (options?.lifecycleStates) {
      entries = entries.filter(e => 
        options.lifecycleStates!.includes(e.lifecycleState)
      );
    }

    if (options?.bundleIds) {
      entries = entries.filter(e =>
        e.bundleIds.some(bid => options.bundleIds!.includes(bid))
      );
    }

    if (options?.roleKeys) {
      entries = entries.filter(e =>
        e.roleKeys.some(rk => options.roleKeys!.includes(rk))
      );
    }

    return entries;
  }

  /**
   * Search the catalog with explanation.
   */
  search(query: SkillSearchQuery): SkillSearchResponse {
    const startTime = Date.now();
    const validatedQuery = SkillSearchQuerySchema.parse(query);
    
    let candidates = this.index;

    // Filter by lifecycle state
    if (validatedQuery.lifecycleStates && validatedQuery.lifecycleStates.length > 0) {
      candidates = candidates.filter(e => 
        validatedQuery.lifecycleStates!.includes(e.lifecycleState)
      );
    }

    // Filter by bundle IDs
    if (validatedQuery.bundleIds && validatedQuery.bundleIds.length > 0) {
      candidates = candidates.filter(e =>
        e.bundleIds.some(bid => validatedQuery.bundleIds!.includes(bid))
      );
    }

    // Filter by role keys
    if (validatedQuery.roleKeys && validatedQuery.roleKeys.length > 0) {
      candidates = candidates.filter(e =>
        e.roleKeys.some(rk => validatedQuery.roleKeys!.includes(rk))
      );
    }

    // Filter by categories
    if (validatedQuery.categories && validatedQuery.categories.length > 0) {
      candidates = candidates.filter(e =>
        e.categories.some(cat => validatedQuery.categories!.includes(cat))
      );
    }

    // Filter by tags
    if (validatedQuery.tags && validatedQuery.tags.length > 0) {
      candidates = candidates.filter(e =>
        e.tags.some(tag => validatedQuery.tags!.includes(tag))
      );
    }

    // Text search with scoring
    const results: SkillSearchResult[] = [];
    const queryTerms = validatedQuery.query?.toLowerCase().split(/\s+/) || [];

    for (const candidate of candidates) {
      const relevance = this.calculateRelevance(candidate, queryTerms, validatedQuery);
      // Include candidate if it has positive relevance OR if no filters were applied (return all)
      const hasFilters = 
        (validatedQuery.lifecycleStates && validatedQuery.lifecycleStates.length > 0) ||
        (validatedQuery.bundleIds && validatedQuery.bundleIds.length > 0) ||
        (validatedQuery.roleKeys && validatedQuery.roleKeys.length > 0) ||
        (validatedQuery.categories && validatedQuery.categories.length > 0) ||
        (validatedQuery.tags && validatedQuery.tags.length > 0);
      
      if (relevance.relevanceScore > 0 || (!hasFilters && queryTerms.length === 0)) {
        const entry = this.entries.get(candidate.id);
        results.push({
          entry: candidate,
          relevance,
          content: validatedQuery.includeContent ? entry?.content : undefined,
        });
      }
    }

    // Sort by relevance score descending
    results.sort((a, b) => b.relevance.relevanceScore - a.relevance.relevanceScore);

    // Apply pagination
    const total = results.length;
    const paginatedResults = results.slice(
      validatedQuery.offset,
      validatedQuery.offset + validatedQuery.limit
    );

    return SkillSearchResponseSchema.parse({
      results: paginatedResults,
      total,
      query: validatedQuery,
      searchMetadata: {
        searchedAt: new Date().toISOString(),
        tookMs: Date.now() - startTime,
      },
    });
  }

  /**
   * Calculate relevance score and explanation for a candidate.
   */
  private calculateRelevance(
    candidate: CatalogIndexEntry,
    queryTerms: string[],
    query: SkillSearchQuery
  ): z.infer<typeof SearchRelevanceSchema> {
    const matchedOn: string[] = [];
    let score = 0;

    // Exact ID match gets highest score
    if (queryTerms.length === 1 && candidate.id.toLowerCase().includes(queryTerms[0])) {
      score += 0.9;
      matchedOn.push("id");
    }

    // Name match
    const nameLower = candidate.name.toLowerCase();
    for (const term of queryTerms) {
      if (nameLower.includes(term)) {
        score += 0.7;
        if (!matchedOn.includes("name")) matchedOn.push("name");
        break;
      }
    }

    // Description match
    const descLower = candidate.description.toLowerCase();
    for (const term of queryTerms) {
      if (descLower.includes(term)) {
        score += 0.5;
        if (!matchedOn.includes("description")) matchedOn.push("description");
        break;
      }
    }

    // Tag match
    for (const term of queryTerms) {
      const tagMatch = candidate.tags.some(tag => tag.toLowerCase().includes(term));
      if (tagMatch) {
        score += 0.4;
        if (!matchedOn.includes("tags")) matchedOn.push("tags");
        break;
      }
    }

    // Category match
    for (const term of queryTerms) {
      const catMatch = candidate.categories.some(cat => cat.toLowerCase().includes(term));
      if (catMatch) {
        score += 0.3;
        if (!matchedOn.includes("categories")) matchedOn.push("categories");
        break;
      }
    }

    // Role key match
    if (query.roleKeys) {
      const roleMatch = candidate.roleKeys.some(rk => query.roleKeys!.includes(rk));
      if (roleMatch) {
        score += 0.6;
        if (!matchedOn.includes("roleKeys")) matchedOn.push("roleKeys");
      }
    }

    // Bundle ID match
    if (query.bundleIds) {
      const bundleMatch = candidate.bundleIds.some(bid => query.bundleIds!.includes(bid));
      if (bundleMatch) {
        score += 0.5;
        if (!matchedOn.includes("bundleIds")) matchedOn.push("bundleIds");
      }
    }

    // Normalize score to 0-1 range
    score = Math.min(1, score);

    // Generate explanation
    let explanation = "";
    if (queryTerms.length > 0) {
      const matchedTerms = queryTerms.filter(term => 
        candidate.name.toLowerCase().includes(term) ||
        candidate.description.toLowerCase().includes(term) ||
        candidate.tags.some(t => t.toLowerCase().includes(term)) ||
        candidate.categories.some(c => c.toLowerCase().includes(term))
      );
      if (matchedTerms.length > 0) {
        explanation = `Matched on ${matchedOn.join(", ")} for query "${queryTerms.join(" ")}"`;
      } else {
        explanation = `Included by role/bundle filter despite no text match`;
      }
    } else {
      explanation = `Included by role/bundle filter`;
    }

    // Boost stable skills slightly over experimental
    if (candidate.lifecycleState === "stable" && score > 0) {
      score *= 1.1;
      score = Math.min(1, score);
      explanation += " (stable skill boost)";
    }

    return {
      matchedOn: matchedOn.length > 0 ? matchedOn : ["filter"],
      relevanceScore: score,
      explanation,
      tags: candidate.tags,
      roleKeys: candidate.roleKeys,
      bundleIds: candidate.bundleIds,
    };
  }

  /**
   * Rebuild the search index.
   */
  private rebuildIndex(): void {
    this.index = Array.from(this.entries.values()).map(entry => ({
      id: entry.metadata.id,
      name: entry.metadata.name,
      description: entry.metadata.description,
      lifecycleState: entry.metadata.lifecycleState,
      categories: entry.metadata.categories,
      tags: entry.metadata.tags,
      roleKeys: entry.metadata.roleKeys,
      bundleIds: entry.metadata.bundleIds,
    }));
  }

  /**
   * Get the total number of entries.
   */
  get size(): number {
    return this.entries.size;
  }

  /**
   * Check if an entry exists.
   */
  has(id: string): boolean {
    return this.entries.has(id);
  }

  /**
   * Remove an entry from the catalog.
   */
  remove(id: string): boolean {
    const deleted = this.entries.delete(id);
    if (deleted) {
      this.rebuildIndex();
    }
    return deleted;
  }

  /**
   * Export all entries as an array.
   */
  toArray(): CatalogEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Export index for search.
   */
  getIndex(): CatalogIndexEntry[] {
    return [...this.index];
  }
}

/**
 * Create a new empty catalog.
 */
export function createSkillCatalog(initialEntries?: CatalogEntry[]): SkillCatalog {
  return new SkillCatalog(initialEntries);
}

/**
 * Validate a skill metadata object.
 */
export function validateSkillMetadata(metadata: unknown): SkillMetadata {
  return SkillMetadataSchema.parse(metadata);
}

/**
 * Validate a catalog entry.
 */
export function validateCatalogEntry(entry: unknown): CatalogEntry {
  return CatalogEntrySchema.parse(entry);
}
