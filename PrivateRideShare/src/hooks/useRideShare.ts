/**
 * RideShare contract interaction hook
 */

import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_CONFIG } from '@/types/contract';
import type { RideDetails, DriverInfo, RideRequest, DriverRegistration } from '@/types/rideshare';
import { coordinateToInt } from '@/lib/utils/coordinates';

export function useRideShare(signer: ethers.Signer | null, address: string | null) {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract
  useEffect(() => {
    if (signer) {
      const contractInstance = new ethers.Contract(
        CONTRACT_CONFIG.address,
        CONTRACT_CONFIG.abi,
        signer
      );
      setContract(contractInstance);
    } else {
      setContract(null);
    }
  }, [signer]);

  /**
   * Request a ride
   */
  const requestRide = useCallback(async (request: RideRequest) => {
    if (!contract) throw new Error('Contract not initialized');

    setIsLoading(true);
    setError(null);

    try {
      const tx = await contract.requestRide(
        coordinateToInt(request.pickupLat),
        coordinateToInt(request.pickupLng),
        coordinateToInt(request.destinationLat),
        coordinateToInt(request.destinationLng),
        request.maxFare
      );
      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  /**
   * Register as driver
   */
  const registerDriver = useCallback(async (registration: DriverRegistration) => {
    if (!contract) throw new Error('Contract not initialized');

    setIsLoading(true);
    setError(null);

    try {
      const tx = await contract.registerDriver(
        coordinateToInt(registration.initialLat),
        coordinateToInt(registration.initialLng),
        registration.minFare
      );
      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  /**
   * Update driver location
   */
  const updateDriverLocation = useCallback(async (lat: number, lng: number) => {
    if (!contract) throw new Error('Contract not initialized');

    setIsLoading(true);
    setError(null);

    try {
      const tx = await contract.updateDriverLocation(
        coordinateToInt(lat),
        coordinateToInt(lng)
      );
      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  /**
   * Accept a ride
   */
  const acceptRide = useCallback(async (rideId: number) => {
    if (!contract) throw new Error('Contract not initialized');

    setIsLoading(true);
    setError(null);

    try {
      const tx = await contract.acceptRide(rideId);
      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  /**
   * Complete a ride
   */
  const completeRide = useCallback(async (rideId: number, finalFare: number) => {
    if (!contract) throw new Error('Contract not initialized');

    setIsLoading(true);
    setError(null);

    try {
      const tx = await contract.completeRide(rideId, finalFare);
      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  /**
   * Toggle driver availability
   */
  const setDriverAvailability = useCallback(async (available: boolean) => {
    if (!contract) throw new Error('Contract not initialized');

    setIsLoading(true);
    setError(null);

    try {
      const tx = await contract.setDriverAvailability(available);
      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  /**
   * Get ride details
   */
  const getRideDetails = useCallback(async (rideId: number): Promise<RideDetails> => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      const details = await contract.getRideDetails(rideId);
      return {
        passenger: details[0],
        matchedDriver: details[1],
        requestTime: details[2],
        isActive: details[3],
        isMatched: details[4],
      };
    } catch (err: any) {
      console.error('Error getting ride details:', err);
      throw err;
    }
  }, [contract]);

  /**
   * Get driver info
   */
  const getDriverInfo = useCallback(async (driverAddress: string): Promise<DriverInfo> => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      const info = await contract.getDriverInfo(driverAddress);
      return {
        isAvailable: info[0],
        isVerified: info[1],
        totalRides: info[2],
        registrationTime: info[3],
      };
    } catch (err: any) {
      console.error('Error getting driver info:', err);
      throw err;
    }
  }, [contract]);

  /**
   * Get passenger ride history
   */
  const getPassengerRideHistory = useCallback(async (passengerAddress: string): Promise<number[]> => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      const rides = await contract.getPassengerRideHistory(passengerAddress);
      return rides.map((r: any) => Number(r));
    } catch (err: any) {
      console.error('Error getting passenger history:', err);
      throw err;
    }
  }, [contract]);

  /**
   * Get driver ride history
   */
  const getDriverRideHistory = useCallback(async (driverAddress: string): Promise<number[]> => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      const rides = await contract.getDriverRideHistory(driverAddress);
      return rides.map((r: any) => Number(r));
    } catch (err: any) {
      console.error('Error getting driver history:', err);
      throw err;
    }
  }, [contract]);

  /**
   * Get ride counter
   */
  const getRideCounter = useCallback(async (): Promise<number> => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      const counter = await contract.rideCounter();
      return Number(counter);
    } catch (err: any) {
      console.error('Error getting ride counter:', err);
      throw err;
    }
  }, [contract]);

  /**
   * Check if address is registered driver
   */
  const isRegisteredDriver = useCallback(async (driverAddress: string): Promise<boolean> => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      return await contract.registeredDrivers(driverAddress);
    } catch (err: any) {
      console.error('Error checking driver registration:', err);
      return false;
    }
  }, [contract]);

  return {
    contract,
    isLoading,
    error,
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
  };
}
