export class VersionManager {
    semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?$/;
    parseVersion(version) {
        const match = version.match(this.semverRegex);
        if (!match)
            return null;
        return {
            major: parseInt(match[1], 10),
            minor: parseInt(match[2], 10),
            patch: parseInt(match[3], 10),
            prerelease: match[4],
        };
    }
    compareVersions(a, b) {
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
        if (versionA.prerelease && !versionB.prerelease)
            return -1;
        if (!versionA.prerelease && versionB.prerelease)
            return 1;
        if (versionA.prerelease && versionB.prerelease) {
            return versionA.prerelease.localeCompare(versionB.prerelease);
        }
        return 0;
    }
    incrementMajor(version) {
        const parsed = this.parseVersion(version);
        if (!parsed)
            return null;
        return `${parsed.major + 1}.0.0`;
    }
    incrementMinor(version) {
        const parsed = this.parseVersion(version);
        if (!parsed)
            return null;
        return `${parsed.major}.${parsed.minor + 1}.0`;
    }
    incrementPatch(version) {
        const parsed = this.parseVersion(version);
        if (!parsed)
            return null;
        return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    }
    createVersionEntry(skill, changelog) {
        return {
            version: skill.version,
            createdAt: new Date().toISOString(),
            changelog,
            author: skill.author,
        };
    }
    addVersion(skill, changelog) {
        const versionEntry = this.createVersionEntry(skill, changelog);
        return {
            ...skill,
            versions: [...skill.versions, versionEntry],
            updatedAt: new Date().toISOString(),
        };
    }
    getVersionHistory(skill) {
        return [...skill.versions].sort((a, b) => this.compareVersions(b.version, a.version));
    }
    getVersion(skill, version) {
        return skill.versions.find(v => v.version === version);
    }
    computeDiff(fromVersion, toVersion, fromContent, toContent) {
        const fromParsed = this.parseVersion(fromVersion);
        const toParsed = this.parseVersion(toVersion);
        const changes = [];
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
    rollback(skill, targetVersion) {
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
        const rolledBackSkill = {
            ...skill,
            version: targetVersion,
            updatedAt: new Date().toISOString(),
        };
        return {
            success: true,
            skill: rolledBackSkill,
        };
    }
    detectBreakingChanges(skill) {
        if (skill.versions.length < 2)
            return false;
        const sorted = this.getVersionHistory(skill);
        const latest = sorted[0];
        const previous = sorted[1];
        if (!latest || !previous)
            return false;
        const diff = this.computeDiff(previous.version, latest.version);
        return diff.breaking;
    }
}
//# sourceMappingURL=version-manager.js.map