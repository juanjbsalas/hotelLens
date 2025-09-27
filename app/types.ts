export type Confidence = 'explicit' | 'parsed' | 'override' | 'crowd' | 'unknown';


export type Hotel = {
    id: string;
    name: string;
    lat: number;
    lng: number;
    address?: string;
    rating?: number; // 0-5
    price?: number; // nightly, if available
    distanceKm?: number; // computed client/server side
    minCheckInAge?: number | null;
    policyText?: string | null;
    confidence: Confidence;
    source: 'mock' | 'expedia' | 'booking';
    url?: string; // deep link if available
};


export type SearchParams = {
    lat: number;
    lng: number;
    radiusKm?: number; // default 20
    limit?: number; // default 50
};


export type SearchResponse = {
    eligible: Hotel[]; // <= 18
    unknown: Hotel[]; // null / not found
    notEligible: Hotel[]; // > 18
    meta: { provider: string; fetchedAt: string };
};