/**
 * Available Rides Component
 * Display available rides for drivers
 */

'use client';

import React from 'react';
import type { RideDetails } from '@/types/rideshare';
import { RideCard } from './RideCard';

interface AvailableRidesProps {
  rides: Array<{ id: number; details: RideDetails }>;
  onAcceptRide: (rideId: number) => Promise<void>;
  isLoading: boolean;
}

export function AvailableRides({ rides, onAcceptRide, isLoading }: AvailableRidesProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Available Rides
        <span className="ml-auto text-sm font-normal text-gray-600">
          {rides.length} {rides.length === 1 ? 'ride' : 'rides'} available
        </span>
      </h3>

      {rides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rides.map(ride => (
            <RideCard
              key={ride.id}
              rideId={ride.id}
              details={ride.details}
              type="available"
              onAccept={onAcceptRide}
              isLoading={isLoading}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-600 text-lg">No available rides at the moment</p>
          <p className="text-gray-500 text-sm mt-2">Check back later for new ride requests</p>
        </div>
      )}
    </div>
  );
}
