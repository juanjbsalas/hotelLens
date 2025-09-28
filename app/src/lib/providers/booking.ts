import { Hotel } from '@/types';
import { HotelProvider, parseMinAgeFromText } from './base';
import { BOOKING } from '@/lib/config';
import { haversineKm } from '@/lib/geo';
import { searchBookingByCoords, cachedScrapePolicy, scrapeImageUrlsFromUrl } from '@/lib/scraper';
import { SCRAPING_ENABLED, SCRAPING_PROVIDER_OVERRIDES } from '@/lib/config';


export const BookingProvider: HotelProvider = {
    name: 'booking',
    async searchNearby({ lat, lng, radiusKm = 20, limit = 50 }) {
        // Use the scraper search to find nearby properties, then enrich with scraped policy text.
    const providerScrapingEnabled = SCRAPING_PROVIDER_OVERRIDES.booking ?? SCRAPING_ENABLED;
    if (!providerScrapingEnabled) return [];
    let props = [] as any[];
    try {
        props = await searchBookingByCoords(lat, lng, radiusKm, limit);
        // write a quick debug summary to disk
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const fs = require('fs');
            const path = require('path');
            const debugDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
            const file = path.join(debugDir, `booking-search-${Date.now()}.json`);
            const summary = { lat, lng, radiusKm, found: props.length, ids: props.slice(0,10).map(p=>p.id) };
            fs.writeFileSync(file, JSON.stringify(summary, null, 2), 'utf8');
        } catch (e) { /* ignore */ }
    } catch (err) {
        try {
            const fs = require('fs');
            const path = require('path');
            const debugDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
            const file = path.join(debugDir, `booking-search-error-${Date.now()}.log`);
            const eany: any = err;
            const text = typeof err === 'string' ? err : (eany && eany.stack) ? eany.stack : JSON.stringify(err);
            fs.writeFileSync(file, text, 'utf8');
        } catch (e) { /* ignore */ }
        throw err;
    }
        const hotels: Hotel[] = await Promise.all(props.map(async p => {
            const policyText = p.url ? await cachedScrapePolicy(p.url) : null;
            const parsedAge = parseMinAgeFromText(policyText || undefined);
            // Attempt to fetch images for the property. In case of network failures or parsing
            // errors, fall back to an empty array.
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
                source: 'booking',
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