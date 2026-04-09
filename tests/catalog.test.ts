/**
 * Tests for Skills Catalog Core Functionality
 */

import { describe, it, expect, beforeEach } from "vitest";
import type {
  CatalogEntry,
  SkillMetadata,
  SkillSearchQuery,
  SkillLifecycleState,
} from "../src/index";
import {
  createSkillCatalog,
  validateSkillMetadata,
  validateCatalogEntry,
} from "../src/catalog/index";

describe("SkillCatalog", () => {
  let catalog: ReturnType<typeof createSkillCatalog>;
  
  const sampleSkill: SkillMetadata = {
    id: "test-skill",
    name: "Test Skill",
    description: "A skill for testing purposes",
    version: "1.0.0",
    lifecycleState: "stable",
    ownership: {
      ownerRepo: "uos-core",
      ownerTeam: "platform",
    },
    lineage: {
      sourceRepo: "uos-core",
      sourcePath: "src/test-skill",
      extractedAt: "2024-01-01T00:00:00.000Z",
      extractionVersion: "1.0.0",
      tags: ["test"],
    },
    bundleIds: ["uos-core"],
    roleKeys: ["ceo", "operations"],
    categories: ["operations"],
    tags: ["test", "sample"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  const sampleEntry: CatalogEntry = {
    metadata: sampleSkill,
    content: "# Test Skill Content\n\nThis is the skill markdown content.",
  };

  beforeEach(() => {
    catalog = createSkillCatalog();
  });

  describe("addEntry", () => {
    it("adds an entry to the catalog", () => {
      catalog.addEntry(sampleEntry);
      expect(catalog.size).toBe(1);
      expect(catalog.has("test-skill")).toBe(true);
    });

    it("updates existing entry when added again", () => {
      catalog.addEntry(sampleEntry);
      const updatedEntry: CatalogEntry = {
        ...sampleEntry,
        metadata: {
          ...sampleSkill,
          version: "1.0.1",
          description: "Updated description",
        },
      };
      catalog.addEntry(updatedEntry);
      expect(catalog.size).toBe(1);
      expect(catalog.getMetadata("test-skill")?.version).toBe("1.0.1");
    });
  });

  describe("getEntry", () => {
    it("retrieves an entry by ID", () => {
      catalog.addEntry(sampleEntry);
      const entry = catalog.getEntry("test-skill");
      expect(entry).toBeDefined();
      expect(entry?.metadata.name).toBe("Test Skill");
    });

    it("returns undefined for non-existent entry", () => {
      const entry = catalog.getEntry("non-existent");
      expect(entry).toBeUndefined();
    });
  });

  describe("getMetadata", () => {
    it("retrieves metadata only", () => {
      catalog.addEntry(sampleEntry);
      const metadata = catalog.getMetadata("test-skill");
      expect(metadata).toBeDefined();
      expect(metadata?.id).toBe("test-skill");
    });
  });

  describe("listEntries", () => {
    beforeEach(() => {
      const stableSkill: CatalogEntry = {
        metadata: { ...sampleSkill, id: "stable-skill", lifecycleState: "stable" as SkillLifecycleState },
        content: undefined,
      };
      const experimentalSkill: CatalogEntry = {
        metadata: { ...sampleSkill, id: "experimental-skill", lifecycleState: "experimental" as SkillLifecycleState },
        content: undefined,
      };
      catalog.addEntry(sampleEntry);
      catalog.addEntry(stableSkill);
      catalog.addEntry(experimentalSkill);
    });

    it("lists all entries by default", () => {
      const entries = catalog.listEntries();
      expect(entries.length).toBe(3);
    });

    it("filters by lifecycle state", () => {
      const stableEntries = catalog.listEntries({ lifecycleStates: ["stable"] });
      expect(stableEntries.length).toBe(2); // sampleEntry is also stable
    });

    it("filters by bundle IDs", () => {
      const entries = catalog.listEntries({ bundleIds: ["uos-core"] });
      expect(entries.length).toBe(3);
    });

    it("filters by role keys", () => {
      const entries = catalog.listEntries({ roleKeys: ["ceo"] });
      expect(entries.length).toBe(3); // all have ceo
    });
  });

  describe("search", () => {
    beforeEach(() => {
      const skill1: CatalogEntry = {
        metadata: {
          ...sampleSkill,
          id: "operations-planning",
          name: "Operations Planning",
          description: "Planning for operations teams",
          roleKeys: ["operations", "ceo"],
          bundleIds: ["uos-operations"],
          categories: ["operations"],
          tags: ["planning", "operations"],
        },
        content: "# Operations Planning",
      };
      const skill2: CatalogEntry = {
        metadata: {
          ...sampleSkill,
          id: "revenue-growth",
          name: "Revenue Growth",
          description: "Growth strategies for revenue",
          roleKeys: ["growth", "ceo"],
          bundleIds: ["uos-growth"],
          categories: ["growth"],
          tags: ["revenue", "growth"],
        },
        content: "# Revenue Growth",
      };
      const skill3: CatalogEntry = {
        metadata: {
          ...sampleSkill,
          id: "customer-support",
          name: "Customer Support",
          description: "Support for customers",
          roleKeys: ["customer", "ceo"],
          bundleIds: ["uos-customer"],
          categories: ["customer-service"],
          tags: ["support", "customer"],
        },
        content: "# Customer Support",
      };
      catalog.addEntry(skill1);
      catalog.addEntry(skill2);
      catalog.addEntry(skill3);
    });

    it("searches by text query", () => {
      const results = catalog.search({ query: "operations", limit: 10 });
      expect(results.total).toBeGreaterThan(0);
      expect(results.results[0]?.entry.name).toBe("Operations Planning");
    });

    it("filters by role keys", () => {
      const results = catalog.search({ roleKeys: ["ceo"], limit: 10 });
      expect(results.total).toBe(3); // All skills have ceo
    });

    it("filters by bundle IDs", () => {
      const results = catalog.search({ bundleIds: ["uos-growth"], limit: 10 });
      expect(results.total).toBe(1);
      expect(results.results[0]?.entry.name).toBe("Revenue Growth");
    });

    it("combines text search with filters", () => {
      const results = catalog.search({
        query: "support",
        bundleIds: ["uos-customer"],
        limit: 10,
      });
      expect(results.total).toBe(1);
    });

    it("returns relevance explanation", () => {
      const results = catalog.search({ query: "planning", limit: 10 });
      expect(results.results[0]?.relevance.explanation).toBeDefined();
      expect(results.results[0]?.relevance.matchedOn).toBeDefined();
    });

    it("respects pagination", () => {
      const results = catalog.search({ limit: 2, offset: 0 });
      expect(results.results.length).toBe(2);
      expect(results.total).toBe(3);
    });

    it("includes content when requested", () => {
      const results = catalog.search({
        query: "operations",
        includeContent: true,
        limit: 10,
      });
      expect(results.results[0]?.content).toBeDefined();
    });

    it("supports explaining why catalog-backed consumer entries were surfaced", () => {
      const results = catalog.search({ query: "operations", limit: 10 });
      expect(results.results[0]?.relevance.explanation).toBeDefined();
    });
  });

  describe("remove", () => {
    it("removes an entry", () => {
      catalog.addEntry(sampleEntry);
      expect(catalog.size).toBe(1);
      const removed = catalog.remove("test-skill");
      expect(removed).toBe(true);
      expect(catalog.size).toBe(0);
    });

    it("returns false for non-existent entry", () => {
      const removed = catalog.remove("non-existent");
      expect(removed).toBe(false);
    });
  });

  describe("toArray", () => {
    it("exports all entries as array", () => {
      catalog.addEntry(sampleEntry);
      const entries = catalog.toArray();
      expect(entries.length).toBe(1);
      expect(entries[0]?.metadata.id).toBe("test-skill");
    });
  });
});

describe("Schema Validation", () => {
  describe("validateSkillMetadata", () => {
    it("validates correct metadata", () => {
      const metadata = {
        id: "test",
        name: "Test",
        description: "A test skill",
        version: "1.0.0",
        lifecycleState: "stable",
        ownership: { ownerRepo: "test-repo" },
        lineage: {
          sourceRepo: "test-repo",
          sourcePath: "test/path",
          extractedAt: "2024-01-01T00:00:00.000Z",
          extractionVersion: "1.0.0",
        },
        bundleIds: [],
        roleKeys: [],
        categories: [],
        tags: [],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };
      
      const result = validateSkillMetadata(metadata);
      expect(result.id).toBe("test");
    });

    it("throws on invalid metadata", () => {
      const invalid = { id: 123 };
      expect(() => validateSkillMetadata(invalid)).toThrow();
    });
  });

  describe("validateCatalogEntry", () => {
    it("validates correct catalog entry", () => {
      const entry = {
        metadata: {
          id: "test",
          name: "Test",
          description: "A test skill",
          version: "1.0.0",
          lifecycleState: "stable",
          ownership: { ownerRepo: "test-repo" },
          lineage: {
            sourceRepo: "test-repo",
            sourcePath: "test/path",
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
        content: "# Test Content",
      };
      
      const result = validateCatalogEntry(entry);
      expect(result.metadata.id).toBe("test");
    });
  });
});
