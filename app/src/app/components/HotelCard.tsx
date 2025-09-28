'use client';
import React from 'react';
import PolicyBadge from './PolicyBadge';
import ImageGallery from './ImageGallery';
import { Hotel } from '@/types';

export default function HotelCard({ h }: { h: Hotel }) {
    const [open, setOpen] = React.useState(false);
    const photos = h.photos?.length ? h.photos : (h.thumbnailUrl ? [h.thumbnailUrl] : []);

    return (
    <div className="flex w-full overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition">
            {/* Thumbnail: top on small screens, left on sm+ */}
            <div className="w-full sm:w-44 flex-shrink-0">
                <button
                    onClick={() => setOpen(true)}
                    className="relative block h-40 w-full cursor-pointer overflow-hidden bg-gray-100 sm:h-full"
                    aria-label={`Open photos for ${h.name}`}>
                    {photos.length > 0 ? (
                        <img src={photos[0]} alt={h.name} className="h-full w-full object-cover max-h-[260px] sm:max-h-none" />
                    ) : (
                        <div className="h-full w-full bg-gray-200" />
                    )}
                    <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                        {photos.length} photo{photos.length === 1 ? '' : 's'}
                    </div>
                </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col p-4 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h3 className="overflow-hidden text-ellipsis whitespace-nowrap text-lg font-semibold">{h.name}</h3>
                        <p className="mt-1 text-sm text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">
                            {h.address ?? `${h.lat.toFixed(3)}, ${h.lng.toFixed(3)}`}
                        </p>
                        {typeof h.distanceKm === 'number' && (
                            <p className="mt-1 text-xs text-gray-500">{h.distanceKm.toFixed(1)} km away</p>
                        )}
                    </div>

                    <div className="ml-2 flex-shrink-0">
                        <PolicyBadge confidence={h.confidence} />
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4 text-sm min-w-0">
                        {h.rating != null && <span className="text-yellow-600">⭐ {h.rating.toFixed(1)}</span>}
                        {h.minCheckInAge != null && <span className="text-sm text-gray-600">Min age: {h.minCheckInAge}</span>}
                    </div>

                    <div className="ml-auto flex items-center gap-3 flex-shrink-0 flex-wrap">
                        {h.price != null ? (
                            <div className="flex flex-col items-end">
                                <span className="text-lg font-bold">${h.price}</span>
                                <span className="text-xs text-gray-500">per night</span>
                            </div>
                        ) : null}

                        <div className="flex items-center gap-2">
                            {h.url && (
                                <a
                                    href={h.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-95"
                                >
                                    View
                                </a>
                            )}
                            <button
                                onClick={() => window.open(`https://www.google.com/maps?q=${encodeURIComponent(h.name + ' ' + (h.address || ''))}`, '_blank')}
                                className="rounded-md border px-3 py-2 text-sm"
                            >
                                Map
                            </button>
                            {photos.length > 0 && (
                                <button onClick={() => setOpen(true)} className="rounded-md border px-3 py-2 text-sm">
                                    Photos
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {h.policyText && (
                    <p className="mt-3 text-sm italic text-gray-700">“{h.policyText}”</p>
                )}
            </div>

            {photos.length > 0 && <ImageGallery open={open} onClose={() => setOpen(false)} title={h.name} photos={photos} />}
        </div>
    );
}