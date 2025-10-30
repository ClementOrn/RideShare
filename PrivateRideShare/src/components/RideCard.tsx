/**
 * Ride Card Component
 * Display individual ride information
 */

'use client';

import React from 'react';
import type { RideDetails, RideStatus } from '@/types/rideshare';
import { formatAddress, formatDate } from '@/lib/utils/format';

interface RideCardProps {
  rideId: number;
  details: RideDetails;
  type: 'passenger' | 'driver' | 'available';
  onAccept?: (rideId: number) => Promise<void>;
  onComplete?: (rideId: number) => Promise<void>;
  isLoading?: boolean;
}

export function RideCard({
  rideId,
  details,
  type,
  onAccept,
  onComplete,
  isLoading = false,
}: RideCardProps) {
  const getStatus = (): RideStatus => {
    if (!details.isActive) return 'completed';
    if (details.isMatched) return 'matched';
    return 'active';
  };

  const status = getStatus();

  const statusConfig = {
    active: {
      label: 'Active',
      className: 'bg-blue-100 text-blue-800',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
    },
    matched: {
      label: 'Matched',
      className: 'bg-purple-100 text-purple-800',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-100 text-green-800',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
  };

  const currentStatus = statusConfig[status];

  const handleAccept = async () => {
    if (onAccept && !isLoading) {
      await onAccept(rideId);
    }
  };

  const handleComplete = async () => {
    if (onComplete && !isLoading) {
      const finalFare = prompt('Enter final fare (in Wei):');
      if (finalFare) {
        await onComplete(rideId);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Ride #{rideId}
        </h4>
        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${currentStatus.className}`}>
          {currentStatus.icon}
          {currentStatus.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-600 font-medium">Passenger:</span>
          <span className="text-gray-800 font-mono">{formatAddress(details.passenger)}</span>
        </div>

        {details.matchedDriver !== '0x0000000000000000000000000000000000000000' && (
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Driver:</span>
            <span className="text-gray-800 font-mono">{formatAddress(details.matchedDriver)}</span>
          </div>
        )}

        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600 font-medium">Requested:</span>
          <span className="text-gray-800">{formatDate(details.requestTime)}</span>
        </div>
      </div>

      {/* Actions */}
      {type === 'available' && onAccept && (
        <button
          onClick={handleAccept}
          disabled={isLoading}
          className="w-full mt-4 bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Accept Ride
        </button>
      )}

      {type === 'driver' && details.isMatched && details.isActive && onComplete && (
        <button
          onClick={handleComplete}
          disabled={isLoading}
          className="w-full mt-4 bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          Complete Ride
        </button>
      )}
    </div>
  );
}
