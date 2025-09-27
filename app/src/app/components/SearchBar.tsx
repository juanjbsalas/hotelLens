'use client';
import React from 'react';


export default function SearchBar({ onSearch }: { onSearch: (q: { lat: number; lng: number; radius: number }) => void }) {
    const [radius, setRadius] = React.useState(20);
    const [loading, setLoading] = React.useState(false);


    const locate = async () => {
        setLoading(true);
        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 });
            });
            onSearch({ lat: pos.coords.latitude, lng: pos.coords.longitude, radius });
        } catch {
            // fallback: IP-based via free service could be added; for now, Sacramento
            onSearch({ lat: 38.575764, lng: -121.478851, radius });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm">Radius
                <input type="number" className="ml-2 input" min={1} max={100} value={radius} onChange={e => setRadius(parseFloat(e.target.value))} /> km
            </label>
            <button className="btn" disabled={loading} onClick={locate}>{loading ? 'Locating…' : 'Search near me'}</button>
        </div>
    );
}