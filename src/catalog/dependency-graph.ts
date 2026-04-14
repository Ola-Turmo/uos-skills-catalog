import type { Skill, SkillDependency } from './types';

export interface DependencyNode {
  skillId: string;
  dependencies: string[];
  dependents: string[];
  type: 'required' | 'optional' | 'conflict';
}

export interface DependencyGraphData {
  nodes: Map<string, DependencyNode>;
  conflicts: Array<{ skillA: string; skillB: string; reason: string }>;
}

export interface DependencyResolution {
  success: boolean;
  resolved: string[];
  missing: string[];
  conflicts: Array<{ skillA: string; skillB: string }>;
}

export class DependencyGraph {
  private graphNodes: Map<string, DependencyNode> = new Map();
  private graphConflicts: Array<{ skillA: string; skillB: string; reason: string }> = [];
  private getSkillById?: (id: string) => Skill | undefined;

  addSkill(skill: Skill): void {
    const dependencies = skill.dependencies
      .filter(d => d.type !== 'conflicts')
      .map(d => d.skillId);

    const dependents = this.findDependents(skill.id);

    this.graphNodes.set(skill.id, {
      skillId: skill.id,
      dependencies,
      dependents,
      type: 'required',
    });

    // Handle conflicts
    for (const dep of skill.dependencies) {
      if (dep.type === 'conflicts') {
        this.addConflict(skill.id, dep.skillId, `Direct conflict declared`);
      }
    }

    // Check for transitive conflicts
    this.detectConflicts(skill);
  }

  removeSkill(skillId: string): void {
    this.graphNodes.delete(skillId);
    // Remove from dependents lists
    for (const node of this.graphNodes.values()) {
      node.dependents = node.dependents.filter(id => id !== skillId);
      node.dependencies = node.dependencies.filter(id => id !== skillId);
    }
    // Remove related conflicts
    this.graphConflicts = this.graphConflicts.filter(
      c => c.skillA !== skillId && c.skillB !== skillId
    );
  }

  private addConflict(skillA: string, skillB: string, reason: string): void {
    // Avoid duplicates
    const exists = this.graphConflicts.some(
      c => (c.skillA === skillA && c.skillB === skillB) ||
           (c.skillA === skillB && c.skillB === skillA)
    );
    if (!exists) {
      this.graphConflicts.push({ skillA, skillB, reason });
    }
  }

  private findDependents(skillId: string): string[] {
    const dependents: string[] = [];
    for (const [id, node] of this.graphNodes) {
      if (node.dependencies.includes(skillId)) {
        dependents.push(id);
      }
    }
    return dependents;
  }

  private detectConflicts(skill: Skill): void {
    // Check if skill conflicts with any existing skills
    for (const existingId of this.graphNodes.keys()) {
      const existing = this.graphNodes.get(existingId);
      if (!existing) continue;

      // Check direct conflicts
      const existingSkill = this.getSkillById?.(existingId);
      if (existingSkill) {
        for (const dep of existingSkill.dependencies) {
          if (dep.type === 'conflicts' && dep.skillId === skill.id) {
            this.addConflict(existingId, skill.id, `Conflicts with ${existingSkill.name}`);
          }
        }
      }

      // Check category conflicts (simple heuristic)
      const existingSkillData = this.getSkillById?.(existingId);
      if (existingSkillData && existingSkillData.category === skill.category) {
        // Same category might conflict if tags don't overlap
        const sharedTags = existingSkillData.tags.filter(t => skill.tags.includes(t));
        if (sharedTags.length === 0 && existingSkillData.id !== skill.id) {
          // Potential conflict - same category but no shared tags
          this.addConflict(existingId, skill.id, `Same category (${skill.category}) with no shared tags`);
        }
      }
    }
  }

  getDependencies(skillId: string): string[] {
    const node = this.graphNodes.get(skillId);
    return node?.dependencies || [];
  }

  getDependents(skillId: string): string[] {
    const node = this.graphNodes.get(skillId);
    return node?.dependents || [];
  }

  getConflicts(skillId: string): Array<{ skillId: string; reason: string }> {
    return this.graphConflicts
      .filter(c => c.skillA === skillId || c.skillB === skillId)
      .map(c => ({
        skillId: c.skillA === skillId ? c.skillB : c.skillA,
        reason: c.reason,
      }));
  }

  hasConflicts(skillId: string): boolean {
    return this.graphConflicts.some(c => c.skillA === skillId || c.skillB === skillId);
  }

  resolveDependencies(skillIds: string[], availableSkills: Map<string, Skill>): DependencyResolution {
    const resolved = new Set<string>();
    const missing: string[] = [];
    const conflictPairs: Array<{ skillA: string; skillB: string }> = [];
    const toProcess = [...skillIds];

    while (toProcess.length > 0) {
      const currentId = toProcess.shift()!;
      if (resolved.has(currentId)) continue;

      const skill = availableSkills.get(currentId);
      if (!skill) {
        missing.push(currentId);
        continue;
      }

      // Check for conflicts
      const conflicts = this.getConflicts(currentId);
      for (const conflict of conflicts) {
        if (resolved.has(conflict.skillId)) {
          conflictPairs.push({ skillA: currentId, skillB: conflict.skillId });
        }
      }

      resolved.add(currentId);

      // Add dependencies to processing queue
      for (const depId of skill.dependencies) {
        if (depId.type !== 'conflicts' && !resolved.has(depId.skillId)) {
          if (availableSkills.has(depId.skillId)) {
            toProcess.push(depId.skillId);
          } else {
            missing.push(depId.skillId);
          }
        }
      }
    }

    return {
      success: conflictPairs.length === 0 && missing.length === 0,
      resolved: Array.from(resolved),
      missing,
      conflicts: conflictPairs,
    };
  }

  getDependencyChain(skillId: string): string[] {
    const chain: string[] = [];
    const visited = new Set<string>();

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const deps = this.getDependencies(id);
      for (const depId of deps) {
        traverse(depId);
        chain.push(depId);
      }
    };

    traverse(skillId);
    return chain;
  }

  getTopologicalOrder(skillIds: string[]): string[] | null {
    const inDegree = new Map<string, number>();
    const graph = new Map<string, string[]>();

    // Initialize
    for (const id of skillIds) {
      inDegree.set(id, 0);
      graph.set(id, []);
    }

    // Build graph
    for (const id of skillIds) {
      const deps = this.getDependencies(id);
      for (const depId of deps) {
        if (skillIds.includes(depId)) {
          graph.get(depId)!.push(id);
          inDegree.set(id, (inDegree.get(id) || 0) + 1);
        }
      }
    }

    // Kahn's algorithm
    const queue: string[] = [];
    for (const [id, degree] of inDegree) {
      if (degree === 0) queue.push(id);
    }

    const result: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      for (const neighbor of graph.get(current) || []) {
        const newDegree = (inDegree.get(neighbor) || 1) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) queue.push(neighbor);
      }
    }

    // Check for cycles
    if (result.length !== skillIds.length) {
      return null; // Cycle detected
    }

    return result;
  }

  getGraph(): DependencyGraphData {
    return {
      nodes: new Map(this.graphNodes),
      conflicts: [...this.graphConflicts],
    };
  }

  clear(): void {
    this.graphNodes.clear();
    this.graphConflicts = [];
  }

  setSkillAccessor(accessor: (id: string) => Skill | undefined): void {
    this.getSkillById = accessor;
  }
}
