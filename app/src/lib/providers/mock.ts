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
        thumbnailUrl: 'https://picsum.photos/seed/riverlake/1200/800',
        photos: [
            'https://picsum.photos/seed/riverlake-1/1600/1000',
            'https://picsum.photos/seed/riverlake-2/1600/1000',
            'https://picsum.photos/seed/riverlake-3/1600/1000',
            'https://picsum.photos/seed/riverlake-4/1600/1000'
        ]
    },
    {
        id: 'm2', name: 'Downtown Suites', lat: 38.578, lng: -121.495,
        address: '1 Main St', rating: 4.5, price: 179,
        minCheckInAge: 21,
        policyText: 'Guests must be 21 to check in.',
        confidence: 'parsed', source: 'mock', url: '#',
        thumbnailUrl: 'https://picsum.photos/seed/downtown/1200/800',
        photos: [
            'https://picsum.photos/seed/downtown-1/1600/1000',
            'https://picsum.photos/seed/downtown-2/1600/1000',
            'https://picsum.photos/seed/downtown-3/1600/1000'
        ]
    },
    {
        id: 'm3', name: 'Campus Lodge', lat: 38.55, lng: -121.43,
        address: '45 College Ave', rating: 3.8, price: 99,
        minCheckInAge: null,
        policyText: null,
        confidence: 'unknown', source: 'mock', url: '#',
        thumbnailUrl: 'https://picsum.photos/seed/campus/1200/800',
        photos: [
            'https://picsum.photos/seed/campus-1/1600/1000',
            'https://picsum.photos/seed/campus-2/1600/1000'
        ]
    }
    ,
    {
        id: 'm4', name: 'Airport Motel', lat: 38.561, lng: -121.444,
        address: '500 Flight Rd', rating: 3.2, price: 79,
        minCheckInAge: 18,
        policyText: 'Minimum age to check in: 18 years.',
        confidence: 'explicit', source: 'mock', url: '#',
        thumbnailUrl: 'https://picsum.photos/seed/airport/1200/800',
        photos: [
            'https://picsum.photos/seed/airport-1/1600/1000',
            'https://picsum.photos/seed/airport-2/1600/1000'
        ]
    },
    {
        id: 'm5', name: 'Seaside Bungalows', lat: 38.49, lng: -121.48,
        address: '2 Ocean View', rating: 4.0, price: 209,
        minCheckInAge: 25,
        policyText: 'Guests must be 25 to check in unless accompanied by an adult.',
        confidence: 'parsed', source: 'mock', url: '#',
        thumbnailUrl: 'https://picsum.photos/seed/seaside/1200/800',
        photos: [
            'https://picsum.photos/seed/seaside-1/1600/1000',
            'https://picsum.photos/seed/seaside-2/1600/1000'
        ]
    },
    {
        id: 'm6', name: 'Historic Inn', lat: 38.59, lng: -121.52,
        address: '9 Heritage Sq', rating: 4.3, price: 189,
        minCheckInAge: 18,
        policyText: '18+ with ID required at check-in.',
        confidence: 'explicit', source: 'mock', url: '#',
        thumbnailUrl: 'https://picsum.photos/seed/historic/1200/800',
        photos: [
            'https://picsum.photos/seed/historic-1/1600/1000',
            'https://picsum.photos/seed/historic-2/1600/1000'
        ]
    },
    {
        id: 'm7', name: 'Budget Inn', lat: 38.57, lng: -121.46,
        address: '88 Savings Ln', rating: 2.9, price: 59,
        minCheckInAge: null,
        policyText: 'Call property for age policy.',
        confidence: 'unknown', source: 'mock', url: '#',
        thumbnailUrl: 'https://picsum.photos/seed/budget/1200/800',
        photos: [
            'https://picsum.photos/seed/budget-1/1600/1000',
            'https://picsum.photos/seed/budget-2/1600/1000'
        ]
    },
    {
        id: 'm8', name: 'Luxury Resort', lat: 38.60, lng: -121.49,
        address: '1 Grand Ave', rating: 4.9, price: 349,
        minCheckInAge: 21,
        policyText: 'Guests must be 21+ to check in.',
        confidence: 'explicit', source: 'mock', url: '#',
        thumbnailUrl: 'https://picsum.photos/seed/luxury/1200/800',
        photos: [
            'https://picsum.photos/seed/luxury-1/1600/1000',
            'https://picsum.photos/seed/luxury-2/1600/1000'
        ]
    },
    {
        id: 'm9', name: 'Countryside Retreat', lat: 38.52, lng: -121.48,
        address: '77 Meadow Rd', rating: 4.2, price: 139,
        minCheckInAge: 19,
        policyText: 'Minimum check-in age is 19.',
        confidence: 'parsed', source: 'mock', url: '#',
        thumbnailUrl: 'https://picsum.photos/seed/countryside/1200/800',
        photos:[
            'https://picsum.photos/seed/countryside-1/1600/1000'
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