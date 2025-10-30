/**
 * Home Page
 * Main page for Private RideShare application
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { PassengerTab } from '@/components/PassengerTab';
import { DriverTab } from '@/components/DriverTab';
import { RidesTab } from '@/components/RidesTab';
import { useWallet } from '@/hooks/useWallet';
import { useRideShare } from '@/hooks/useRideShare';
import type { RideRequest, DriverRegistration, RideDetails, DriverInfo } from '@/types/rideshare';

type TabType = 'passenger' | 'driver' | 'rides';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('passenger');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [availableRidesCount, setAvailableRidesCount] = useState(0);
  const [rideHistory, setRideHistory] = useState<Array<{ id: number; details: RideDetails }>>([]);
  const [availableRides, setAvailableRides] = useState<Array<{ id: number; details: RideDetails }>>([]);

  // Wallet hook
  const {
    provider,
    signer,
    address,
    network,
    isConnected,
    isConnecting,
    error: walletError,
    connectWallet,
  } = useWallet();

  // RideShare contract hook
  const {
    isLoading,
    error: contractError,
    requestRide,
    registerDriver,
    updateDriverLocation,
    acceptRide,
    completeRide,
    setDriverAvailability,
    getRideDetails,
    getDriverInfo,
    getPassengerRideHistory,
    getDriverRideHistory,
    getRideCounter,
    isRegisteredDriver,
  } = useRideShare(signer, address);

  // Show message helper
  const showMessage = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  // Load driver info
  const loadDriverInfo = useCallback(async () => {
    if (!address) return;
    try {
      const registered = await isRegisteredDriver(address);
      if (registered) {
        const info = await getDriverInfo(address);
        setDriverInfo(info);
      }
    } catch (err) {
      console.error('Error loading driver info:', err);
    }
  }, [address, isRegisteredDriver, getDriverInfo]);

  // Load ride history
  const loadRideHistory = useCallback(async () => {
    if (!address) return;
    try {
      const passengerRides = await getPassengerRideHistory(address);
      const driverRides = await getDriverRideHistory(address);
      const allRideIds = [...new Set([...passengerRides, ...driverRides])];

      const rides = await Promise.all(
        allRideIds.map(async (id) => {
          try {
            const details = await getRideDetails(id);
            return { id, details };
          } catch (err) {
            console.warn(`Error loading ride ${id}:`, err);
            return null;
          }
        })
      );

      setRideHistory(rides.filter((r): r is { id: number; details: RideDetails } => r !== null));
    } catch (err) {
      console.error('Error loading ride history:', err);
    }
  }, [address, getPassengerRideHistory, getDriverRideHistory, getRideDetails]);

  // Load available rides
  const loadAvailableRides = useCallback(async () => {
    try {
      const counter = await getRideCounter();
      setAvailableRidesCount(counter);

      const rides = await Promise.all(
        Array.from({ length: counter }, (_, i) => i + 1).map(async (id) => {
          try {
            const details = await getRideDetails(id);
            if (details.isActive && !details.isMatched) {
              return { id, details };
            }
            return null;
          } catch (err) {
            return null;
          }
        })
      );

      setAvailableRides(rides.filter((r): r is { id: number; details: RideDetails } => r !== null));
    } catch (err) {
      console.error('Error loading available rides:', err);
    }
  }, [getRideCounter, getRideDetails]);

  // Load data on connection
  useEffect(() => {
    if (isConnected && address) {
      loadDriverInfo();
      loadRideHistory();
      loadAvailableRides();
    }
  }, [isConnected, address, loadDriverInfo, loadRideHistory, loadAvailableRides]);

  // Handle request ride
  const handleRequestRide = async (request: RideRequest) => {
    try {
      await requestRide(request);
      showMessage('Ride requested successfully! Waiting for driver acceptance.', 'success');
      await loadRideHistory();
    } catch (err: any) {
      showMessage(`Failed to request ride: ${err.message}`, 'error');
    }
  };

  // Handle register driver
  const handleRegisterDriver = async (registration: DriverRegistration) => {
    try {
      await registerDriver(registration);
      showMessage('Successfully registered as driver!', 'success');
      await loadDriverInfo();
    } catch (err: any) {
      showMessage(`Failed to register as driver: ${err.message}`, 'error');
    }
  };

  // Handle update location
  const handleUpdateLocation = async (lat: number, lng: number) => {
    try {
      await updateDriverLocation(lat, lng);
      showMessage('Location updated successfully!', 'success');
    } catch (err: any) {
      showMessage(`Failed to update location: ${err.message}`, 'error');
    }
  };

  // Handle toggle availability
  const handleToggleAvailability = async () => {
    if (!driverInfo) return;
    try {
      const newAvailability = !driverInfo.isAvailable;
      await setDriverAvailability(newAvailability);
      showMessage(`Driver availability set to: ${newAvailability ? 'Available' : 'Unavailable'}`, 'success');
      await loadDriverInfo();
    } catch (err: any) {
      showMessage(`Failed to toggle availability: ${err.message}`, 'error');
    }
  };

  // Handle accept ride
  const handleAcceptRide = async (rideId: number) => {
    try {
      await acceptRide(rideId);
      showMessage(`Ride #${rideId} accepted successfully!`, 'success');
      await loadAvailableRides();
      await loadRideHistory();
    } catch (err: any) {
      showMessage(`Failed to accept ride: ${err.message}`, 'error');
    }
  };

  // Handle complete ride
  const handleCompleteRide = async (rideId: number) => {
    const finalFare = prompt('Enter final fare (in Wei):');
    if (!finalFare) return;

    try {
      await completeRide(rideId, parseInt(finalFare));
      showMessage(`Ride #${rideId} completed successfully!`, 'success');
      await loadRideHistory();
    } catch (err: any) {
      showMessage(`Failed to complete ride: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header
        address={address}
        network={network}
        isConnected={isConnected}
        isConnecting={isConnecting}
        onConnect={connectWallet}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            message.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
            message.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
            'bg-blue-50 border-blue-500 text-blue-800'
          }`}>
            <p className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                {message.type === 'success' ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : message.type === 'error' ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                )}
              </svg>
              {message.text}
            </p>
          </div>
        )}

        {/* Wallet errors */}
        {walletError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-800">
            <p className="font-medium">Wallet Error: {walletError}</p>
          </div>
        )}

        {contractError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-800">
            <p className="font-medium">Contract Error: {contractError}</p>
          </div>
        )}

        {!isConnected ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <svg className="w-20 h-20 mx-auto text-blue-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">
                Connect your wallet to start using Private Ride Share
              </p>
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition duration-200 disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-lg p-2 inline-flex gap-2 mb-8">
              <button
                onClick={() => setActiveTab('passenger')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  activeTab === 'passenger'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Passenger
              </button>
              <button
                onClick={() => setActiveTab('driver')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  activeTab === 'driver'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Driver
              </button>
              <button
                onClick={() => setActiveTab('rides')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  activeTab === 'rides'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                My Rides
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'passenger' && (
              <PassengerTab
                onRequestRide={handleRequestRide}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'driver' && (
              <DriverTab
                driverInfo={driverInfo}
                availableRidesCount={availableRidesCount}
                onRegisterDriver={handleRegisterDriver}
                onUpdateLocation={handleUpdateLocation}
                onToggleAvailability={handleToggleAvailability}
                onRefreshRides={loadAvailableRides}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'rides' && (
              <RidesTab
                rides={rideHistory}
                userAddress={address || ''}
                onAcceptRide={handleAcceptRide}
                onCompleteRide={handleCompleteRide}
                onRefresh={loadRideHistory}
                isLoading={isLoading}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-600 text-sm">
        <p>Built with Universal FHEVM SDK and Next.js</p>
        <p className="mt-2">
          Secure, Private Ride Sharing with Fully Homomorphic Encryption
        </p>
      </footer>
    </div>
  );
}
