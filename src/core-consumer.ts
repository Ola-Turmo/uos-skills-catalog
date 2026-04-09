import type { ExternalSkillImport } from "../../uos-core/src/domain";
import { extractFromExternalSkills, type ExternalSkillDef } from "./catalog/extraction";

export interface CatalogResolvedExternalSkill extends ExternalSkillImport {
  catalogId: string;
  catalogLineage: {
    sourceRepo: string;
    sourcePath: string;
    originalId?: string;
  };
  catalogTags: string[];
  catalogCategories: string[];
}

export function resolveExternalSkillImportsFromCatalog(
  skills: ExternalSkillDef[],
  sourceRepo = "uos-core",
): CatalogResolvedExternalSkill[] {
  const extracted = extractFromExternalSkills(skills, sourceRepo, {
    sourceRef: "catalog-consumer",
    defaultLifecycleState: "stable",
    defaultOwnerTeam: "platform",
  });

  return extracted
    .filter((result): result is typeof result & { metadata: NonNullable<typeof result.metadata> } => result.status === "extracted" && Boolean(result.metadata))
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
