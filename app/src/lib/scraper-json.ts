// scraper-json.ts
const cheerio = require('cheerio');

export function parseMinAgeFromText(t?: string | null): number | null {
    if (!t) return null;
    const s = t.toLowerCase();
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
        const m = s.match(pat);
        if (m) {
            const numStr = m[1];
            if (!numStr) continue;
            const n = parseInt(numStr, 10);
            if (!isNaN(n)) {
                if (n < 16 || n > 30) continue;
                return n;
            }
        }
    }
    return null;
}

/** Try to parse JSON from <script> tags and search for policy-like strings inside. */
export function extractMinAgeFromEmbeddedJSON(html: string): { minAge: number | null; source?: string } {
    const $ = cheerio.load(html);
    const texts: string[] = [];

    $('script').each((_: any, el: any) => {
        const raw = $(el).contents().text() || '';
        const trimmed = raw.trim();
        if (!trimmed) return;

        // 1) JSON-LD (structured data)
        const type = ($(el).attr('type') || '').toLowerCase();
        if (type.includes('ld+json')) {
            try {
                const obj = JSON.parse(trimmed);
                const str = JSON.stringify(obj);
                texts.push(str);
            } catch { }
            return;
        }

        // 2) Window states (Redux / dataLayer / __INITIAL_STATE__)
        // Heuristic: look for big JSON objects in the script.
        // Quick-and-safe: try a direct parse first (common on Expedia). If not valid, skip.
        try {
            const obj = JSON.parse(trimmed);
            const str = JSON.stringify(obj);
            texts.push(str);
            return;
        } catch { }

        // 3) Fallback: scan long script text for likely policy substrings
        if (trimmed.length > 500 && /policy|house rules|fine print|check-?in/i.test(trimmed)) {
            texts.push(trimmed);
        }
    });

    // Search all collected text blobs for min age
    for (const blob of texts) {
        const age = parseMinAgeFromText(blob);
        if (age != null) return { minAge: age, source: 'embedded-json' };
    }
    return { minAge: null };
}
