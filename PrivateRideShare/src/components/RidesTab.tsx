/**
 * Rides Tab Component
 * Display ride history and available rides
 */

'use client';

import React from 'react';
import type { RideDetails } from '@/types/rideshare';
import { RideCard } from './RideCard';

interface RidesTabProps {
  rides: Array<{ id: number; details: RideDetails }>;
  userAddress: string;
  onAcceptRide?: (rideId: number) => Promise<void>;
  onCompleteRide?: (rideId: number) => Promise<void>;
  onRefresh: () => void;
  isLoading: boolean;
  showAvailable?: boolean;
}

export function RidesTab({
  rides,
  userAddress,
  onAcceptRide,
  onCompleteRide,
  onRefresh,
  isLoading,
  showAvailable = false,
}: RidesTabProps) {
  const filteredRides = showAvailable
    ? rides.filter(r => r.details.isActive && !r.details.isMatched)
    : rides;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {showAvailable ? 'Available Rides' : 'Ride History'}
          </h2>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Rides Grid */}
      {filteredRides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRides.map(ride => {
            const isDriver = ride.details.matchedDriver.toLowerCase() === userAddress.toLowerCase();
            const isPassenger = ride.details.passenger.toLowerCase() === userAddress.toLowerCase();

            return (
              <RideCard
                key={ride.id}
                rideId={ride.id}
                details={ride.details}
                type={showAvailable ? 'available' : (isDriver ? 'driver' : 'passenger')}
                onAccept={onAcceptRide}
                onComplete={onCompleteRide}
                isLoading={isLoading}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-600 text-lg">
            {showAvailable ? 'No available rides at the moment' : 'No ride history found'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {showAvailable ? 'Check back later for new ride requests' : 'Request or accept a ride to see your history'}
          </p>
        </div>
      )}
    </div>
  );
}
