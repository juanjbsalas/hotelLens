import { Hotel, SearchParams } from '@/types';


export interface HotelProvider {
    name: string;
    searchNearby(params: SearchParams): Promise<Hotel[]>;
}


export function parseMinAgeFromText(text?: string | null): number | null {
    if (!text) return null;
    const t = text.toLowerCase();
    // common patterns
    const m = t.match(/minimum\s*age[^0-9]{0,12}(\d{2})/)
        || t.match(/check[- ]?in\s*age[^0-9]{0,12}(\d{2})/)
        || t.match(/guests?\s*must\s*be[^0-9]{0,12}(\d{2})/);
    if (m) return parseInt(m[1], 10);
    return null;
}