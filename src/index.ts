/**
 * Skills Catalog - Main Entry Point
 * 
 * Exports all public interfaces for the skills catalog package.
 */

// Schema types
export {
  type SkillLifecycleState,
  type SkillOwnership,
  type SkillLineage,
  type SkillEvaluation,
  type SearchRelevance,
  type SkillMetadata,
  type CatalogIndexEntry,
  type CatalogEntry,
  type SkillSearchQuery,
  type SkillSearchResult,
  type SkillSearchResponse,
  type ExtractionManifest,
  schemas,
  SkillLifecycleStateSchema,
  SkillOwnershipSchema,
  SkillLineageSchema,
  SkillEvaluationSchema,
  SearchRelevanceSchema,
  SkillMetadataSchema,
  CatalogIndexEntrySchema,
  CatalogEntrySchema,
  SkillSearchQuerySchema,
  SkillSearchResultSchema,
  SkillSearchResponseSchema,
  ExtractionManifestSchema,
} from "./schema/skill-metadata";

// Catalog management
export {
  SkillCatalog,
  createSkillCatalog,
  validateSkillMetadata,
  validateCatalogEntry,
} from "./catalog/index";

// Extraction
export {
  type SkillSourceLocation,
  type RawSkillDefinition,
  type ExtractionOptions,
  type ExtractionResult,
  type ExternalSkillDef,
  type BundleSkillDef,
  transformToCatalogMetadata,
  createCatalogEntry,
  extractFromExternalSkills,
  extractFromBundleSkills,
  createExtractionManifest,
  mergeExtractionResults,
} from "./catalog/extraction";

// Lineage
export {
  type LineageEventType,
  type LineageEvent,
  type SkillLineageRecord,
  LineageStore,
  createLineageStore,
  recordSkillCreation,
  recordSkillExtraction,
  recordSkillDeprecation,
  recordSkillUpdate,
  generateLineageReport,
} from "./catalog/lineage";

export {
  type CatalogResolvedExternalSkill,
  resolveExternalSkillImportsFromCatalog,
} from "./core-consumer";
