import { NextRequest, NextResponse } from 'next/server';
import { ACTIVE_PROVIDER } from '@/lib/config';
import { MockProvider } from '@/lib/providers/mock';
import { ExpediaProvider } from '@/lib/providers/expedia';
import { BookingProvider } from '@/lib/providers/booking';
import { LRU } from '@/lib/lru';
import { Hotel, SearchParams, SearchResponse } from '../../../../types';


const cache = new LRU<string, Hotel[]>(200, 5 * 60_000); // 5 min


function pickProvider() {
    switch (ACTIVE_PROVIDER) {
        case 'expedia': return ExpediaProvider;
        case 'booking': return BookingProvider;
        default: return MockProvider;
    }
}


export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const lat = parseFloat(url.searchParams.get('lat') || 'NaN');
        const lng = parseFloat(url.searchParams.get('lng') || 'NaN');
        const radiusKm = parseFloat(url.searchParams.get('radius') || '20');
        const limit = parseInt(url.searchParams.get('limit') || '50', 10);
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
            return NextResponse.json({ error: 'lat,lng required' }, { status: 400 });
        }


        const key = `${ACTIVE_PROVIDER}:${lat.toFixed(4)},${lng.toFixed(4)}:${radiusKm}:${limit}`;
        const hit = cache.get(key);
        const provider = pickProvider();
        const hotels = hit ?? await provider.searchNearby({ lat, lng, radiusKm, limit } as SearchParams);
        if (!hit) cache.set(key, hotels);


        const eligible: Hotel[] = [];
        const unknown: Hotel[] = [];
        const notEligible: Hotel[] = [];
        for (const h of hotels) {
            if (h.minCheckInAge == null) unknown.push(h);
            else if (h.minCheckInAge <= 18) eligible.push(h);
            else notEligible.push(h);
        }


        const res: SearchResponse = {
            eligible, unknown, notEligible,
            meta: { provider: provider.name, fetchedAt: new Date().toISOString() }
        };
        return NextResponse.json(res);
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
    }
}