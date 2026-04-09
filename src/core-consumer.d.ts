import type { ExternalSkillImport } from "../../uos-core/src/domain";
import { type ExternalSkillDef } from "./catalog/extraction";
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
export declare function resolveExternalSkillImportsFromCatalog(skills: ExternalSkillDef[], sourceRepo?: string): CatalogResolvedExternalSkill[];
