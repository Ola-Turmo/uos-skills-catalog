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
    ping: () => {
        status: 'ok';
        timestamp: string;
    };
    health: () => {
        healthy: number;
        decaying: number;
        deprecated: number;
    };
}
export declare function createPlugin(options?: SkillsCatalogPluginOptions): SkillsCatalogPlugin;
export declare function getDefaultPlugin(): SkillsCatalogPlugin;
//# sourceMappingURL=plugin.d.ts.map