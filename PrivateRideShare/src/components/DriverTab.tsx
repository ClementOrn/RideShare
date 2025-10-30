/**
 * Driver Tab Component
 * Driver registration and management
 */

'use client';

import React, { useState } from 'react';
import type { DriverRegistration, DriverInfo } from '@/types/rideshare';

interface DriverTabProps {
  driverInfo: DriverInfo | null;
  availableRidesCount: number;
  onRegisterDriver: (registration: DriverRegistration) => Promise<void>;
  onUpdateLocation: (lat: number, lng: number) => Promise<void>;
  onToggleAvailability: () => Promise<void>;
  onRefreshRides: () => void;
  isLoading: boolean;
}

export function DriverTab({
  driverInfo,
  availableRidesCount,
  onRegisterDriver,
  onUpdateLocation,
  onToggleAvailability,
  onRefreshRides,
  isLoading,
}: DriverTabProps) {
  const [formData, setFormData] = useState<DriverRegistration>({
    initialLat: 0,
    initialLng: 0,
    minFare: 0,
  });

  const [locationLat, setLocationLat] = useState('');
  const [locationLng, setLocationLng] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRegisterDriver(formData);
    setFormData({
      initialLat: 0,
      initialLng: 0,
      minFare: 0,
    });
  };

  const handleUpdateLocation = async () => {
    if (!locationLat || !locationLng) {
      alert('Please enter both latitude and longitude');
      return;
    }
    await onUpdateLocation(parseFloat(locationLat), parseFloat(locationLng));
    setLocationLat('');
    setLocationLng('');
  };

  const handleChange = (field: keyof DriverRegistration, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const isRegistered = driverInfo && driverInfo.registrationTime > 0n;

  return (
    <div className="space-y-6">
      {/* Driver Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <h4 className="text-3xl font-bold mb-1">
            {driverInfo ? Number(driverInfo.totalRides) : 0}
          </h4>
          <p className="text-blue-100">Total Rides</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <h4 className="text-3xl font-bold mb-1">
            {isRegistered ? (driverInfo.isVerified ? 'Verified' : 'Registered') : 'Not Registered'}
          </h4>
          <p className="text-purple-100">Status</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
          <h4 className="text-3xl font-bold mb-1">{availableRidesCount}</h4>
          <p className="text-pink-100">Available Rides</p>
        </div>
      </div>

      {/* Registration Form */}
      {!isRegistered && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Driver Registration
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="e.g., 40.7128"
                  value={formData.initialLat || ''}
                  onChange={(e) => handleChange('initialLat', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="e.g., -74.0060"
                  value={formData.initialLng || ''}
                  onChange={(e) => handleChange('initialLng', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Fare (in Wei)
              </label>
              <input
                type="number"
                placeholder="e.g., 500000000000000000"
                value={formData.minFare || ''}
                onChange={(e) => handleChange('minFare', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registering...' : 'Register as Driver'}
            </button>
          </form>
        </div>
      )}

      {/* Driver Actions */}
      {isRegistered && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Driver Actions
          </h3>

          <div className="space-y-4">
            {/* Update Location */}
            <div className="flex gap-2">
              <input
                type="number"
                step="0.000001"
                placeholder="Latitude"
                value={locationLat}
                onChange={(e) => setLocationLat(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                step="0.000001"
                placeholder="Longitude"
                value={locationLng}
                onChange={(e) => setLocationLng(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleUpdateLocation}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                Update Location
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onToggleAvailability}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium"
              >
                Toggle Availability
                {driverInfo && (
                  <span className="ml-2">
                    ({driverInfo.isAvailable ? 'Available' : 'Unavailable'})
                  </span>
                )}
              </button>

              <button
                onClick={onRefreshRides}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Refresh Available Rides
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
