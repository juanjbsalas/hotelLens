// Use global fetch when available (Node 18+). Fall back to node-fetch only if needed.
let _fetch: typeof fetch | undefined = undefined as any;
if (typeof globalThis.fetch === 'function') {
    _fetch = globalThis.fetch;
} else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    _fetch = require('node-fetch');
}
const cheerio = require('cheerio');
type CheerioElement = any;

/**
 * Fetches the given url and returns text content.
 * Note: caller should handle timeouts/retries in production.
 */
export async function fetchHtml(url: string): Promise<string | null> {
    try {
        if (!_fetch) return null;
        const fn = _fetch as unknown as (input: string, init?: any) => Promise<any>;
        const res = await fn(url, { headers: { 'User-Agent': 'hotel-lens-scraper/1.0' } });
        if (!res || !res.ok) return null;
        return await res.text();
    } catch (e) {
        return null;
    }
}

/**
 * Attempts to extract likely check-in policy text (or surrounding text) from a hotel's page.
 * This is intentionally conservative: we return a chunk of text that can be passed to the
 * existing `parseMinAgeFromText` helper.
 */
export function extractPolicyTextFromHtml(html: string): string | null {
    try {
        const $ = cheerio.load(html);
        // common selectors where policy/check-in info may appear
        const selectors = [
            'section:contains("Policy")',
            'section:contains("Check-in")',
            'div:contains("Policy")',
            'div:contains("Check-in")',
            'p:contains("check in")',
            'p:contains("check-in")',
            'li:contains("check in")',
            'li:contains("check-in")'
        ];

        for (const sel of selectors) {
            const el = $(sel).first();
            if (el && el.text()) {
                const txt = el.text().trim();
                if (txt.length > 10) return txt;
            }
        }

        // fallback: return full body text truncated
        const body = $('body').text().replace(/\s+/g, ' ').trim();
        if (body.length > 50) return body.slice(0, 200);
        return null;
    } catch (e) {
        return null;
    }
}

export async function scrapePolicyTextFromUrl(url: string): Promise<string | null> {
    const html = await fetchHtml(url);
    if (!html) return null;
    return extractPolicyTextFromHtml(html);
}

// --- Domain-specific search scrapers -------------------------------------------------
import { LRU } from './lru';
import { URL } from 'url';

export interface PropertySummary {
    id: string;
    name: string;
    lat: number | null;
    lng: number | null;
    url: string;
    address?: string;
}

const searchCache = new LRU<string, PropertySummary[]>(200, 60_000 * 60); // 1h cache for search results
const policyCache = new LRU<string, string | null>(1000, 24 * 60 * 60_000); // 24h cache for policy text

const domainLastRequest: Record<string, number> = {};
const MIN_REQUEST_INTERVAL = 400; // ms between requests per domain

async function rateLimitFor(url: string) {
    try {
        const u = new URL(url);
        const host = u.hostname;
        const last = domainLastRequest[host] || 0;
        const delta = Date.now() - last;
        if (delta < MIN_REQUEST_INTERVAL) await new Promise(r => setTimeout(r, MIN_REQUEST_INTERVAL - delta));
        domainLastRequest[host] = Date.now();
    } catch (e) {
        // ignore
    }
}

function absoluteUrl(base: string, href: string) {
    try { return new URL(href, base).toString(); } catch (e) { return href; }
}

export async function searchBookingByCoords(lat: number, lng: number, radiusKm = 20, limit = 50): Promise<PropertySummary[]> {
    const key = `booking:${lat.toFixed(4)},${lng.toFixed(4)}:${radiusKm}:${limit}`;
    const hit = searchCache.get(key);
    if (hit) return hit;

    // Construct a Booking search URL. Booking's public search page accepts latitude/longitude.
    const url = `https://www.booking.com/searchresults.html?ss=&latitude=${lat}&longitude=${lng}&radius=${Math.round(radiusKm)}`;
    await rateLimitFor(url);
    const html = await fetchHtml(url);
    if (!html) return [];
    const $ = cheerio.load(html);

    const props: PropertySummary[] = [];
    // Heuristic: find links that look like property links (contain "/hotel/") or have data-testid
    $('a').each((i: number, el: CheerioElement) => {
        try {
            const href = $(el).attr('href');
            if (!href) return;
            // booking property links often contain "/hotel/" or "/hotel/us/"
            if (!/hotel\//i.test(href)) return;
            const name = $(el).text().trim() || $(el).attr('title') || '';
            if (!name) return;
            const full = absoluteUrl(url, href.split('?')[0]);
            // try to extract coords from parent data attributes
            const parent = $(el).closest('[data-coords], [data-latitude], [data-lat]');
            let plat: number | null = null; let plng: number | null = null;
            if (parent && parent.length) {
                const latAttr = parent.attr('data-lat') || parent.attr('data-latitude') || parent.attr('data-coords-lat');
                const lngAttr = parent.attr('data-lng') || parent.attr('data-longitude') || parent.attr('data-coords-lng');
                if (latAttr && lngAttr) { plat = parseFloat(latAttr); plng = parseFloat(lngAttr); }
            }
            // fallback: parse lat/lon from href query params if present
            if ((plat == null || plng == null) && href.includes('latitude=')) {
                try {
                    const q = new URL('https://booking.com' + href, 'https://booking.com');
                    const la = q.searchParams.get('latitude');
                    const ln = q.searchParams.get('longitude');
                    if (la && ln) { plat = parseFloat(la); plng = parseFloat(ln); }
                } catch (e) { /* ignore */ }
            }

            const id = full;
            props.push({ id, name, lat: plat, lng: plng, url: full });
        } catch (e) { /* ignore */ }
    });

    const uniq = props.filter((p, idx, arr) => arr.findIndex(x => x.id === p.id) === idx).slice(0, limit);
    searchCache.set(key, uniq);
    return uniq;
}

export async function searchExpediaByCoords(lat: number, lng: number, radiusKm = 20, limit = 50): Promise<PropertySummary[]> {
    const key = `expedia:${lat.toFixed(4)},${lng.toFixed(4)}:${radiusKm}:${limit}`;
    const hit = searchCache.get(key);
    if (hit) return hit;

    const url = `https://www.expedia.com/Hotel-Search?lat=${lat}&lng=${lng}&radius=${Math.round(radiusKm)}`;
    await rateLimitFor(url);
    const html = await fetchHtml(url);
    if (!html) return [];
    const $ = cheerio.load(html);

    const props: PropertySummary[] = [];
    // Heuristic: property links often contain "/Hotel_Review-" or "/Hotel-"
    $('a').each((i: number, el: CheerioElement) => {
        try {
            const href = $(el).attr('href');
            if (!href) return;
            if (!/(Hotel_Review|Hotel-)/i.test(href)) return;
            const name = $(el).text().trim() || $(el).attr('aria-label') || '';
            if (!name) return;
            const full = absoluteUrl(url, href.split('?')[0]);
            // try to find coords in parent data attributes
            const parent = $(el).closest('[data-latitude], [data-lat]');
            let plat: number | null = null; let plng: number | null = null;
            if (parent && parent.length) {
                const latAttr = parent.attr('data-lat') || parent.attr('data-latitude');
                const lngAttr = parent.attr('data-lng') || parent.attr('data-longitude');
                if (latAttr && lngAttr) { plat = parseFloat(latAttr); plng = parseFloat(lngAttr); }
            }
            // fallback: parse lat/lng from query params
            if ((plat == null || plng == null) && href.includes('latitude=')) {
                try {
                    const q = new URL(full);
                    const la = q.searchParams.get('latitude');
                    const ln = q.searchParams.get('longitude');
                    if (la && ln) { plat = parseFloat(la); plng = parseFloat(ln); }
                } catch (e) { /* ignore */ }
            }
            const id = full;
            props.push({ id, name, lat: plat, lng: plng, url: full });
        } catch (e) { /* ignore */ }
    });

    const uniq = props.filter((p, idx, arr) => arr.findIndex(x => x.id === p.id) === idx).slice(0, limit);
    searchCache.set(key, uniq);
    return uniq;
}

export async function cachedScrapePolicy(url: string): Promise<string | null> {
    const hit = policyCache.get(url);
    if (hit !== undefined) return hit;
    await rateLimitFor(url);
    const txt = await scrapePolicyTextFromUrl(url);
    policyCache.set(url, txt);
    return txt;
}
