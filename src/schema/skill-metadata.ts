/**
 * Normalized skill metadata schema for the UOS Skills Catalog.
 * 
 * This schema provides a consistent structure for all skills in the catalog,
 * ensuring discoverability, evaluability, and portability.
 */

import { z } from "zod";

/**
 * Lifecycle states for a skill in the catalog.
 */
export const SkillLifecycleStateSchema = z.enum([
  "experimental",   // New skill, may change or be removed
  "stable",          // Production-ready, backward compatible expected
  "deprecated",      // Will be removed, use replacement instead
  "archived"         // Removed from active catalog
]);
export type SkillLifecycleState = z.infer<typeof SkillLifecycleStateSchema>;

/**
 * Skill ownership metadata.
 */
export const SkillOwnershipSchema = z.object({
  ownerRepo: z.string().describe("Source repository that owns this skill"),
  ownerTeam: z.string().optional().describe("Team responsible for maintaining this skill"),
  primaryContact: z.string().optional().describe("Primary contact for questions about this skill"),
});
export type SkillOwnership = z.infer<typeof SkillOwnershipSchema>;

/**
 * Skill lineage - tracks where the skill came from and how it evolved.
 */
export const SkillLineageSchema = z.object({
  sourceRepo: z.string().describe("Original repository where the skill was defined"),
  sourcePath: z.string().describe("Path within the source repository"),
  extractedAt: z.string().datetime().describe("ISO timestamp when skill was extracted to catalog"),
  extractionVersion: z.string().describe("Version of the extraction process used"),
  originalId: z.string().optional().describe("Original skill ID in source repo if different"),
  replacedBy: z.string().optional().describe("ID of skill that replaces this one (for deprecated skills)"),
  replaces: z.string().optional().describe("ID of skill this one replaces (for new versions)"),
  tags: z.array(z.string()).default([]).describe("Tags for categorization"),
});
export type SkillLineage = z.infer<typeof SkillLineageSchema>;

/**
 * Skill evaluation metadata.
 */
export const SkillEvaluationSchema = z.object({
  qualityScore: z.number().min(0).max(100).optional().describe("Quality score 0-100"),
  safetyScore: z.number().min(0).max(100).optional().describe("Safety score 0-100"),
  taskFitScore: z.number().min(0).max(100).optional().describe("Task fit score 0-100"),
  evaluationDate: z.string().datetime().optional().describe("Last evaluation date"),
  evaluatorNotes: z.string().optional().describe("Notes from the evaluator"),
  benchmarkTaskIds: z.array(z.string()).default([]).describe("Benchmark tasks used for evaluation"),
});
export type SkillEvaluation = z.infer<typeof SkillEvaluationSchema>;

/**
 * Search relevance explanation for why a skill was surfaced.
 */
export const SearchRelevanceSchema = z.object({
  matchedOn: z.array(z.string()).describe("Fields that matched the query"),
  relevanceScore: z.number().min(0).max(1).describe("Normalized relevance score 0-1"),
  explanation: z.string().describe("Human-readable explanation of why this skill was selected"),
  tags: z.array(z.string()).default([]).describe("Tags that matched"),
  roleKeys: z.array(z.string()).default([]).describe("Role keys that match"),
  bundleIds: z.array(z.string()).default([]).describe("Bundle IDs that match"),
});
export type SearchRelevance = z.infer<typeof SearchRelevanceSchema>;

/**
 * Normalized skill metadata - the complete catalog entry schema.
 */
export const SkillMetadataSchema = z.object({
  // Core identity
  id: z.string().describe("Unique identifier for this skill in the catalog"),
  name: z.string().describe("Human-readable name"),
  description: z.string().describe("Brief description of what the skill does"),
  version: z.string().describe("Semantic version of this skill definition"),
  
  // Lifecycle
  lifecycleState: SkillLifecycleStateSchema.describe("Current lifecycle state"),
  
  // Ownership
  ownership: SkillOwnershipSchema.describe("Ownership metadata"),
  
  // Lineage
  lineage: SkillLineageSchema.describe("Origin and evolution tracking"),
  
  // Evaluation
  evaluation: SkillEvaluationSchema.optional().describe("Quality and safety evaluation"),
  
  // Content reference
  contentPath: z.string().optional().describe("Path to the skill content in the catalog"),
  contentHash: z.string().optional().describe("Hash of the skill content for integrity"),
  
  // Relationships
  bundleIds: z.array(z.string()).default([]).describe("Skill bundles this skill belongs to"),
  roleKeys: z.array(z.string()).default([]).describe("Roles this skill is relevant for"),
  
  // Discovery
  categories: z.array(z.string()).default([]).describe("Categories for discovery"),
  tags: z.array(z.string()).default([]).describe("Tags for filtering"),
  
  // Compatibility
  compatibility: z.object({
    minVersion: z.string().optional().describe("Minimum compatible version"),
    maxVersion: z.string().optional().describe("Maximum compatible version"),
    deprecatedVersions: z.array(z.string()).default([]).describe("Deprecated versions"),
  }).optional(),
  
  // Timestamps
  createdAt: z.string().datetime().describe("When this catalog entry was created"),
  updatedAt: z.string().datetime().describe("When this catalog entry was last updated"),
});
export type SkillMetadata = z.infer<typeof SkillMetadataSchema>;

/**
 * Catalog index entry - lightweight reference for search and discovery.
 */
export const CatalogIndexEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  lifecycleState: SkillLifecycleStateSchema,
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  roleKeys: z.array(z.string()),
  bundleIds: z.array(z.string()),
  relevanceScore: z.number().min(0).max(1).optional(),
});
export type CatalogIndexEntry = z.infer<typeof CatalogIndexEntrySchema>;

/**
 * Full catalog entry including content reference.
 */
export const CatalogEntrySchema = z.object({
  metadata: SkillMetadataSchema,
  content: z.string().optional().describe("The skill content (markdown or other format)"),
});
export type CatalogEntry = z.infer<typeof CatalogEntrySchema>;

/**
 * Search query parameters.
 */
export const SkillSearchQuerySchema = z.object({
  query: z.string().optional().describe("Text search query"),
  roleKeys: z.array(z.string()).optional().describe("Filter by role keys"),
  bundleIds: z.array(z.string()).optional().describe("Filter by bundle IDs"),
  categories: z.array(z.string()).optional().describe("Filter by categories"),
  tags: z.array(z.string()).optional().describe("Filter by tags"),
  lifecycleStates: z.array(SkillLifecycleStateSchema).optional().describe("Filter by lifecycle state"),
  includeContent: z.boolean().default(false).describe("Include full content in results"),
  limit: z.number().min(1).max(100).default(20).describe("Maximum results to return"),
  offset: z.number().min(0).default(0).describe("Results to skip for pagination"),
});
export type SkillSearchQuery = z.infer<typeof SkillSearchQuerySchema>;

/**
 * Search result with explanation.
 */
export const SkillSearchResultSchema = z.object({
  entry: CatalogIndexEntrySchema,
  relevance: SearchRelevanceSchema,
  content: z.string().optional().describe("Full content if includeContent=true"),
});
export type SkillSearchResult = z.infer<typeof SkillSearchResultSchema>;

/**
 * Search response with results and metadata.
 */
export const SkillSearchResponseSchema = z.object({
  results: z.array(SkillSearchResultSchema),
  total: z.number().describe("Total matching entries"),
  query: SkillSearchQuerySchema,
  searchMetadata: z.object({
    searchedAt: z.string().datetime(),
    tookMs: z.number().describe("Search duration in milliseconds"),
  }),
});
export type SkillSearchResponse = z.infer<typeof SkillSearchResponseSchema>;

/**
 * Extraction manifest - records what was extracted from a source.
 */
export const ExtractionManifestSchema = z.object({
  extractionId: z.string().uuid(),
  extractedAt: z.string().datetime(),
  sourceRepo: z.string(),
  sourceRef: z.string().describe("Git ref or version that was extracted from"),
  skills: z.array(z.object({
    originalId: z.string(),
    catalogId: z.string(),
    status: z.enum(["extracted", "updated", "failed"]),
    error: z.string().optional(),
  })),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type ExtractionManifest = z.infer<typeof ExtractionManifestSchema>;

// Re-export Zod schemas for convenience
export const schemas = {
  SkillLifecycleState: SkillLifecycleStateSchema,
  SkillOwnership: SkillOwnershipSchema,
  SkillLineage: SkillLineageSchema,
  SkillEvaluation: SkillEvaluationSchema,
  SearchRelevance: SearchRelevanceSchema,
  SkillMetadata: SkillMetadataSchema,
  CatalogIndexEntry: CatalogIndexEntrySchema,
  CatalogEntry: CatalogEntrySchema,
  SkillSearchQuery: SkillSearchQuerySchema,
  SkillSearchResult: SkillSearchResultSchema,
  SkillSearchResponse: SkillSearchResponseSchema,
  ExtractionManifest: ExtractionManifestSchema,
};
