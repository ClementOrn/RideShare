/**
 * Passenger Tab Component
 * Request rides form
 */

'use client';

import React, { useState } from 'react';
import type { RideRequest } from '@/types/rideshare';

interface PassengerTabProps {
  onRequestRide: (request: RideRequest) => Promise<void>;
  isLoading: boolean;
}

export function PassengerTab({ onRequestRide, isLoading }: PassengerTabProps) {
  const [formData, setFormData] = useState<RideRequest>({
    pickupLat: 0,
    pickupLng: 0,
    destinationLat: 0,
    destinationLng: 0,
    maxFare: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRequestRide(formData);
    // Reset form
    setFormData({
      pickupLat: 0,
      pickupLng: 0,
      destinationLat: 0,
      destinationLng: 0,
      maxFare: 0,
    });
  };

  const handleChange = (field: keyof RideRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Request a Ride
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Latitude
            </label>
            <input
              type="number"
              step="0.000001"
              placeholder="e.g., 40.7128"
              value={formData.pickupLat || ''}
              onChange={(e) => handleChange('pickupLat', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Longitude
            </label>
            <input
              type="number"
              step="0.000001"
              placeholder="e.g., -74.0060"
              value={formData.pickupLng || ''}
              onChange={(e) => handleChange('pickupLng', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Latitude
            </label>
            <input
              type="number"
              step="0.000001"
              placeholder="e.g., 40.7589"
              value={formData.destinationLat || ''}
              onChange={(e) => handleChange('destinationLat', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Longitude
            </label>
            <input
              type="number"
              step="0.000001"
              placeholder="e.g., -73.9851"
              value={formData.destinationLng || ''}
              onChange={(e) => handleChange('destinationLng', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Fare (in Wei)
          </label>
          <input
            type="number"
            placeholder="e.g., 1000000000000000000"
            value={formData.maxFare || ''}
            onChange={(e) => handleChange('maxFare', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the maximum amount you're willing to pay for this ride
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Requesting Ride...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Request Ride
            </>
          )}
        </button>
      </form>
    </div>
  );
}
