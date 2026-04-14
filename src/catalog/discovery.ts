import type { DiscoveredSkill } from './types';

export interface DiscoverySource {
  type: 'github' | 'marketplace' | 'codebase' | 'workflow';
  url?: string;
}

export interface DiscoveryOptions {
  sources?: DiscoverySource[];
  maxResults?: number;
  minConfidence?: number;
}

export interface DiscoveryResult {
  discovered: DiscoveredSkill[];
  errors: Array<{ source: string; error: string }>;
}

export class DiscoveryEngine {
  private sources: DiscoverySource[] = [];
  private maxResults: number = 10;
  private minConfidence: number = 0.3;

  configure(options: DiscoveryOptions): void {
    if (options.sources) {
      this.sources = options.sources;
    }
    if (options.maxResults) {
      this.maxResults = options.maxResults;
    }
    if (options.minConfidence !== undefined) {
      this.minConfidence = options.minConfidence;
    }
  }

  async discover(options?: DiscoveryOptions): Promise<DiscoveryResult> {
    const config = { ...{ sources: this.sources, maxResults: this.maxResults, minConfidence: this.minConfidence }, ...options };
    const discovered: DiscoveredSkill[] = [];
    const errors: Array<{ source: string; error: string }> = [];

    for (const source of config.sources || []) {
      try {
        const results = await this.discoverFromSource(source);
        discovered.push(...results);
      } catch (error) {
        errors.push({
          source: source.type,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Filter by confidence and limit results
    const filtered = discovered
      .filter(s => s.confidence >= this.minConfidence)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, config.maxResults);

    return { discovered: filtered, errors };
  }

  private async discoverFromSource(source: DiscoverySource): Promise<DiscoveredSkill[]> {
    switch (source.type) {
      case 'github':
        return this.discoverFromGitHub(source.url);
      case 'marketplace':
        return this.discoverFromMarketplace(source.url);
      case 'codebase':
        return this.discoverFromCodebase(source.url);
      case 'workflow':
        return this.discoverFromWorkflow(source.url);
      default:
        return [];
    }
  }

  private async discoverFromGitHub(url?: string): Promise<DiscoveredSkill[]> {
    // GitHub discovery - parse repos for skill patterns
    const discovered: DiscoveredSkill[] = [];

    if (url) {
      // Extract owner/repo from GitHub URL
      const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (match) {
        const [, owner, repo] = match;
        // Placeholder for GitHub API integration
        discovered.push({
          name: `${owner}/${repo}`,
          description: `Discovered from GitHub repository ${owner}/${repo}`,
          source: 'github',
          sourceUrl: url,
          confidence: 0.7,
          suggestedDependencies: [],
        });
      }
    } else {
      // Scan common locations for skill patterns
      discovered.push({
        name: 'example-github-skill',
        description: 'A skill discovered from GitHub patterns',
        source: 'github',
        confidence: 0.5,
        suggestedDependencies: [],
      });
    }

    return discovered;
  }

  private async discoverFromMarketplace(url?: string): Promise<DiscoveredSkill[]> {
    // Marketplace discovery
    const discovered: DiscoveredSkill[] = [];

    if (url) {
      discovered.push({
        name: 'marketplace-skill',
        description: 'Discovered from marketplace',
        source: 'marketplace',
        sourceUrl: url,
        confidence: 0.8,
        suggestedDependencies: [],
      });
    } else {
      // Default marketplace skills
      discovered.push({
        name: 'web-search-skill',
        description: 'Web search capability for finding information',
        source: 'marketplace',
        confidence: 0.9,
        suggestedDependencies: [],
      }, {
        name: 'code-analysis-skill',
        description: 'Analyze code structure and patterns',
        source: 'marketplace',
        confidence: 0.85,
        suggestedDependencies: [],
      });
    }

    return discovered;
  }

  private async discoverFromCodebase(basePath?: string): Promise<DiscoveredSkill[]> {
    // Codebase pattern discovery
    const discovered: DiscoveredSkill[] = [];
    const skillPatterns = [
      { pattern: /@skill\(['"]([^'"]+)['"]\)/g, extractor: (match: RegExpMatchArray) => match[1] },
      { pattern: /skill:\s*['"]([^'"]+)['"]/g, extractor: (match: RegExpMatchArray) => match[1] },
      { pattern: /class\s+(\w+Skill)\s+/g, extractor: (match: RegExpMatchArray) => match[1] },
    ];

    // Common skill indicators in code
    const indicators = ['handleSkill', 'executeSkill', 'skillHandler', 'onSkill'];

    discovered.push({
      name: 'codebase-pattern-skill',
      description: 'A skill pattern discovered from codebase analysis',
      source: 'codebase',
      sourceUrl: basePath,
      confidence: 0.6,
      suggestedDependencies: [],
    });

    return discovered;
  }

  private async discoverFromWorkflow(workflowData?: string): Promise<DiscoveredSkill[]> {
    // Workflow gap analysis for skill suggestions
    const discovered: DiscoveredSkill[] = [];

    // Analyze common workflow gaps and suggest skills
    const commonGaps = [
      { gap: 'no-file-operations', skill: 'file-operations-skill', confidence: 0.8 },
      { gap: 'no-api-calls', skill: 'api-integration-skill', confidence: 0.75 },
      { gap: 'no-data-processing', skill: 'data-processing-skill', confidence: 0.7 },
    ];

    for (const { gap, skill, confidence } of commonGaps) {
      discovered.push({
        name: skill,
        description: `Skill suggested based on workflow gap: ${gap}`,
        source: 'workflow',
        confidence,
        suggestedDependencies: [],
      });
    }

    return discovered;
  }

  analyzeSkillGaps(currentSkills: string[], requiredCapabilities: string[]): string[] {
    // Find missing skills based on required capabilities
    const currentSet = new Set(currentSkills.map(s => s.toLowerCase()));
    const gaps: string[] = [];

    for (const capability of requiredCapabilities) {
      const capabilityLower = capability.toLowerCase();
      const hasCapability = currentSet.has(capabilityLower) ||
        currentSkills.some(s => s.toLowerCase().includes(capabilityLower));

      if (!hasCapability) {
        gaps.push(this.suggestSkillForCapability(capability));
      }
    }

    return gaps;
  }

  private suggestSkillForCapability(capability: string): string {
    const capabilityMap: Record<string, string> = {
      'search': 'web-search-skill',
      'analyze': 'code-analysis-skill',
      'file': 'file-operations-skill',
      'api': 'api-integration-skill',
      'data': 'data-processing-skill',
      'transform': 'data-transform-skill',
      'validate': 'validation-skill',
      'parse': 'parsing-skill',
    };

    const capabilityLower = capability.toLowerCase();
    for (const [key, skill] of Object.entries(capabilityMap)) {
      if (capabilityLower.includes(key)) {
        return skill;
      }
    }

    return `${capability}-skill`;
  }

  suggestSkillChains(baseSkillId: string, availableSkills: string[]): string[][] {
    // Suggest chains of skills that could be used together
    const chains: string[][] = [];
    const baseChain = [baseSkillId];

    const findRelated = (skillId: string): string[] => {
      const related: string[] = [];
      for (const avail of availableSkills) {
        if (avail !== skillId && !baseChain.includes(avail)) {
          // Simple heuristic: skills with similar names or tags might chain well
          if (avail.includes(skillId.split('-')[0]) || skillId.includes(avail.split('-')[0])) {
            related.push(avail);
          }
        }
      }
      return related;
    };

    const related = findRelated(baseSkillId);
    for (const rel of related.slice(0, 3)) {
      chains.push([baseSkillId, rel]);
    }

    return chains;
  }

  rankByCompatibility(skills: DiscoveredSkill[], installedSkills: string[]): DiscoveredSkill[] {
    const installedSet = new Set(installedSkills);

    return skills.map(skill => {
      let compatibility = skill.confidence;

      // Boost if suggested dependencies are already installed
      for (const dep of skill.suggestedDependencies) {
        if (installedSet.has(dep)) {
          compatibility += 0.1;
        }
      }

      // Slight boost for marketplace sources (usually more vetted)
      if (skill.source === 'marketplace') {
        compatibility += 0.05;
      }

      return { ...skill, confidence: Math.min(1, compatibility) };
    }).sort((a, b) => b.confidence - a.confidence);
  }
}
