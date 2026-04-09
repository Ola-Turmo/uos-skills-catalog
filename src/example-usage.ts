/**
 * Example: Extracting Skills from Core into the Catalog
 * 
 * This demonstrates how to:
 * 1. Extract skills from uos-core's external-skills.ts and bundle skills
 * 2. Transform them into normalized catalog format
 * 3. Add them to the catalog with lineage tracking
 */

import {
  createSkillCatalog,
  createLineageStore,
  extractFromExternalSkills,
  extractFromBundleSkills,
  createExtractionManifest,
  recordSkillCreation,
  type CatalogEntry,
} from "./index";

// Example external skill definitions (from uos-core/src/external-skills.ts)
const exampleExternalSkills = [
  {
    id: "kurs-ing-migration-cutover-control",
    sourceRelativePath: "vendor/external-skills/kurs-ing/migration-cutover-control",
    roleKeys: ["ceo", "operations", "technology-platform-lead"],
    bundleIds: ["uos-operations", "uos-product-tech"],
    companySlugs: ["kurs-ing"],
  },
  {
    id: "uos-external-process-docs",
    sourceRelativePath: "vendor/external-skills/ola-turmo/unified-skills-catalog/process-docs",
    roleKeys: ["operations", "operations-planning-lead", "operations-knowledge-lead"],
    bundleIds: ["uos-operations"],
  },
  {
    id: "uos-external-revops",
    sourceRelativePath: "vendor/external-skills/coreyhaines31/marketingskills/revops",
    roleKeys: ["growth", "growth-revops-lead", "growth-lifecycle-lead"],
    bundleIds: ["uos-growth"],
  },
];

// Example bundle skill definitions (from uos-core/src/packs/universal.ts)
const exampleBundleSkills = [
  {
    bundleId: "uos-core",
    version: "1.0.0",
    targetRoles: ["ceo", "operations", "finance", "risk"],
    targetFunctions: ["operations", "finance", "risk"],
    targetMissions: ["strategy-to-budget"],
    materializationMode: "materialized",
    required: true,
    items: ["operating-review", "goal-cascade", "issue-hierarchy"],
  },
  {
    bundleId: "uos-operations",
    version: "1.0.0",
    targetRoles: ["operations"],
    targetFunctions: ["operations"],
    targetMissions: ["strategy-to-budget", "hire-to-productivity"],
    materializationMode: "materialized",
    required: true,
    items: ["planning-cycle", "review-packet", "knowledge-to-automation"],
  },
  {
    bundleId: "uos-growth",
    version: "1.0.0",
    targetRoles: ["growth"],
    targetFunctions: ["growth"],
    targetMissions: ["lead-to-close"],
    materializationMode: "materialized",
    required: true,
    items: ["pipeline-review", "forecast-review", "campaign-routing"],
  },
];

/**
 * Example workflow: Extract skills from uos-core into the catalog.
 */
export function exampleExtractionWorkflow() {
  // Create catalog and lineage store
  const catalog = createSkillCatalog();
  const lineageStore = createLineageStore();

  // Extract external skills
  const externalResults = extractFromExternalSkills(exampleExternalSkills, "uos-core", {
    sourceRef: "main",
    defaultLifecycleState: "stable",
    defaultOwnerTeam: "platform",
    extractionVersion: "1.0.0",
  });

  console.log("External skills extraction results:");
  for (const result of externalResults) {
    console.log(`  ${result.originalId} -> ${result.catalogId} (${result.status})`);
    if (result.metadata) {
      // Record lineage
      recordSkillCreation(lineageStore, result.metadata, "extraction-script");
      
      // Add to catalog
      const entry: CatalogEntry = {
        metadata: result.metadata,
        content: undefined, // Would be populated from actual skill content
      };
      catalog.addEntry(entry);
    }
  }

  // Extract bundle skills
  const bundleResults = extractFromBundleSkills(exampleBundleSkills, "uos-core", {
    sourceRef: "main",
    defaultLifecycleState: "stable",
    defaultOwnerTeam: "platform",
    extractionVersion: "1.0.0",
  });

  console.log("\nBundle skills extraction results:");
  for (const result of bundleResults) {
    console.log(`  ${result.originalId} -> ${result.catalogId} (${result.status})`);
    if (result.metadata) {
      recordSkillCreation(lineageStore, result.metadata, "extraction-script");
      const entry: CatalogEntry = {
        metadata: result.metadata,
        content: undefined,
      };
      catalog.addEntry(entry);
    }
  }

  // Create extraction manifest
  const manifest = createExtractionManifest(
    [...externalResults, ...bundleResults],
    {
      sourceRepo: "uos-core",
      sourceRef: "main",
      defaultLifecycleState: "stable",
      defaultOwnerTeam: "platform",
      extractionVersion: "1.0.0",
    }
  );

  console.log("\nExtraction manifest:");
  console.log(`  ID: ${manifest.extractionId}`);
  console.log(`  Extracted: ${manifest.extractedAt}`);
  console.log(`  Skills: ${manifest.skills.length}`);

  return { catalog, lineageStore, manifest };
}

/**
 * Example workflow: Search the catalog with explanation.
 */
export function exampleSearchWorkflow(catalog: ReturnType<typeof createSkillCatalog>) {
  // Search for operations-related skills
  const operationsSearch = catalog.search({
    query: "operations planning",
    bundleIds: ["uos-operations"],
    limit: 10,
  });

  console.log("\nOperations search results:");
  console.log(`  Total: ${operationsSearch.total}`);
  console.log(`  Took: ${operationsSearch.searchMetadata.tookMs}ms`);
  
  for (const result of operationsSearch.results) {
    console.log(`\n  ${result.entry.name} (${result.entry.lifecycleState})`);
    console.log(`    Score: ${result.relevance.relevanceScore.toFixed(2)}`);
    console.log(`    Why: ${result.relevance.explanation}`);
    console.log(`    Matched on: ${result.relevance.matchedOn.join(", ")}`);
  }

  // Search by role key
  const roleSearch = catalog.search({
    roleKeys: ["ceo", "operations"],
    lifecycleStates: ["stable"],
    limit: 10,
  });

  console.log("\nCEO/Operations role search results:");
  console.log(`  Total: ${roleSearch.total}`);
  
  for (const result of roleSearch.results) {
    console.log(`  - ${result.entry.name} (${result.entry.lifecycleState})`);
  }

  return { operationsSearch, roleSearch };
}

/**
 * Example workflow: Get lineage for a skill.
 */
export function exampleLineageWorkflow(lineageStore: ReturnType<typeof createLineageStore>) {
  // Get lineage for a specific skill
  const skillId = "kurs-ing-migration-cutover-control";
  const report = lineageStore.getLineageSummary(skillId);
  
  if (report) {
    console.log(`\nLineage for ${skillId}:`);
    console.log(`  Current version: ${report.currentVersion}`);
    console.log(`  Created: ${report.createdAt}`);
    console.log(`  Last updated: ${report.lastUpdatedAt}`);
    console.log(`  Event count: ${report.eventCount}`);
  }

  // Get lineage report
  const fullReport = lineageStore.getLineage(skillId);
  if (fullReport) {
    console.log(`\n  Full lineage (${fullReport.events.length} events):`);
    for (const event of fullReport.events) {
      console.log(`    - [${event.timestamp}] ${event.eventType}: ${JSON.stringify(event.details)}`);
    }
  }

  return report;
}

// Run examples if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Running skills catalog example workflows...\n");
  
  const { catalog, lineageStore, manifest } = exampleExtractionWorkflow();
  exampleSearchWorkflow(catalog);
  exampleLineageWorkflow(lineageStore);
  
  console.log("\n✓ Example workflows completed");
}
