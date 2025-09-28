// A small lookup table for common city names to lat/lon. This enables
// client-side geocoding without relying on external APIs (which may be
// unavailable due to CORS restrictions). Feel free to add more entries
// as needed for your region.
export const cityCoords: Record<string, { lat: number; lng: number }> = {
    atlanta: { lat: 33.749, lng: -84.388 },
    "atlanta,ga": { lat: 33.749, lng: -84.388 },
    "atlanta, ga": { lat: 33.749, lng: -84.388 },
    "atlanta georgia": { lat: 33.749, lng: -84.388 },
    sacramento: { lat: 38.575764, lng: -121.478851 },
    "sacramento,ca": { lat: 38.575764, lng: -121.478851 },
    "sacramento, ca": { lat: 38.575764, lng: -121.478851 },
    "san francisco": { lat: 37.7749, lng: -122.4194 },
    "san francisco,ca": { lat: 37.7749, lng: -122.4194 },
    "los angeles": { lat: 34.0522, lng: -118.2437 },
    "los angeles,ca": { lat: 34.0522, lng: -118.2437 },
    "new york": { lat: 40.7128, lng: -74.006 },
    "new york,ny": { lat: 40.7128, lng: -74.006 },
    chicago: { lat: 41.8781, lng: -87.6298 },
    "chicago,il": { lat: 41.8781, lng: -87.6298 },
    miami: { lat: 25.7617, lng: -80.1918 },
    "miami,fl": { lat: 25.7617, lng: -80.1918 },
    boston: { lat: 42.3601, lng: -71.0589 },
    "boston,ma": { lat: 42.3601, lng: -71.0589 }
};

/**
 * Attempts to look up lat/lng for a given city string. Normalizes the
 * input to lowercase and strips punctuation/extra whitespace. Returns
 * undefined if not found. You can extend cityCoords as needed.
 */
export function lookupCity(city: string): { lat: number; lng: number } | undefined {
    if (!city) return undefined;
    const key = city.toLowerCase().replace(/\s+/g, ' ').trim();
    // direct match
    if (cityCoords[key]) return cityCoords[key];
    // remove punctuation like commas
    const cleaned = key.replace(/[.,]/g, '').trim();
    return cityCoords[cleaned];
}