import type { Skill, SkillRating, SkillBundle, DiscoveredSkill } from './types';
export interface MarketplaceListing {
    skill: Skill;
    rating: number;
    reviewCount: number;
    installCount: number;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface MarketplaceStats {
    totalListings: number;
    totalInstalls: number;
    avgRating: number;
    topCategories: Array<{
        category: string;
        count: number;
    }>;
}
export interface ReviewStats {
    avgRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
}
export declare class Marketplace {
    private listings;
    private ratings;
    private bundles;
    private reviewsBySkill;
    addListing(skill: Skill, isPublic?: boolean): MarketplaceListing;
    removeListing(skillId: string): boolean;
    getListing(skillId: string): MarketplaceListing | undefined;
    getPublicListings(category?: string): MarketplaceListing[];
    setPublic(skillId: string, isPublic: boolean): boolean;
    recordInstall(skillId: string): boolean;
    addReview(review: SkillRating): void;
    private updateListingRating;
    getReviews(skillId: string): SkillRating[];
    getReviewStats(skillId: string): ReviewStats;
    createBundle(data: Omit<SkillBundle, 'id' | 'createdAt' | 'updatedAt'>): SkillBundle;
    getBundle(bundleId: string): SkillBundle | undefined;
    getBundles(category?: string): SkillBundle[];
    updateBundle(bundleId: string, data: Partial<SkillBundle>): SkillBundle | null;
    deleteBundle(bundleId: string): boolean;
    addSkillToBundle(bundleId: string, skillId: string): SkillBundle | null;
    removeSkillFromBundle(bundleId: string, skillId: string): SkillBundle | null;
    getStats(): MarketplaceStats;
    search(query: string, category?: string): MarketplaceListing[];
    getTopRated(limit?: number): MarketplaceListing[];
    getMostInstalled(limit?: number): MarketplaceListing[];
    importFromDiscovery(discovered: DiscoveredSkill): Skill;
    toJSON(): string;
    static fromJSON(json: string): Marketplace;
}
//# sourceMappingURL=marketplace.d.ts.map