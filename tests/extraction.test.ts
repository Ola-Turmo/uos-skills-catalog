/**
 * Tests for Skill Extraction Functionality
 */

import { describe, it, expect } from "vitest";
import type {
  SkillMetadata,
} from "../src/index";
import type {
  ExternalSkillDef,
  BundleSkillDef,
} from "../src/catalog/extraction";
import {
  extractFromExternalSkills,
  extractFromBundleSkills,
  createExtractionManifest,
  mergeExtractionResults,
  transformToCatalogMetadata,
  createCatalogEntry,
} from "../src/catalog/extraction";
import {
  createLineageStore,
  recordSkillCreation,
} from "../src/catalog/lineage";

describe("Skill Extraction", () => {
  describe("extractFromExternalSkills", () => {
    const sampleSkills: ExternalSkillDef[] = [
      {
        id: "test-skill-1",
        sourceRelativePath: "vendor/external-skills/ola-turmo/test-skill-1",
        roleKeys: ["ceo", "operations"],
        bundleIds: ["uos-operations"],
      },
      {
        id: "test-skill-2",
        sourceRelativePath: "vendor/external-skills/coreyhaines31/marketingskills/revops",
        roleKeys: ["growth"],
        bundleIds: ["uos-growth"],
      },
    ];

    it("extracts skills with correct metadata", () => {
      const results = extractFromExternalSkills(sampleSkills, "uos-core", {
        sourceRef: "main",
        defaultLifecycleState: "stable",
        defaultOwnerTeam: "platform",
      });

      expect(results.length).toBe(2);
      
      const result1 = results.find(r => r.originalId === "test-skill-1");
      expect(result1).toBeDefined();
      expect(result1?.status).toBe("extracted");
      expect(result1?.metadata).toBeDefined();
      expect(result1?.metadata?.lifecycleState).toBe("stable");
      expect(result1?.metadata?.ownership.ownerTeam).toBe("platform");
      expect(result1?.metadata?.roleKeys).toEqual(["ceo", "operations"]);
    });

    it("sets correct lineage information", () => {
      const results = extractFromExternalSkills(sampleSkills, "uos-core", {
        sourceRef: "feature/extraction",
        defaultLifecycleState: "experimental",
      });

      const result1 = results.find(r => r.originalId === "test-skill-1");
      expect(result1?.metadata?.lineage.sourceRepo).toBe("uos-core");
      expect(result1?.metadata?.lineage.sourcePath).toBe("vendor/external-skills/ola-turmo/test-skill-1");
      expect(result1?.metadata?.lineage.extractedAt).toBeDefined();
    });

    it("handles extraction failures gracefully", () => {
      // Empty skills array should not cause issues
      const results = extractFromExternalSkills([], "uos-core");
      expect(results.length).toBe(0);
    });

    it("infers categories from bundle IDs", () => {
      const results = extractFromExternalSkills(sampleSkills, "uos-core");
      
      const opsResult = results.find(r => r.originalId === "test-skill-1");
      expect(opsResult?.metadata?.categories).toContain("operations");
      
      const growthResult = results.find(r => r.originalId === "test-skill-2");
      expect(growthResult?.metadata?.categories).toContain("growth");
    });

    it("preserves source paths and exposes catalog lineage metadata for consumer migrations", () => {
      const results = extractFromExternalSkills(sampleSkills, "uos-core", {
        sourceRef: "catalog-consumer",
        defaultLifecycleState: "stable",
        defaultOwnerTeam: "platform",
      });

      expect(results).toHaveLength(2);
      expect(results[0]?.metadata?.lineage.sourcePath).toBe(sampleSkills[0]?.sourceRelativePath);
      expect(results[0]?.catalogId).toBe("test-skill-1");
      expect(results[0]?.metadata?.lineage.sourceRepo).toBe("uos-core");
      expect(results[0]?.metadata?.tags).toContain("vendor");
      expect(results[1]?.metadata?.tags).toContain("marketing");
    });
  });

  describe("extractFromBundleSkills", () => {
    const sampleBundles: BundleSkillDef[] = [
      {
        bundleId: "uos-operations",
        version: "1.0.0",
        targetRoles: ["operations"],
        targetFunctions: ["operations"],
        targetMissions: ["strategy-to-budget"],
        materializationMode: "materialized",
        required: true,
        items: ["planning-cycle", "review-packet"],
      },
      {
        bundleId: "uos-growth",
        version: "1.0.0",
        targetRoles: ["growth"],
        targetFunctions: ["growth"],
        targetMissions: ["lead-to-close"],
        materializationMode: "materialized",
        required: true,
        items: ["pipeline-review", "forecast-review"],
      },
    ];

    it("extracts bundle skills with correct IDs", () => {
      const results = extractFromBundleSkills(sampleBundles, "uos-core");

      expect(results.length).toBe(2);
      
      const opsResult = results.find(r => r.originalId === "uos-operations");
      expect(opsResult?.catalogId).toBe("uos-operations-bundle");
      expect(opsResult?.status).toBe("extracted");
    });

    it("sets bundle skill names correctly", () => {
      const results = extractFromBundleSkills(sampleBundles, "uos-core");
      
      const opsResult = results.find(r => r.originalId === "uos-operations");
      expect(opsResult?.metadata?.name).toBe("UOS Operations Bundle");
      
      const growthResult = results.find(r => r.originalId === "uos-growth");
      expect(growthResult?.metadata?.name).toBe("UOS Growth Bundle");
    });

    it("maps target roles and bundles correctly", () => {
      const results = extractFromBundleSkills(sampleBundles, "uos-core");
      
      const opsResult = results.find(r => r.originalId === "uos-operations");
      expect(opsResult?.metadata?.roleKeys).toEqual(["operations"]);
      expect(opsResult?.metadata?.bundleIds).toEqual(["uos-operations"]);
    });
  });

  describe("createExtractionManifest", () => {
    it("creates manifest with correct structure", () => {
      const extractionResults = [
        {
          originalId: "skill-1",
          catalogId: "skill-1",
          status: "extracted" as const,
          metadata: {
            id: "skill-1",
            name: "Skill 1",
            description: "Test skill 1",
            version: "1.0.0",
            lifecycleState: "stable" as const,
            ownership: { ownerRepo: "uos-core" },
            lineage: {
              sourceRepo: "uos-core",
              sourcePath: "test",
              extractedAt: "2024-01-01T00:00:00.000Z",
              extractionVersion: "1.0.0",
            },
            bundleIds: [],
            roleKeys: [],
            categories: [],
            tags: [],
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
        },
      ];

      const manifest = createExtractionManifest(extractionResults, {
        sourceRepo: "uos-core",
        sourceRef: "main",
        defaultLifecycleState: "stable",
      });

      expect(manifest.extractionId).toBeDefined();
      expect(manifest.extractedAt).toBeDefined();
      expect(manifest.sourceRepo).toBe("uos-core");
      expect(manifest.sourceRef).toBe("main");
      expect(manifest.skills.length).toBe(1);
      expect(manifest.skills[0].originalId).toBe("skill-1");
      expect(manifest.skills[0].status).toBe("extracted");
    });
  });

  describe("mergeExtractionResults", () => {
    it("identifies new vs updated skills", () => {
      const existing: SkillMetadata[] = [
        {
          id: "existing-skill",
          name: "Existing Skill",
          description: "Already in catalog",
          version: "1.0.0",
          lifecycleState: "stable",
          ownership: { ownerRepo: "uos-core" },
          lineage: {
            sourceRepo: "uos-core",
            sourcePath: "test",
            extractedAt: "2024-01-01T00:00:00.000Z",
            extractionVersion: "1.0.0",
            originalId: "existing-skill",
          },
          bundleIds: [],
          roleKeys: [],
          categories: [],
          tags: [],
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ];

      const newResults = [
        {
          originalId: "existing-skill",
          catalogId: "existing-skill",
          status: "extracted" as const,
          metadata: {
            id: "existing-skill",
            name: "Existing Skill Updated",
            description: "Updated description",
            version: "1.0.1",
            lifecycleState: "stable",
            ownership: { ownerRepo: "uos-core" },
            lineage: {
              sourceRepo: "uos-core",
              sourcePath: "test",
              extractedAt: "2024-01-15T00:00:00.000Z",
              extractionVersion: "1.0.0",
              originalId: "existing-skill",
            },
            bundleIds: [],
            roleKeys: [],
            categories: [],
            tags: [],
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-15T00:00:00.000Z",
          },
        },
        {
          originalId: "new-skill",
          catalogId: "new-skill",
          status: "extracted" as const,
          metadata: {
            id: "new-skill",
            name: "New Skill",
            description: "Brand new skill",
            version: "1.0.0",
            lifecycleState: "experimental",
            ownership: { ownerRepo: "uos-core" },
            lineage: {
              sourceRepo: "uos-core",
              sourcePath: "new",
              extractedAt: "2024-01-15T00:00:00.000Z",
              extractionVersion: "1.0.0",
              originalId: "new-skill",
            },
            bundleIds: [],
            roleKeys: [],
            categories: [],
            tags: [],
            createdAt: "2024-01-15T00:00:00.000Z",
            updatedAt: "2024-01-15T00:00:00.000Z",
          },
        },
      ];

      const { updated, new: newResults2 } = mergeExtractionResults(existing, newResults);

      expect(updated.length).toBe(1);
      expect(updated[0].id).toBe("existing-skill");
      expect(updated[0].version).toBe("1.0.1");
      
      expect(newResults2.length).toBe(1);
      expect(newResults2[0].originalId).toBe("new-skill");
    });
  });
});

describe("Lineage Store", () => {
  it("records and retrieves lineage events", () => {
    const store = createLineageStore();
    
    const event = store.recordEvent({
      skillId: "test-skill",
      eventType: "created",
      actor: "test-script",
      details: { reason: "initial creation" },
      newVersion: "1.0.0",
    });

    expect(event.id).toBeDefined();
    expect(event.timestamp).toBeDefined();
    expect(event.eventType).toBe("created");
  });

  it("retrieves lineage summary", () => {
    const store = createLineageStore();
    
    store.recordEvent({
      skillId: "test-skill",
      eventType: "created",
      details: {},
      newVersion: "1.0.0",
    });

    store.recordEvent({
      skillId: "test-skill",
      eventType: "updated",
      details: { changes: ["description"] },
      previousVersion: "1.0.0",
      newVersion: "1.0.1",
    });

    const summary = store.getLineageSummary("test-skill");
    expect(summary).toBeDefined();
    expect(summary?.eventCount).toBe(2);
    expect(summary?.currentVersion).toBe("1.0.1");
  });

  it("imports from extraction manifest", () => {
    const store = createLineageStore();
    
    const manifest = createExtractionManifest([
      { originalId: "skill-1", catalogId: "skill-1", status: "extracted" },
      { originalId: "skill-2", catalogId: "skill-2", status: "extracted" },
    ], {
      sourceRepo: "uos-core",
      sourceRef: "main",
      defaultLifecycleState: "stable",
    });

    store.importFromManifest(manifest);

    expect(store.hasLineage("skill-1")).toBe(true);
    expect(store.hasLineage("skill-2")).toBe(true);
    expect(store.getLineage("skill-1")?.events[0].eventType).toBe("extracted");
  });
});
