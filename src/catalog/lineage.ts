/**
 * Skill Lineage Tracking.
 * 
 * This module tracks the origin and evolution of skills,
 * ensuring transparency about where skills come from and
 * how they've changed over time.
 */

import { v4 as uuidv4 } from "uuid";
import type { SkillMetadata, ExtractionManifest } from "../schema/skill-metadata";

/**
 * Lineage event types.
 */
export type LineageEventType = 
  | "created"
  | "extracted"
  | "updated"
  | "deprecated"
  | "archived"
  | "replaced"
  | "restored";

/**
 * A lineage event recording a change to a skill.
 */
export interface LineageEvent {
  id: string;
  skillId: string;
  eventType: LineageEventType;
  timestamp: string;
  actor?: string;
  sourceRef?: string;
  details: Record<string, unknown>;
  previousVersion?: string;
  newVersion?: string;
}

/**
 * Complete lineage record for a skill.
 */
export interface SkillLineageRecord {
  skillId: string;
  currentVersion: string;
  events: LineageEvent[];
}

/**
 * In-memory lineage store.
 */
export class LineageStore {
  private records: Map<string, SkillLineageRecord> = new Map();

  /**
   * Record a lineage event.
   */
  recordEvent(event: Omit<LineageEvent, "id" | "timestamp">): LineageEvent {
    const fullEvent: LineageEvent = {
      ...event,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };

    const record = this.records.get(event.skillId);
    if (record) {
      record.events.push(fullEvent);
      record.currentVersion = event.newVersion || record.currentVersion;
    } else {
      this.records.set(event.skillId, {
        skillId: event.skillId,
        currentVersion: event.newVersion || "1.0.0",
        events: [fullEvent],
      });
    }

    return fullEvent;
  }

  /**
   * Get the lineage record for a skill.
   */
  getLineage(skillId: string): SkillLineageRecord | undefined {
    return this.records.get(skillId);
  }

  /**
   * Get the full history for a skill.
   */
  getHistory(skillId: string): LineageEvent[] {
    return this.records.get(skillId)?.events || [];
  }

  /**
   * Get all skills with lineage records.
   */
  getAllSkills(): string[] {
    return Array.from(this.records.keys());
  }

  /**
   * Check if a skill has been extracted (has lineage).
   */
  hasLineage(skillId: string): boolean {
    return this.records.has(skillId);
  }

  /**
   * Get the creation event for a skill if it exists.
   */
  getCreationEvent(skillId: string): LineageEvent | undefined {
    const record = this.records.get(skillId);
    return record?.events.find(e => e.eventType === "created");
  }

  /**
   * Get the most recent event for a skill.
   */
  getLatestEvent(skillId: string): LineageEvent | undefined {
    const record = this.records.get(skillId);
    return record?.events.at(-1);
  }

  /**
   * Get all events of a specific type.
   */
  getEventsByType(skillId: string, eventType: LineageEventType): LineageEvent[] {
    const record = this.records.get(skillId);
    return record?.events.filter(e => e.eventType === eventType) || [];
  }

  /**
   * Get lineage summary for display.
   */
  getLineageSummary(skillId: string): {
    skillId: string;
    currentVersion: string;
    eventCount: number;
    createdAt: string | undefined;
    lastUpdatedAt: string | undefined;
    extractedFrom: string | undefined;
    replacedBy: string | undefined;
  } | undefined {
    const record = this.records.get(skillId);
    if (!record) return undefined;

    const createdEvent = record.events.find(e => e.eventType === "created");
    const lastEvent = record.events.at(-1);
    const extractedEvent = record.events.find(e => e.eventType === "extracted");
    const replacedEvent = record.events.find(e => e.eventType === "replaced");

    return {
      skillId: record.skillId,
      currentVersion: record.currentVersion,
      eventCount: record.events.length,
      createdAt: createdEvent?.timestamp,
      lastUpdatedAt: lastEvent?.timestamp,
      extractedFrom: extractedEvent?.sourceRef,
      replacedBy: replacedEvent?.details["replacedBy"] as string | undefined,
    };
  }

  /**
   * Import lineage from extraction manifest.
   */
  importFromManifest(manifest: ExtractionManifest): void {
    for (const skill of manifest.skills) {
      this.recordEvent({
        skillId: skill.catalogId,
        eventType: "extracted",
        sourceRef: manifest.sourceRef,
        details: {
          extractionId: manifest.extractionId,
          sourceRepo: manifest.sourceRepo,
          originalId: skill.originalId,
          status: skill.status,
        },
        newVersion: "1.0.0",
      });
    }
  }

  /**
   * Export all lineage records.
   */
  exportAll(): SkillLineageRecord[] {
    return Array.from(this.records.values());
  }

  /**
   * Clear all lineage records.
   */
  clear(): void {
    this.records.clear();
  }
}

/**
 * Create a new lineage store.
 */
export function createLineageStore(): LineageStore {
  return new LineageStore();
}

/**
 * Record skill creation in lineage.
 */
export function recordSkillCreation(
  store: LineageStore,
  skill: SkillMetadata,
  actor?: string
): LineageEvent {
  return store.recordEvent({
    skillId: skill.id,
    eventType: "created",
    actor,
    details: {
      name: skill.name,
      description: skill.description,
      sourceRepo: skill.lineage.sourceRepo,
      sourcePath: skill.lineage.sourcePath,
    },
    newVersion: skill.version,
  });
}

/**
 * Record skill extraction in lineage.
 */
export function recordSkillExtraction(
  store: LineageStore,
  skill: SkillMetadata,
  extractionId: string
): LineageEvent {
  return store.recordEvent({
    skillId: skill.id,
    eventType: "extracted",
    sourceRef: skill.lineage.extractedAt,
    details: {
      extractionId,
      sourceRepo: skill.lineage.sourceRepo,
      sourcePath: skill.lineage.sourcePath,
    },
    newVersion: skill.version,
  });
}

/**
 * Record skill deprecation in lineage.
 */
export function recordSkillDeprecation(
  store: LineageStore,
  skill: SkillMetadata,
  replacedBy?: string,
  actor?: string
): LineageEvent {
  return store.recordEvent({
    skillId: skill.id,
    eventType: "deprecated",
    actor,
    details: {
      replacedBy,
      reason: "Skill has been deprecated in favor of a newer version or replacement",
    },
    previousVersion: skill.version,
    newVersion: skill.version,
  });
}

/**
 * Record skill update in lineage.
 */
export function recordSkillUpdate(
  store: LineageStore,
  skill: SkillMetadata,
  changes: Record<string, unknown>,
  actor?: string
): LineageEvent {
  return store.recordEvent({
    skillId: skill.id,
    eventType: "updated",
    actor,
    details: changes,
    previousVersion: skill.version,
    newVersion: skill.version,
  });
}

/**
 * Generate lineage report for a skill.
 */
export function generateLineageReport(store: LineageStore, skillId: string): {
  skillId: string;
  summary: ReturnType<LineageStore["getLineageSummary"]>;
  timeline: Array<{
    timestamp: string;
    eventType: LineageEventType;
    description: string;
    actor?: string;
  }>;
} | undefined {
  const summary = store.getLineageSummary(skillId);
  if (!summary) return undefined;

  const events = store.getHistory(skillId);
  
  const timeline = events.map(event => ({
    timestamp: event.timestamp,
    eventType: event.eventType,
    description: formatEventDescription(event),
    actor: event.actor,
  }));

  return {
    skillId,
    summary,
    timeline,
  };
}

/**
 * Format an event into a human-readable description.
 */
function formatEventDescription(event: LineageEvent): string {
  switch (event.eventType) {
    case "created":
      return `Skill created (${event.newVersion})`;
    case "extracted":
      return `Extracted from ${event.sourceRef || "unknown"}`;
    case "updated":
      return `Updated from ${event.previousVersion} to ${event.newVersion}`;
    case "deprecated":
      return `Deprecated${event.details["replacedBy"] ? `, replaced by ${event.details["replacedBy"]}` : ""}`;
    case "archived":
      return "Archived and removed from active catalog";
    case "replaced":
      return `Replaced by ${event.details["replacedBy"]}`;
    case "restored":
      return "Restored to active catalog";
    default:
      return `Event: ${event.eventType}`;
  }
}
