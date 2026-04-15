export class DependencyGraph {
    graphNodes = new Map();
    graphConflicts = [];
    getSkillById;
    addSkill(skill) {
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
    removeSkill(skillId) {
        this.graphNodes.delete(skillId);
        // Remove from dependents lists
        for (const node of this.graphNodes.values()) {
            node.dependents = node.dependents.filter(id => id !== skillId);
            node.dependencies = node.dependencies.filter(id => id !== skillId);
        }
        // Remove related conflicts
        this.graphConflicts = this.graphConflicts.filter(c => c.skillA !== skillId && c.skillB !== skillId);
    }
    addConflict(skillA, skillB, reason) {
        // Avoid duplicates
        const exists = this.graphConflicts.some(c => (c.skillA === skillA && c.skillB === skillB) ||
            (c.skillA === skillB && c.skillB === skillA));
        if (!exists) {
            this.graphConflicts.push({ skillA, skillB, reason });
        }
    }
    findDependents(skillId) {
        const dependents = [];
        for (const [id, node] of this.graphNodes) {
            if (node.dependencies.includes(skillId)) {
                dependents.push(id);
            }
        }
        return dependents;
    }
    detectConflicts(skill) {
        // Check if skill conflicts with any existing skills
        for (const existingId of this.graphNodes.keys()) {
            const existing = this.graphNodes.get(existingId);
            if (!existing)
                continue;
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
    getDependencies(skillId) {
        const node = this.graphNodes.get(skillId);
        return node?.dependencies || [];
    }
    getDependents(skillId) {
        const node = this.graphNodes.get(skillId);
        return node?.dependents || [];
    }
    getConflicts(skillId) {
        return this.graphConflicts
            .filter(c => c.skillA === skillId || c.skillB === skillId)
            .map(c => ({
            skillId: c.skillA === skillId ? c.skillB : c.skillA,
            reason: c.reason,
        }));
    }
    hasConflicts(skillId) {
        return this.graphConflicts.some(c => c.skillA === skillId || c.skillB === skillId);
    }
    resolveDependencies(skillIds, availableSkills) {
        const resolved = new Set();
        const missing = [];
        const conflictPairs = [];
        const toProcess = [...skillIds];
        while (toProcess.length > 0) {
            const currentId = toProcess.shift();
            if (resolved.has(currentId))
                continue;
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
                    }
                    else {
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
    getDependencyChain(skillId) {
        const chain = [];
        const visited = new Set();
        const traverse = (id) => {
            if (visited.has(id))
                return;
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
    getTopologicalOrder(skillIds) {
        const inDegree = new Map();
        const graph = new Map();
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
                    graph.get(depId).push(id);
                    inDegree.set(id, (inDegree.get(id) || 0) + 1);
                }
            }
        }
        // Kahn's algorithm
        const queue = [];
        for (const [id, degree] of inDegree) {
            if (degree === 0)
                queue.push(id);
        }
        const result = [];
        while (queue.length > 0) {
            const current = queue.shift();
            result.push(current);
            for (const neighbor of graph.get(current) || []) {
                const newDegree = (inDegree.get(neighbor) || 1) - 1;
                inDegree.set(neighbor, newDegree);
                if (newDegree === 0)
                    queue.push(neighbor);
            }
        }
        // Check for cycles
        if (result.length !== skillIds.length) {
            return null; // Cycle detected
        }
        return result;
    }
    getGraph() {
        return {
            nodes: new Map(this.graphNodes),
            conflicts: [...this.graphConflicts],
        };
    }
    clear() {
        this.graphNodes.clear();
        this.graphConflicts = [];
    }
    setSkillAccessor(accessor) {
        this.getSkillById = accessor;
    }
}
//# sourceMappingURL=dependency-graph.js.map