import { Hotel } from '@/types';
import { HotelProvider, parseMinAgeFromText } from './base';
import { EXPEDIA } from '@/lib/config';
import { haversineKm } from '@/lib/geo';
import { searchExpediaByCoords, cachedScrapePolicy, scrapeImageUrlsFromUrl } from '@/lib/scraper';
import { SCRAPING_ENABLED, SCRAPING_PROVIDER_OVERRIDES } from '@/lib/config';


// NOTE: This is a skeleton—wire to the actual Rapid APIs you have access to.
// Typical flow: use the Properties + Content endpoints; min-age often in check-in instructions.


export const ExpediaProvider: HotelProvider = {
    name: 'expedia',
    async searchNearby({ lat, lng, radiusKm = 20, limit = 50 }) {
    const providerScrapingEnabled = SCRAPING_PROVIDER_OVERRIDES.expedia ?? SCRAPING_ENABLED;
    if (!providerScrapingEnabled) return [];

    const props = await searchExpediaByCoords(lat, lng, radiusKm, limit);
        const hotels: Hotel[] = await Promise.all(props.map(async p => {
            const policyText = p.url ? await cachedScrapePolicy(p.url) : null;
            const parsedAge = parseMinAgeFromText(policyText || undefined);
            // Attempt to fetch images for the property; ignore failures.
            let images: string[] = [];
            if (p.url) {
                try {
                    images = await scrapeImageUrlsFromUrl(p.url);
                } catch {
                    images = [];
                }
            }
            return {
                id: p.id,
                name: p.name,
                lat: p.lat ?? lat,
                lng: p.lng ?? lng,
                address: p.address,
                rating: undefined,
                price: undefined,
                url: p.url,
                distanceKm: haversineKm({ lat, lng }, { lat: p.lat ?? lat, lng: p.lng ?? lng }),
                minCheckInAge: parsedAge,
                policyText: policyText ?? null,
                confidence: parsedAge != null ? 'parsed' : 'unknown',
                source: 'expedia',
                thumbnailUrl: images.length > 0 ? images[0] : undefined,
                photos: images
            };
        }));

        return hotels
            .filter(h => h.distanceKm! <= radiusKm)
            .sort((a, b) => (a.distanceKm! - b.distanceKm!))
            .slice(0, limit);
    }
};