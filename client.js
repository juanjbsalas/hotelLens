import React, {useState, useEffect} from 'react';

/**
 * TravelSuggestionPage.jsx
 * Single-file React component demonstrating a complete travel-suggestion UI
 * + integration points (calls backend endpoints such as /api/itinerary, /api/events, /api/maps)
 * Built with Tailwind CSS utility classes.
 *
 * IMPORTANT: This file is intended as a starting point. Replace backend endpoints with
 * your own server routes. Do NOT place secret API keys in frontend code.
 */

export default function TravelSuggestionPage(){
  const [city, setCity] = useState('Miami');
  const [tripType, setTripType] = useState('friends');
  const [budget, setBudget] = useState(100);
  const [interests, setInterests] = useState(['nightlife','food']);
  const [length, setLength] = useState(3);
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [events, setEvents] = useState([]);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(()=>{
    // Optionally preload events for default city
    fetchEvents(city);
  },[]);

  async function fetchEvents(cityName){
    try{
      const res = await fetch(`/api/events?city=${encodeURIComponent(cityName)}`);
      if(!res.ok) throw new Error('events fetch failed');
      const data = await res.json();
      setEvents(data.events || []);
    }catch(e){
      console.error(e); setEvents([]);
    }
  }

  function toggleInterest(tag){
    setInterests(prev => prev.includes(tag) ? prev.filter(t=>t!==tag) : [...prev, tag]);
  }

  async function generateItinerary(){
    setLoading(true); setError(null);
    try{
      const payload = {city, tripType, budget, interests, length};
      const res = await fetch('/api/itinerary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      if(!res.ok) throw new Error('itinerary generation failed');
      const data = await res.json();
      setItinerary(data);
      // refresh events close to plan
      fetchEvents(city);
    }catch(e){
      console.error(e); setError(e.message || 'error');
    }finally{ setLoading(false); }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">HotelLens — Youth Itinerary Builder</h1>
        <div className="text-sm text-gray-600">Age 18-20 friendly • Student discounts highlighted</div>
      </header>

      <section className="bg-white rounded-2xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">City</span>
            <input value={city} onChange={e=>setCity(e.target.value)} className="mt-1 block w-full rounded-md border p-2" />
          </label>

          <div className="flex gap-3">
            <label className="flex-1">
              <span className="text-sm">Trip type</span>
              <select value={tripType} onChange={e=>setTripType(e.target.value)} className="mt-1 w-full rounded-md border p-2">
                <option value="friends">Friends</option>
                <option value="solo">Solo</option>
                <option value="couple">Couple</option>
                <option value="family">Family visit</option>
              </select>
            </label>

            <label className="w-36">
              <span className="text-sm">Length (days)</span>
              <input type="number" min={1} max={14} value={length} onChange={e=>setLength(Number(e.target.value))} className="mt-1 w-full rounded-md border p-2" />
            </label>

            <label className="w-48">
              <span className="text-sm">Budget (USD)</span>
              <input type="range" min={50} max={2000} step={10} value={budget} onChange={e=>setBudget(Number(e.target.value))} className="mt-5 w-full" />
              <div className="text-sm mt-1">{budget}</div>
            </label>
          </div>

          <div className="pt-2">
            <span className="text-sm font-medium">Interests</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {['nightlife','adventure','food','culture','shopping','relaxation','events','tiktok-worthy'].map(tag=> (
                <button key={tag} onClick={()=>toggleInterest(tag)} className={`px-3 py-1 rounded-full border ${interests.includes(tag)?'bg-gray-900 text-white':'bg-white text-gray-700'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button disabled={loading} onClick={generateItinerary} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow">{loading? 'Generating...':'Generate Itinerary'}</button>
            <button onClick={()=>fetchEvents(city)} className="ml-3 px-4 py-3 rounded-xl border">Refresh Events</button>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        <aside className="space-y-3">
          <div className="rounded-lg border p-3">
            <h3 className="font-semibold">Quick Filters</h3>
            <div className="mt-2 flex flex-col gap-2">
              <button className="text-left px-3 py-2 rounded-md border">Cheap & Fun</button>
              <button className="text-left px-3 py-2 rounded-md border">18+ Friendly Nights</button>
              <button className="text-left px-3 py-2 rounded-md border">TikTok Spots</button>
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <h3 className="font-semibold">Events near {city}</h3>
            <div className="mt-2 space-y-2 max-h-56 overflow-auto">
              {events.length===0 && <div className="text-sm text-gray-500">No events found</div>}
              {events.slice(0,6).map((ev,i)=> (
                <div key={i} className="p-2 border rounded">
                  <div className="font-medium text-sm">{ev.name}</div>
                  <div className="text-xs text-gray-600">{ev.venue} • {ev.date}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <h3 className="font-semibold">Budget Tracker</h3>
            <div className="mt-2 text-sm">Planned spend: <strong>{itinerary ? itinerary.estimated_total : 0}</strong> / {budget}</div>
            <div className="w-full bg-gray-100 h-3 rounded mt-2 overflow-hidden"><div style={{width:`${Math.min(100, (itinerary ? itinerary.estimated_total : 0)/budget*100)}%`}} className="h-full bg-indigo-600"/></div>
          </div>
        </aside>
      </section>

      <section>
        {itinerary ? (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold">Your Itinerary — {city}</h2>
            <div className="mt-4 space-y-4">
              {itinerary.days.map((day, idx)=> (
                <div key={idx} className="border rounded p-4">
                  <div className="flex justify-between items-center">
                    <div className="font-semibold">Day {idx+1} • {day.title}</div>
                    <div className="text-sm text-gray-600">Est: ${day.estimated}</div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {day.blocks.map((b,i)=> (
                      <div key={i} className="p-3 rounded border">
                        <div className="font-medium">{b.when}</div>
                        <div className="text-sm">{b.activity}</div>
                        {b.address && <div className="text-xs text-gray-500 mt-2">{b.address}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="font-semibold">Map</h3>
              <div id="map" className="h-64 w-full rounded mt-3 border" style={{minHeight:200}}>Map loads via Google Maps on the page; your server should supply a Maps API key to the client at /api/maps-key</div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 rounded border">Share Itinerary</button>
              <button className="px-4 py-2 rounded border">Export as PDF</button>
            </div>
          </div>
        ) : (
          <div className="text-gray-600">No itinerary yet — generate one to see a custom plan.</div>
        )}
      </section>

      <footer className="text-xs text-gray-500">Note: This demo uses backend endpoints (/api/itinerary, /api/events) — check the included server example to implement secure API-key handling.</footer>
    </div>
  );
}

