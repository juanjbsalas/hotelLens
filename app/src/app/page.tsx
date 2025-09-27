'use client';
import React from 'react';
import SearchBar from './components/SearchBar';
import HotelCard from './components/HotelCard';
import { Hotel, SearchResponse } from '../../types';


export default function Page() {
  const [eligible, setEligible] = React.useState<Hotel[]>([]);
  const [unknown, setUnknown] = React.useState<Hotel[]>([]);
  const [notEligible, setNotEligible] = React.useState<Hotel[]>([]);
  const [meta, setMeta] = React.useState<{ provider: string; fetchedAt: string } | null>(null);
  const [showUnknown, setShowUnknown] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);


  const runSearch = async ({ lat, lng, radius }: { lat: number; lng: number; radius: number }) => {
    setError(null);
    setEligible([]); setUnknown([]); setNotEligible([]);
    try {
      const res = await fetch(`/api/search?lat=${lat}&lng=${lng}&radius=${radius}`);
      const data: SearchResponse | { error: string } = await res.json();
      if ('error' in data) throw new Error(data.error);
      setEligible(data.eligible); setUnknown(data.unknown); setNotEligible(data.notEligible); setMeta(data.meta);
    } catch (e: any) {
      setError(e.message || 'Search failed');
    }
  };


  React.useEffect(() => { // initial demo search
    runSearch({ lat: 38.575764, lng: -121.478851, radius: 20 });
  }, []);


  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">18+ Hotel Finder</h1>
        <span className="text-sm text-gray-600">{meta ? `Source: ${meta.provider} • ${new Date(meta.fetchedAt).toLocaleString()}` : ''}</span>
      </header>


      <div className="mb-6 rounded-2xl border bg-white p-4">
        <SearchBar onSearch={runSearch} />
        <div className="mt-3 flex items-center gap-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="accent-black" checked={showUnknown} onChange={e => setShowUnknown(e.target.checked)} />
            Show hotels with unknown policy
          </label>
        </div>
      </div>


      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>
      )}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold">Eligible (≤ 18)</h2>
        {eligible.length === 0 && <p className="text-sm text-gray-600">No matches yet in this area.</p>}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {eligible.map(h => <HotelCard key={h.id} h={h} />)}
        </div>
      </section>


      {showUnknown && (
        <section className="mt-10 space-y-6">
          <h2 className="text-lg font-semibold">Unknown policy</h2>
          {unknown.length === 0 && <p className="text-sm text-gray-600">None.</p>}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {unknown.map(h => <HotelCard key={h.id} h={h} />)}
          </div>
        </section>
      )}


      <section className="mt-10 space-y-6">
        <h2 className="text-lg font-semibold">Not eligible ({'>'} 18)</h2>
        {notEligible.length === 0 && <p className="text-sm text-gray-600">None.</p>}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {notEligible.map(h => <HotelCard key={h.id} h={h} />)}
        </div>
      </section>


      <footer className="mt-12 text-xs text-gray-500">
        Policies change—always bring government ID and payment card matching the booking name.
      </footer>
    </main>
  );
}
