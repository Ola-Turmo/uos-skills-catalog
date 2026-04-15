export class Marketplace {
    listings = new Map();
    ratings = new Map();
    bundles = new Map();
    reviewsBySkill = new Map();
    addListing(skill, isPublic = false) {
        const now = new Date().toISOString();
        const listing = {
            skill,
            rating: 0,
            reviewCount: 0,
            installCount: 0,
            isPublic,
            createdAt: now,
            updatedAt: now,
        };
        this.listings.set(skill.id, listing);
        return listing;
    }
    removeListing(skillId) {
        return this.listings.delete(skillId);
    }
    getListing(skillId) {
        return this.listings.get(skillId);
    }
    getPublicListings(category) {
        const all = Array.from(this.listings.values()).filter(l => l.isPublic);
        if (category) {
            return all.filter(l => l.skill.category === category);
        }
        return all;
    }
    setPublic(skillId, isPublic) {
        const listing = this.listings.get(skillId);
        if (!listing)
            return false;
        listing.isPublic = isPublic;
        listing.updatedAt = new Date().toISOString();
        return true;
    }
    recordInstall(skillId) {
        const listing = this.listings.get(skillId);
        if (!listing)
            return false;
        listing.installCount++;
        listing.updatedAt = new Date().toISOString();
        return true;
    }
    addReview(review) {
        this.ratings.set(review.id, review);
        const skillReviews = this.reviewsBySkill.get(review.skillId) || [];
        skillReviews.push(review.id);
        this.reviewsBySkill.set(review.skillId, skillReviews);
        this.updateListingRating(review.skillId);
    }
    updateListingRating(skillId) {
        const listing = this.listings.get(skillId);
        if (!listing)
            return;
        const skillReviews = (this.reviewsBySkill.get(skillId) || [])
            .map(id => this.ratings.get(id))
            .filter((r) => r !== undefined);
        if (skillReviews.length === 0) {
            listing.rating = 0;
            listing.reviewCount = 0;
        }
        else {
            const total = skillReviews.reduce((sum, r) => sum + r.rating, 0);
            listing.rating = Math.round((total / skillReviews.length) * 10) / 10;
            listing.reviewCount = skillReviews.length;
        }
        listing.updatedAt = new Date().toISOString();
    }
    getReviews(skillId) {
        return (this.reviewsBySkill.get(skillId) || [])
            .map(id => this.ratings.get(id))
            .filter((r) => r !== undefined)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    getReviewStats(skillId) {
        const reviews = this.getReviews(skillId);
        if (reviews.length === 0) {
            return {
                avgRating: 0,
                totalReviews: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            };
        }
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const review of reviews) {
            distribution[review.rating] = (distribution[review.rating] || 0) + 1;
        }
        return {
            avgRating: Math.round((total / reviews.length) * 10) / 10,
            totalReviews: reviews.length,
            ratingDistribution: distribution,
        };
    }
    createBundle(data) {
        const now = new Date().toISOString();
        const bundle = {
            ...data,
            id: `bundle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: now,
            updatedAt: now,
        };
        this.bundles.set(bundle.id, bundle);
        return bundle;
    }
    getBundle(bundleId) {
        return this.bundles.get(bundleId);
    }
    getBundles(category) {
        const all = Array.from(this.bundles.values());
        if (category) {
            return all.filter(b => b.category === category);
        }
        return all;
    }
    updateBundle(bundleId, data) {
        const existing = this.bundles.get(bundleId);
        if (!existing)
            return null;
        const updated = {
            ...existing,
            ...data,
            id: existing.id,
            createdAt: existing.createdAt,
            updatedAt: new Date().toISOString(),
        };
        this.bundles.set(bundleId, updated);
        return updated;
    }
    deleteBundle(bundleId) {
        return this.bundles.delete(bundleId);
    }
    addSkillToBundle(bundleId, skillId) {
        const bundle = this.bundles.get(bundleId);
        if (!bundle)
            return null;
        if (bundle.skillIds.includes(skillId))
            return bundle;
        return this.updateBundle(bundleId, {
            skillIds: [...bundle.skillIds, skillId],
        });
    }
    removeSkillFromBundle(bundleId, skillId) {
        const bundle = this.bundles.get(bundleId);
        if (!bundle)
            return null;
        return this.updateBundle(bundleId, {
            skillIds: bundle.skillIds.filter(id => id !== skillId),
        });
    }
    getStats() {
        const listings = Array.from(this.listings.values());
        const totalInstalls = listings.reduce((sum, l) => sum + l.installCount, 0);
        const ratedListings = listings.filter(l => l.rating > 0);
        const avgRating = ratedListings.length > 0
            ? Math.round((ratedListings.reduce((sum, l) => sum + l.rating, 0) / ratedListings.length) * 10) / 10
            : 0;
        // Count by category
        const categoryCounts = {};
        for (const listing of listings) {
            const cat = listing.skill.category || 'uncategorized';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }
        const topCategories = Object.entries(categoryCounts)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        return {
            totalListings: listings.length,
            totalInstalls,
            avgRating,
            topCategories,
        };
    }
    search(query, category) {
        const queryLower = query.toLowerCase();
        const all = this.getPublicListings(category);
        return all.filter(listing => {
            const skill = listing.skill;
            const matchesName = skill.name.toLowerCase().includes(queryLower);
            const matchesDesc = skill.description.toLowerCase().includes(queryLower);
            const matchesTags = skill.tags.some(t => t.toLowerCase().includes(queryLower));
            return matchesName || matchesDesc || matchesTags;
        }).sort((a, b) => b.rating - a.rating);
    }
    getTopRated(limit = 10) {
        return this.getPublicListings()
            .filter(l => l.reviewCount > 0)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    }
    getMostInstalled(limit = 10) {
        return this.getPublicListings()
            .sort((a, b) => b.installCount - a.installCount)
            .slice(0, limit);
    }
    // Import skills from discovery
    importFromDiscovery(discovered) {
        const now = new Date().toISOString();
        const skill = {
            id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: discovered.name,
            description: discovered.description,
            version: '1.0.0',
            author: 'discovered',
            tags: [discovered.source],
            dependencies: discovered.suggestedDependencies.map(id => ({ skillId: id, type: 'required' })),
            versions: [{
                    version: '1.0.0',
                    createdAt: now,
                    changelog: 'Initial version from discovery',
                }],
            metrics: {
                usageCount: 0,
                successRate: 1,
                avgLatencyMs: 0,
                errorCount: 0,
            },
            health: {
                score: 50,
                isDeprecated: false,
                isDecaying: false,
                lastHealthCheck: now,
            },
            createdAt: now,
            updatedAt: now,
            metadata: {
                source: discovered.source,
                sourceUrl: discovered.sourceUrl,
                confidence: discovered.confidence,
            },
        };
        this.addListing(skill);
        return skill;
    }
    toJSON() {
        return JSON.stringify({
            listings: Array.from(this.listings.entries()),
            ratings: Array.from(this.ratings.entries()),
            bundles: Array.from(this.bundles.entries()),
            exportedAt: new Date().toISOString(),
        });
    }
    static fromJSON(json) {
        const data = JSON.parse(json);
        const marketplace = new Marketplace();
        for (const [id, listing] of data.listings) {
            marketplace.listings.set(id, listing);
        }
        for (const [id, rating] of data.ratings) {
            marketplace.ratings.set(id, rating);
        }
        for (const [id, bundle] of data.bundles) {
            marketplace.bundles.set(id, bundle);
        }
        return marketplace;
    }
}
//# sourceMappingURL=marketplace.js.map