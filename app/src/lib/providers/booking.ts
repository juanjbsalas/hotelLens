import { Hotel } from '@/types';
import { HotelProvider, parseMinAgeFromText } from './base';
import { BOOKING } from '@/lib/config';
import { haversineKm } from '@/lib/geo';
import { searchBookingByCoords, cachedScrapePolicy } from '@/lib/scraper';
import { SCRAPING_ENABLED, SCRAPING_PROVIDER_OVERRIDES } from '@/lib/config';


export const BookingProvider: HotelProvider = {
    name: 'booking',
    async searchNearby({ lat, lng, radiusKm = 20, limit = 50 }) {
        // Use the scraper search to find nearby properties, then enrich with scraped policy text.
    const providerScrapingEnabled = SCRAPING_PROVIDER_OVERRIDES.booking ?? SCRAPING_ENABLED;
    if (!providerScrapingEnabled) return [];

    const props = await searchBookingByCoords(lat, lng, radiusKm, limit);
        const hotels: Hotel[] = await Promise.all(props.map(async p => {
            const policyText = p.url ? await cachedScrapePolicy(p.url) : null;
            const parsedAge = parseMinAgeFromText(policyText || undefined);
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
                source: 'booking'
            };
        }));

        return hotels
            .filter(h => h.distanceKm! <= radiusKm)
            .sort((a, b) => (a.distanceKm! - b.distanceKm!))
            .slice(0, limit);
    }
};