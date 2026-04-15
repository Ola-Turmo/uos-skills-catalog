import type { Skill, SkillVersion } from './types';
export interface VersionDiff {
    fromVersion: string;
    toVersion: string;
    changes: string[];
    breaking: boolean;
}
export interface RollbackResult {
    success: boolean;
    skill?: Skill;
    error?: string;
}
export declare class VersionManager {
    private semverRegex;
    parseVersion(version: string): {
        major: number;
        minor: number;
        patch: number;
        prerelease?: string;
    } | null;
    compareVersions(a: string, b: string): number;
    incrementMajor(version: string): string | null;
    incrementMinor(version: string): string | null;
    incrementPatch(version: string): string | null;
    createVersionEntry(skill: Skill, changelog?: string): SkillVersion;
    addVersion(skill: Skill, changelog?: string): Skill;
    getVersionHistory(skill: Skill): SkillVersion[];
    getVersion(skill: Skill, version: string): SkillVersion | undefined;
    computeDiff(fromVersion: string, toVersion: string, fromContent?: string, toContent?: string): VersionDiff;
    rollback(skill: Skill, targetVersion: string): RollbackResult;
    detectBreakingChanges(skill: Skill): boolean;
}
//# sourceMappingURL=version-manager.d.ts.map