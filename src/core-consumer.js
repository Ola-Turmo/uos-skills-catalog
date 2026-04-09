"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveExternalSkillImportsFromCatalog = resolveExternalSkillImportsFromCatalog;
const extraction_1 = require("./catalog/extraction");
function resolveExternalSkillImportsFromCatalog(skills, sourceRepo = "uos-core") {
    const extracted = (0, extraction_1.extractFromExternalSkills)(skills, sourceRepo, {
        sourceRef: "catalog-consumer",
        defaultLifecycleState: "stable",
        defaultOwnerTeam: "platform",
    });
    return extracted
        .filter((result) => result.status === "extracted" && Boolean(result.metadata))
        .map((result) => {
        const source = skills.find((skill) => skill.id === result.originalId);
        if (!source) {
            throw new Error(`Missing source definition for extracted skill ${result.originalId}`);
        }
        return {
            id: source.id,
            sourceRelativePath: source.sourceRelativePath,
            roleKeys: [...source.roleKeys],
            companySlugs: source.companySlugs ? [...source.companySlugs] : undefined,
            catalogId: result.catalogId,
            catalogLineage: {
                sourceRepo: result.metadata.lineage.sourceRepo,
                sourcePath: result.metadata.lineage.sourcePath,
                originalId: result.metadata.lineage.originalId,
            },
            catalogTags: [...result.metadata.tags],
            catalogCategories: [...result.metadata.categories],
        };
    });
}
//# sourceMappingURL=core-consumer.js.map