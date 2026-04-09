/**
 * Skill Extraction from Core and Tool Repos.
 * 
 * This module handles extracting skills from their source locations
 * (uos-core, tool plugins) and normalizing them into the catalog format.
 */

import { v4 as uuidv4 } from "uuid";
import type {
  SkillMetadata,
  CatalogEntry,
  ExtractionManifest,
  SkillLifecycleState,
} from "../schema/skill-metadata";
import { SkillMetadataSchema } from "../schema/skill-metadata";

/**
 * Source location for a skill being extracted.
 */
export interface SkillSourceLocation {
  repo: string;
  path: string;
  type: "core" | "tool" | "department";
}

/**
 * Raw skill definition from source.
 */
export interface RawSkillDefinition {
  id: string;
  name: string;
  description: string;
  markdown?: string;
  roleKeys?: string[];
  bundleIds?: string[];
  tags?: string[];
  categories?: string[];
}

/**
 * Extraction options.
 */
export interface ExtractionOptions {
  sourceRepo: string;
  sourceRef: string;
  defaultLifecycleState?: SkillLifecycleState;
  defaultOwnerTeam?: string;
  extractionVersion?: string;
}

/**
 * Extraction result for a single skill.
 */
export interface ExtractionResult {
  originalId: string;
  catalogId: string;
  status: "extracted" | "updated" | "failed";
  metadata?: SkillMetadata;
  error?: string;
}

/**
 * Default extraction options.
 */
const DEFAULT_OPTIONS: ExtractionOptions = {
  sourceRepo: "unknown",
  sourceRef: "main",
  defaultLifecycleState: "experimental",
  extractionVersion: "1.0.0",
};

/**
 * Transform a raw skill definition into catalog metadata.
 */
export function transformToCatalogMetadata(
  raw: RawSkillDefinition,
  source: SkillSourceLocation,
  options: ExtractionOptions
): SkillMetadata {
  const now = new Date().toISOString();
  
  const metadata: SkillMetadata = {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    version: "1.0.0",
    lifecycleState: options.defaultLifecycleState || "experimental",
    ownership: {
      ownerRepo: source.repo,
      ownerTeam: options.defaultOwnerTeam,
    },
    lineage: {
      sourceRepo: source.repo,
      sourcePath: source.path,
      extractedAt: now,
      extractionVersion: options.extractionVersion || "1.0.0",
      originalId: raw.id,
      tags: raw.tags || [],
    },
    evaluation: undefined,
    contentPath: undefined,
    contentHash: undefined,
    bundleIds: raw.bundleIds || [],
    roleKeys: raw.roleKeys || [],
    categories: raw.categories || [],
    tags: raw.tags || [],
    createdAt: now,
    updatedAt: now,
  };

  return SkillMetadataSchema.parse(metadata);
}

/**
 * Create a catalog entry from raw skill definition.
 */
export function createCatalogEntry(
  raw: RawSkillDefinition,
  source: SkillSourceLocation,
  options: ExtractionOptions
): CatalogEntry {
  const metadata = transformToCatalogMetadata(raw, source, options);
  
  const entry: CatalogEntry = {
    metadata,
    content: raw.markdown,
  };

  return entry;
}

/**
 * Extract skills from external-skills.ts format in uos-core.
 * 
 * The external-skills.ts file defines skills with:
 * - id: skill identifier
 * - sourceRelativePath: path to the skill content
 * - roleKeys: applicable roles
 * - bundleIds: skill bundles
 * - companySlugs: company-specific filtering
 */
export interface ExternalSkillDef {
  id: string;
  sourceRelativePath: string;
  roleKeys: string[];
  bundleIds: string[];
  companySlugs?: string[];
}

export function extractFromExternalSkills(
  skills: ExternalSkillDef[],
  sourceRepo: string,
  options: Partial<ExtractionOptions> = {}
): ExtractionResult[] {
  const fullOptions: ExtractionOptions = { ...DEFAULT_OPTIONS, ...options, sourceRepo };
  const results: ExtractionResult[] = [];

  for (const skill of skills) {
    try {
      const source: SkillSourceLocation = {
        repo: sourceRepo,
        path: skill.sourceRelativePath,
        type: "core",
      };

      const raw: RawSkillDefinition = {
        id: skill.id,
        name: formatSkillName(skill.id),
        description: `External skill from ${skill.sourceRelativePath}`,
        roleKeys: skill.roleKeys,
        bundleIds: skill.bundleIds,
        tags: extractTagsFromPath(skill.sourceRelativePath),
        categories: inferCategories(skill.bundleIds),
      };

      const entry = createCatalogEntry(raw, source, fullOptions);
      
      results.push({
        originalId: skill.id,
        catalogId: entry.metadata.id,
        status: "extracted",
        metadata: entry.metadata,
      });
    } catch (error) {
      results.push({
        originalId: skill.id,
        catalogId: skill.id,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}

/**
 * Extract skills from operating-skills.ts bundle skill format.
 */
export interface BundleSkillDef {
  bundleId: string;
  version: string;
  targetRoles: string[];
  targetFunctions: string[];
  targetMissions: string[];
  materializationMode: string;
  required: boolean;
  items: string[];
}

export function extractFromBundleSkills(
  bundles: BundleSkillDef[],
  sourceRepo: string,
  options: Partial<ExtractionOptions> = {}
): ExtractionResult[] {
  const fullOptions: ExtractionOptions = { ...DEFAULT_OPTIONS, ...options, sourceRepo };
  const results: ExtractionResult[] = [];

  for (const bundle of bundles) {
    try {
      const source: SkillSourceLocation = {
        repo: sourceRepo,
        path: `packs/${bundle.bundleId}`,
        type: "core",
      };

      const raw: RawSkillDefinition = {
        id: `${bundle.bundleId}-bundle`,
        name: formatBundleName(bundle.bundleId),
        description: `Managed shared playbook for ${bundle.bundleId}`,
        roleKeys: bundle.targetRoles,
        bundleIds: [bundle.bundleId],
        tags: ["bundle", "managed", ...bundle.targetFunctions, ...bundle.targetMissions],
        categories: inferCategories([bundle.bundleId]),
      };

      const entry = createCatalogEntry(raw, source, fullOptions);
      
      results.push({
        originalId: bundle.bundleId,
        catalogId: entry.metadata.id,
        status: "extracted",
        metadata: entry.metadata,
      });
    } catch (error) {
      results.push({
        originalId: bundle.bundleId,
        catalogId: bundle.bundleId,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}

/**
 * Create extraction manifest for documenting what was extracted.
 */
export function createExtractionManifest(
  results: ExtractionResult[],
  options: ExtractionOptions
): ExtractionManifest {
  return {
    extractionId: uuidv4(),
    extractedAt: new Date().toISOString(),
    sourceRepo: options.sourceRepo,
    sourceRef: options.sourceRef,
    skills: results.map(r => ({
      originalId: r.originalId,
      catalogId: r.catalogId,
      status: r.status,
      error: r.error,
    })),
  };
}

/**
 * Format skill ID into a human-readable name.
 */
function formatSkillName(id: string): string {
  return id
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Format bundle ID into a human-readable name.
 */
function formatBundleName(bundleId: string): string {
  const name = bundleId
    .replace(/^uos-/, "")
    .split(/[-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return `UOS ${name} Bundle`;
}

/**
 * Extract tags from source path.
 */
function extractTagsFromPath(path: string): string[] {
  const tags: string[] = [];
  
  // Extract org/repo name
  const parts = path.split("/");
  if (parts.length >= 2) {
    tags.push(parts[0]); // e.g., "ola-turmo", "coreyhaines31"
  }
  
  // Extract skill category from path
  if (path.includes("marketing")) tags.push("marketing");
  if (path.includes("operations")) tags.push("operations");
  if (path.includes("seo")) tags.push("seo");
  if (path.includes("social")) tags.push("social");
  if (path.includes("support")) tags.push("support");
  if (path.includes("finance")) tags.push("finance");
  if (path.includes("process")) tags.push("process");
  
  return tags;
}

/**
 * Infer categories from bundle IDs.
 */
function inferCategories(bundleIds: string[]): string[] {
  const categories: string[] = [];
  
  for (const bundleId of bundleIds) {
    if (bundleId.includes("growth") || bundleId.includes("marketing")) {
      categories.push("growth");
    }
    if (bundleId.includes("operations")) {
      categories.push("operations");
    }
    if (bundleId.includes("customer")) {
      categories.push("customer-service");
    }
    if (bundleId.includes("finance") || bundleId.includes("risk")) {
      categories.push("finance-risk");
    }
    if (bundleId.includes("product") || bundleId.includes("tech")) {
      categories.push("product-tech");
    }
    if (bundleId.includes("social")) {
      categories.push("social-media");
    }
    if (bundleId.includes("people")) {
      categories.push("people");
    }
  }
  
  // Remove duplicates
  return [...new Set(categories)];
}

/**
 * Update existing catalog entries with new extraction data.
 */
export function mergeExtractionResults(
  existing: SkillMetadata[],
  results: ExtractionResult[]
): { updated: SkillMetadata[]; new: ExtractionResult[] } {
  const existingByOriginalId = new Map(existing.map(e => [e.lineage.originalId || e.id, e]));
  
  const updated: SkillMetadata[] = [];
  const newResults: ExtractionResult[] = [];

  for (const result of results) {
    if (result.status !== "extracted" || !result.metadata) {
      continue;
    }

    const existingEntry = existingByOriginalId.get(result.originalId);
    
    if (existingEntry) {
      // Update existing entry
      const updatedMetadata: SkillMetadata = {
        ...result.metadata,
        id: existingEntry.id, // Keep original catalog ID
        version: bumpVersion(existingEntry.version),
        lineage: {
          ...result.metadata.lineage,
          extractedAt: new Date().toISOString(),
          replaces: existingEntry.lineage.originalId !== existingEntry.id 
            ? existingEntry.lineage.originalId 
            : undefined,
        },
        createdAt: existingEntry.createdAt,
        updatedAt: new Date().toISOString(),
      };
      updated.push(updatedMetadata);
    } else {
      // New entry
      newResults.push(result);
    }
  }

  return { updated, new: newResults };
}

/**
 * Bump semantic version patch number.
 */
function bumpVersion(version: string): string {
  const parts = version.split(".");
  if (parts.length === 3) {
    const patch = parseInt(parts[2], 10) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }
  return "1.0.1";
}
