// Paperclip Plugin Integration for uos-skills-catalog
import { SkillCatalog, Marketplace, DiscoveryEngine, DependencyGraph } from './catalog';
export function createPlugin(options = {}) {
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
        }
        else if (event.type === 'skill_removed') {
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
let defaultPlugin = null;
export function getDefaultPlugin() {
    if (!defaultPlugin) {
        defaultPlugin = createPlugin();
    }
    return defaultPlugin;
}
//# sourceMappingURL=plugin.js.map