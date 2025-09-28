export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { ACTIVE_PROVIDER } from '@/lib/config';
import { MockProvider } from '@/lib/providers/mock';
// providers are required lazily to capture import-time errors in dev
import { LRU } from '@/lib/lru';
import { Hotel, SearchParams, SearchResponse } from '../../../../types';


const cache = new LRU<string, Hotel[]>(200, 5 * 60_000); // 5 min


function pickProvider() {
    try {
        switch (ACTIVE_PROVIDER) {
            case 'expedia':
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                return require('@/lib/providers/expedia').ExpediaProvider;
            case 'booking':
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                return require('@/lib/providers/booking').BookingProvider;
            default:
                return MockProvider;
        }
    } catch (e) {
        try {
            const fs = require('fs');
            const path = require('path');
            const debugDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
            const file = path.join(debugDir, `provider-import-error-${Date.now()}.log`);
            const eany: any = e;
            fs.writeFileSync(file, `${eany?.stack || eany?.message || String(eany)}`, 'utf8');
        } catch (we) { /* ignore */ }
        return MockProvider;
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
        let hotels: Hotel[] | undefined;
        try {
            hotels = hit ?? await provider.searchNearby({ lat, lng, radiusKm, limit } as SearchParams);
        } catch (provErr: any) {
            // write error to disk for inspection
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const fs = require('fs');
                const path = require('path');
                const debugDir = path.join(process.cwd(), 'tmp');
                if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
                const file = path.join(debugDir, `api-search-error-${Date.now()}.log`);
                const payload = `provider=${provider.name} error=${provErr?.stack || provErr?.message || provErr}\n`;
                fs.writeFileSync(file, payload, 'utf8');
            } catch (writeErr) {
                // ignore write errors
            }
            throw provErr;
        }
    hotels = hotels ?? [];
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