import type { Skill } from './types';
export interface DependencyNode {
    skillId: string;
    dependencies: string[];
    dependents: string[];
    type: 'required' | 'optional' | 'conflict';
}
export interface DependencyGraphData {
    nodes: Map<string, DependencyNode>;
    conflicts: Array<{
        skillA: string;
        skillB: string;
        reason: string;
    }>;
}
export interface DependencyResolution {
    success: boolean;
    resolved: string[];
    missing: string[];
    conflicts: Array<{
        skillA: string;
        skillB: string;
    }>;
}
export declare class DependencyGraph {
    private graphNodes;
    private graphConflicts;
    private getSkillById?;
    addSkill(skill: Skill): void;
    removeSkill(skillId: string): void;
    private addConflict;
    private findDependents;
    private detectConflicts;
    getDependencies(skillId: string): string[];
    getDependents(skillId: string): string[];
    getConflicts(skillId: string): Array<{
        skillId: string;
        reason: string;
    }>;
    hasConflicts(skillId: string): boolean;
    resolveDependencies(skillIds: string[], availableSkills: Map<string, Skill>): DependencyResolution;
    getDependencyChain(skillId: string): string[];
    getTopologicalOrder(skillIds: string[]): string[] | null;
    getGraph(): DependencyGraphData;
    clear(): void;
    setSkillAccessor(accessor: (id: string) => Skill | undefined): void;
}
//# sourceMappingURL=dependency-graph.d.ts.map