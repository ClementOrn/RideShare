/**
 * Type definitions for Private RideShare application
 */

export interface RideDetails {
  passenger: string;
  matchedDriver: string;
  requestTime: bigint;
  isActive: boolean;
  isMatched: boolean;
}

export interface DriverInfo {
  isAvailable: boolean;
  isVerified: boolean;
  totalRides: bigint;
  registrationTime: bigint;
}

export interface CompletedRideInfo {
  passenger: string;
  driver: string;
  startTime: bigint;
  endTime: bigint;
  isCompleted: boolean;
  fareDisputed: boolean;
}

export interface RideRequest {
  pickupLat: number;
  pickupLng: number;
  destinationLat: number;
  destinationLng: number;
  maxFare: number;
}

export interface DriverRegistration {
  initialLat: number;
  initialLng: number;
  minFare: number;
}

export interface LocationUpdate {
  newLat: number;
  newLng: number;
}

export interface RideCard {
  rideId: number;
  details: RideDetails;
  type: 'passenger' | 'driver' | 'available';
}

export type RideStatus = 'active' | 'matched' | 'completed';

export interface MessageProps {
  message: string;
  type: 'success' | 'error' | 'info';
}
