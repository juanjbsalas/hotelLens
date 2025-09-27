'use client';
import React from 'react';
import { Confidence } from '@/types';


export default function PolicyBadge({ confidence }: { confidence: Confidence }) {
    const label = {
        explicit: 'Verified 18+ (API)',
        parsed: 'Likely 18+ (parsed)',
        override: 'Admin override',
        crowd: 'Crowd-confirmed',
        unknown: 'Unknown policy'
    }[confidence];


    const style = {
        explicit: 'bg-green-100 text-green-800 ring-green-200',
        parsed: 'bg-amber-100 text-amber-800 ring-amber-200',
        override: 'bg-blue-100 text-blue-800 ring-blue-200',
        crowd: 'bg-purple-100 text-purple-800 ring-purple-200',
        unknown: 'bg-gray-100 text-gray-800 ring-gray-200'
    }[confidence];


    return (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ring-1 ${style}`}>
            {label}
        </span>
    );
}