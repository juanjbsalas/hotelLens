export const ACTIVE_PROVIDER = (process.env.ACTIVE_PROVIDER || 'mock') as 'mock'|'expedia'|'booking';


export const EXPEDIA = {
    baseUrl: process.env.EXPEDIA_RAPID_BASE_URL || '',
    apiKey: process.env.EXPEDIA_RAPID_API_KEY || ''
};


export const BOOKING = {
    baseUrl: process.env.BOOKING_BASE_URL || '',
    apiKey: process.env.BOOKING_API_KEY || ''
};

// Feature flags
export const SCRAPING_ENABLED = (process.env.SCRAPING_ENABLED || 'true').toLowerCase() === 'true';
export const SCRAPING_PROVIDER_OVERRIDES = {
    booking: (process.env.SCRAPING_BOOKING_ENABLED || '').toLowerCase() === 'true' || undefined,
    expedia: (process.env.SCRAPING_EXPEDIA_ENABLED || '').toLowerCase() === 'true' || undefined
};