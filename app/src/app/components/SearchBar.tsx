'use client';
import React from 'react';
import { lookupCity } from '@/lib/cities';


export default function SearchBar({ onSearch }: { onSearch: (q: { lat: number; lng: number; radius: number }) => void }) {
    const [radius, setRadius] = React.useState(20);
    const [loading, setLoading] = React.useState(false);
    const [city, setCity] = React.useState('');

    // lookupCity imported from '@/lib/cities'

    /**
     * Perform the search. If a city name or coordinates are provided,
     * attempt to resolve to lat/lng. Otherwise fall back to geolocation
     * (or a default location if unavailable). Coordinates can be entered
     * directly as "lat,lng".
     */
    const doSearch = async () => {
        setLoading(true);
        try {
            const trimmed = city.trim();
            // If user provided a city name or coordinate string
            if (trimmed) {
                // Detect lat,lng numeric pair input (e.g., "33.7,-84.3")
                const coordMatch = trimmed.match(/^\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*$/);
                if (coordMatch) {
                    const lat = parseFloat(coordMatch[1]);
                    const lng = parseFloat(coordMatch[2]);
                    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                        onSearch({ lat, lng, radius });
                        return;
                    }
                }
                // Try local lookup table for well-known cities
                const found = lookupCity(trimmed);
                if (found) {
                    onSearch({ lat: found.lat, lng: found.lng, radius });
                    return;
                }
                // As a last resort, attempt client-side fetch to a geocoding service
                // Note: Some geocoders enforce CORS restrictions; set a user agent
                try {
                    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1`;
                    const res = await fetch(url, {
                        headers: { 'User-Agent': 'hotel-lens-app/1.0 (github.com/hotel-lens)' }
                    });
                    if (res.ok) {
                        const list = await res.json();
                        if (Array.isArray(list) && list.length > 0) {
                            const first = list[0];
                            const lat = parseFloat(first.lat);
                            const lng = parseFloat(first.lon);
                            if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                                onSearch({ lat, lng, radius });
                                return;
                            }
                        }
                    }
                } catch {
                    // ignore geocode failures
                }
                // Could not resolve city; fall back to default (Sacramento)
                onSearch({ lat: 38.575764, lng: -121.478851, radius });
                return;
            }
            // If no city provided, use browser geolocation
            try {
                const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 });
                });
                onSearch({ lat: pos.coords.latitude, lng: pos.coords.longitude, radius });
            } catch {
                // fallback if geolocation fails
                onSearch({ lat: 38.575764, lng: -121.478851, radius });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm">City or coordinates
                <input
                    type="text"
                    className="ml-2 input"
                    placeholder="e.g. Atlanta or 33.7,-84.4"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                />
            </label>
            <label className="text-sm">Radius
                <input type="number" className="ml-2 input" min={1} max={100} value={radius} onChange={e => setRadius(parseFloat(e.target.value))} /> km
            </label>
            <button className="btn" disabled={loading} onClick={doSearch}>
                {loading ? 'Searching…' : 'Search'}
            </button>
        </div>
    );
}