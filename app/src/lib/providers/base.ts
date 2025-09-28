import { Hotel, SearchParams } from '@/types';


export interface HotelProvider {
    name: string;
    searchNearby(params: SearchParams): Promise<Hotel[]>;
}


export function parseMinAgeFromText(text?: string | null): number | null {
    if (!text) return null;
    const t = text.toLowerCase();
    // Expand patterns to catch more phrasing variations such as
    // "minimum check-in age is 18", "you must be at least 21 years old",
    // "guests under 21 are not allowed", "18+", etc. We search for
    // one or two-digit numbers associated with age requirements. After matching,
    // we filter out implausible ages (e.g., below 16 or above 30) to avoid
    // picking up numbers unrelated to check-in policies (like years in addresses).
    const patterns: RegExp[] = [
        /minimum\s*(?:check[- ]?in\s*)?age[^0-9]{0,12}(\d{1,2})/,
        /check[- ]?in\s*age[^0-9]{0,12}(\d{1,2})/,
        /minimum\s*age\s*to\s*check[- ]?in[^0-9]{0,12}(\d{1,2})/,
        /check[- ]?in\s*age\s*requirement[^0-9]{0,12}(\d{1,2})/,
        /minimum\s*guest\s*age[^0-9]{0,12}(\d{1,2})/,
        // guests must be at least 18 years old, guests are 21, guests have to be 25 or older
        /guests?\s*(?:must\s*(?:be|are)|have\s*to\s*be|are\s*required\s*to\s*be|are)\s*(?:at\s*least\s*)?(\d{1,2})(?:\s*years)?\s*(?:or\s*older)?/,
        // must be or are at least 18 years old; require a "years" context to avoid false positives (e.g. street numbers)
        /(?:must\s*(?:be|are)|are)\s*(?:at\s*least\s*)?(\d{1,2})\s*(?:years?\s*(?:of\s*age|old|or\s*older)?|\+\s*(?:years)?|\+)/,
        /guests?\s*under\s*(\d{1,2})\s*are\s*not\s*allowed/,
        /(\d{1,2})\s*\+\s*(?:years)?/,
        /(\d{1,2})\s*years?\s*or\s*older/,
        /(\d{1,2})\s*years\s*of\s*age/,
        /(\d{1,2})\s*years?\s*old/
    ];
    for (const pat of patterns) {
        const m = t.match(pat);
        if (m) {
            const numStr = m[1];
            if (!numStr) continue;
            const n = parseInt(numStr, 10);
            if (!isNaN(n)) {
                // Skip implausible ages to avoid false positives (e.g., addresses, years)
                if (n < 16 || n > 30) continue;
                return n;
            }
        }
    }
    return null;
}