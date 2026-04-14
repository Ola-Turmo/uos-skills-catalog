// Paperclip Plugin Integration for uos-skills-catalog

import { SkillCatalog, Marketplace, DiscoveryEngine, DependencyGraph } from './catalog';
import type { SkillCatalogConfig } from './catalog/skill-catalog';

export interface SkillsCatalogPluginOptions {
  catalog?: SkillCatalogConfig;
  enableMarketplace?: boolean;
  enableDiscovery?: boolean;
  enableDependencyGraph?: boolean;
}

export interface SkillsCatalogPlugin {
  catalog: SkillCatalog;
  marketplace: Marketplace;
  discovery: DiscoveryEngine;
  dependencyGraph: DependencyGraph;
  ping: () => { status: 'ok'; timestamp: string };
  health: () => { healthy: number; decaying: number; deprecated: number };
}

export function createPlugin(options: SkillsCatalogPluginOptions = {}): SkillsCatalogPlugin {
  const catalog = new SkillCatalog(options.catalog);
  const marketplace = new Marketplace();
  const discovery = new DiscoveryEngine();
  const dependencyGraph = new DependencyGraph();

  // Link dependency graph to catalog
  dependencyGraph.setSkillAccessor((id) => catalog.get(id));

  // Wire up catalog events to update dependency graph
  catalog.onEvent((event) => {
    if (event.type === 'skill_added') {
      const skill = catalog.get(event.skillId);
      if (skill) {
        dependencyGraph.addSkill(skill);
      }
    } else if (event.type === 'skill_removed') {
      dependencyGraph.removeSkill(event.skillId);
    }
  });

  return {
    catalog,
    marketplace,
    discovery,
    dependencyGraph,
    ping: () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }),
    health: () => {
      const stats = catalog.getStats();
      return {
        healthy: stats.byHealth.healthy,
        decaying: stats.byHealth.decaying,
        deprecated: stats.byHealth.deprecated,
      };
    },
  };
}

// Default plugin instance
let defaultPlugin: SkillsCatalogPlugin | null = null;

export function getDefaultPlugin(): SkillsCatalogPlugin {
  if (!defaultPlugin) {
    defaultPlugin = createPlugin();
  }
  return defaultPlugin;
}
