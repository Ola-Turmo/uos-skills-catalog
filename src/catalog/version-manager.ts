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

export class VersionManager {
  private semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?$/;

  parseVersion(version: string): { major: number; minor: number; patch: number; prerelease?: string } | null {
    const match = version.match(this.semverRegex);
    if (!match) return null;
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4],
    };
  }

  compareVersions(a: string, b: string): number {
    const versionA = this.parseVersion(a);
    const versionB = this.parseVersion(b);

    if (!versionA || !versionB) {
      return a.localeCompare(b);
    }

    if (versionA.major !== versionB.major) {
      return versionA.major - versionB.major;
    }
    if (versionA.minor !== versionB.minor) {
      return versionA.minor - versionB.minor;
    }
    if (versionA.patch !== versionB.patch) {
      return versionA.patch - versionB.patch;
    }

    // Prerelease sort
    if (versionA.prerelease && !versionB.prerelease) return -1;
    if (!versionA.prerelease && versionB.prerelease) return 1;
    if (versionA.prerelease && versionB.prerelease) {
      return versionA.prerelease.localeCompare(versionB.prerelease);
    }

    return 0;
  }

  incrementMajor(version: string): string | null {
    const parsed = this.parseVersion(version);
    if (!parsed) return null;
    return `${parsed.major + 1}.0.0`;
  }

  incrementMinor(version: string): string | null {
    const parsed = this.parseVersion(version);
    if (!parsed) return null;
    return `${parsed.major}.${parsed.minor + 1}.0`;
  }

  incrementPatch(version: string): string | null {
    const parsed = this.parseVersion(version);
    if (!parsed) return null;
    return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
  }

  createVersionEntry(skill: Skill, changelog?: string): SkillVersion {
    return {
      version: skill.version,
      createdAt: new Date().toISOString(),
      changelog,
      author: skill.author,
    };
  }

  addVersion(skill: Skill, changelog?: string): Skill {
    const versionEntry = this.createVersionEntry(skill, changelog);
    return {
      ...skill,
      versions: [...skill.versions, versionEntry],
      updatedAt: new Date().toISOString(),
    };
  }

  getVersionHistory(skill: Skill): SkillVersion[] {
    return [...skill.versions].sort((a, b) =>
      this.compareVersions(b.version, a.version)
    );
  }

  getVersion(skill: Skill, version: string): SkillVersion | undefined {
    return skill.versions.find(v => v.version === version);
  }

  computeDiff(fromVersion: string, toVersion: string, fromContent?: string, toContent?: string): VersionDiff {
    const fromParsed = this.parseVersion(fromVersion);
    const toParsed = this.parseVersion(toVersion);

    const changes: string[] = [];
    let breaking = false;

    if (fromParsed && toParsed) {
      if (toParsed.major > fromParsed.major) {
        changes.push('Major version bump - breaking changes possible');
        breaking = true;
      }
      if (toParsed.minor > fromParsed.minor) {
        changes.push('Minor version bump - new features added');
      }
      if (toParsed.patch > fromParsed.patch) {
        changes.push('Patch version bump - bug fixes');
      }
      if (toParsed.major < fromParsed.major) {
        changes.push('Downgrade detected');
        breaking = true;
      }
    }

    if (!fromParsed || !toParsed) {
      changes.push(`Version changed from ${fromVersion} to ${toVersion}`);
    }

    return {
      fromVersion,
      toVersion,
      changes,
      breaking,
    };
  }

  rollback(skill: Skill, targetVersion: string): RollbackResult {
    const targetIndex = skill.versions.findIndex(v => v.version === targetVersion);
    if (targetIndex === -1) {
      return {
        success: false,
        error: `Version ${targetVersion} not found in history`,
      };
    }

    const currentVersion = skill.versions[skill.versions.length - 1];
    const diff = this.computeDiff(targetVersion, currentVersion?.version || '0.0.0');

    if (diff.breaking) {
      return {
        success: false,
        error: `Rolling back from ${currentVersion?.version} to ${targetVersion} may cause breaking changes`,
      };
    }

    const rolledBackSkill: Skill = {
      ...skill,
      version: targetVersion,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      skill: rolledBackSkill,
    };
  }

  detectBreakingChanges(skill: Skill): boolean {
    if (skill.versions.length < 2) return false;

    const sorted = this.getVersionHistory(skill);
    const latest = sorted[0];
    const previous = sorted[1];

    if (!latest || !previous) return false;

    const diff = this.computeDiff(previous.version, latest.version);
    return diff.breaking;
  }
}
