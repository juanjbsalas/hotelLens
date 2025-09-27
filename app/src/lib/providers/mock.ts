import { Hotel } from '@/types';
import { HotelProvider } from './base';
import { haversineKm } from '@/lib/geo';


const MOCK: Omit<Hotel, 'distanceKm'>[] = [
    {
        id: 'm1', name: 'Riverlake Inn', lat: 38.493, lng: -121.517,
        address: '123 Lakeview Dr', rating: 4.1, price: 129,
        minCheckInAge: 18,
        policyText: 'Minimum age to check in is 18 years old.',
        confidence: 'explicit', source: 'mock', url: '#',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551776235-dde6d4829808?q=80&w=1200&auto=format&fit=crop',
        photos: [
            'https://images.unsplash.com/photo-1551776235-dde6d4829808?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1501117716987-c8e1ecb2101f?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop'
        ]
    },
    {
        id: 'm2', name: 'Downtown Suites', lat: 38.578, lng: -121.495,
        address: '1 Main St', rating: 4.5, price: 179,
        minCheckInAge: 21,
        policyText: 'Guests must be 21 to check in.',
        confidence: 'parsed', source: 'mock', url: '#',
        thumbnailUrl: 'https://images.unsplash.com/photo-1488747279002-c8523379faaa?q=80&w=1200&auto=format&fit=crop',
        photos: [
            'https://images.unsplash.com/photo-1488747279002-c8523379faaa?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1496412705862-e0088f16f791?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600&auto=format&fit=crop'
        ]
    },
    {
        id: 'm3', name: 'Campus Lodge', lat: 38.55, lng: -121.43,
        address: '45 College Ave', rating: 3.8, price: 99,
        minCheckInAge: null,
        policyText: null,
        confidence: 'unknown', source: 'mock', url: '#',
        thumbnailUrl: 'https://images.unsplash.com/photo-1535827841776-24afc1e255ac?q=80&w=1200&auto=format&fit=crop',
        photos: [
            'https://images.unsplash.com/photo-1535827841776-24afc1e255ac?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop'
        ]
    }
    ,
    {
        id: 'm4', name: 'Airport Motel', lat: 38.561, lng: -121.444,
        address: '500 Flight Rd', rating: 3.2, price: 79,
        minCheckInAge: 18,
        policyText: 'Minimum age to check in: 18 years.',
        confidence: 'explicit', source: 'mock', url: '#',
        thumbnailUrl: 'https://images.unsplash.com/photo-1505691723518-36a2a21c4d84?q=80&w=1200&auto=format&fit=crop',
        photos: [
            'https://images.unsplash.com/photo-1505691723518-36a2a21c4d84?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1600&auto=format&fit=crop'
        ]
    },
    {
        id: 'm5', name: 'Seaside Bungalows', lat: 38.49, lng: -121.48,
        address: '2 Ocean View', rating: 4.0, price: 209,
        minCheckInAge: 25,
        policyText: 'Guests must be 25 to check in unless accompanied by an adult.',
        confidence: 'parsed', source: 'mock', url: '#',
        thumbnailUrl: 'https://images.unsplash.com/photo-1505691723519-123a3c5f0b4d?q=80&w=1200&auto=format&fit=crop',
        photos: [
            'https://images.unsplash.com/photo-1505691723519-123a3c5f0b4d?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1505692794405-6d7b6f66b3d2?q=80&w=1600&auto=format&fit=crop'
        ]
    },
    {
        id: 'm6', name: 'Historic Inn', lat: 38.59, lng: -121.52,
        address: '9 Heritage Sq', rating: 4.3, price: 189,
        minCheckInAge: 18,
        policyText: '18+ with ID required at check-in.',
        confidence: 'explicit', source: 'mock', url: '#',
        thumbnailUrl: 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?q=80&w=1200&auto=format&fit=crop',
        photos: [
            'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1600&auto=format&fit=crop'
        ]
    },
    {
        id: 'm7', name: 'Budget Inn', lat: 38.57, lng: -121.46,
        address: '88 Savings Ln', rating: 2.9, price: 59,
        minCheckInAge: null,
        policyText: 'Call property for age policy.',
        confidence: 'unknown', source: 'mock', url: '#',
        thumbnailUrl: 'https://images.unsplash.com/photo-1505692794400-5c1b8c1d3b58?q=80&w=1200&auto=format&fit=crop',
        photos: [
            'https://images.unsplash.com/photo-1505692794400-5c1b8c1d3b58?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1526779259212-7d0a0d5f98b3?q=80&w=1600&auto=format&fit=crop'
        ]
    },
    {
        id: 'm8', name: 'Luxury Resort', lat: 38.60, lng: -121.49,
        address: '1 Grand Ave', rating: 4.9, price: 349,
        minCheckInAge: 21,
        policyText: 'Guests must be 21+ to check in.',
        confidence: 'explicit', source: 'mock', url: '#',
        thumbnailUrl: 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?q=80&w=1200&auto=format&fit=crop',
        photos: [
            'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop'
        ]
    },
    {
        id: 'm9', name: 'Countryside Retreat', lat: 38.52, lng: -121.48,
        address: '77 Meadow Rd', rating: 4.2, price: 139,
        minCheckInAge: 19,
        policyText: 'Minimum check-in age is 19.',
        confidence: 'parsed', source: 'mock', url: '#',
        thumbnailUrl:'https://images.unsplash.com/photo-1505692794405-6d7b6f66b3d2?q=80&w=1200&auto=format&fit=crop',
        photos:[
            'https://images.unsplash.com/photo-1505692794405-6d7b6f66b3d2?q=80&w=1600&auto=format&fit=crop'
        ]
    }
];


export const MockProvider: HotelProvider = {
    name: 'mock',
    async searchNearby({ lat, lng, radiusKm = 20, limit = 50 }) {
        return MOCK
            .map(h => ({ ...h, distanceKm: haversineKm({ lat, lng }, { lat: h.lat, lng: h.lng }) }))
            .filter(h => h.distanceKm! <= radiusKm)
            .sort((a, b) => (a.distanceKm! - b.distanceKm!))
            .slice(0, limit);
    }
};