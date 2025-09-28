/*
--------------------------------------------------------------
Server-side example (Node + Express) — place in your server, NOT in frontend code
--------------------------------------------------------------
*/
// server.js (example)

import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors()); // allow cross-origin requests from frontend

const PORT = process.env.PORT || 4000;

// Ticketmaster API endpoint
app.get('/api/events', async (req, res) => {
  const city = req.query.city || 'Miami';
  const ticketmasterKey = process.env.TICKETMASTER_API_KEY;

  try {
    const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?city=${encodeURIComponent(city)}&apikey=${ticketmasterKey}`);
    const data = await response.json();
    const events = (data._embedded && data._embedded.events || []).map(e => ({
      name: e.name,
      venue: (e._embedded && e._embedded.venues && e._embedded.venues[0].name) || '',
      date: e.dates?.start?.localDate || ''
    }));
    res.json({ events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Simple itinerary endpoint
app.post('/api/itinerary', async (req, res) => {
  const { city, tripType, budget, interests, length } = req.body;
  const days = [];

  for (let d = 0; d < length; d++) {
    days.push({
      title: `${city} Day ${d + 1}`,
      estimated: Math.round(budget / length),
      blocks: [
        { when: 'Morning', activity: 'Local breakfast and stroll', address: 'Central area' },
        { when: 'Afternoon', activity: 'Main attraction / beach / park' },
        { when: 'Evening', activity: interests.includes('nightlife') ? '18+ friendly live music / bar' : 'Chill dinner spot' }
      ]
    });
  }

  const estimated_total = days.reduce((s, x) => s + x.estimated, 0);
  res.json({ days, estimated_total });
});

// Maps key endpoint
app.get('/api/maps-key', (req, res) => {
  res.json({ key: process.env.GOOGLE_MAPS_KEY });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

/*
--------------------------------------------------------------
Security & integration notes (in-server):
- Never embed API keys in frontend JS. Use server endpoints to proxy or to return short-lived tokens.
- For services requiring OAuth (Spotify), implement the Authorization Code flow or PKCE on the server.
- Rate limit and cache responses (events, places) to avoid quota exhaustion.
- Validate user input on server to prevent injection.
*/
