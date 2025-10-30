/**
 * Contract ABI and configuration types
 */

export const RIDESHARE_ABI = [
  "function registerDriver(uint32 _initialLat, uint32 _initialLng, uint32 _minFare) external",
  "function requestRide(uint32 _pickupLat, uint32 _pickupLng, uint32 _destinationLat, uint32 _destinationLng, uint32 _maxFare) external",
  "function updateDriverLocation(uint32 _newLat, uint32 _newLng) external",
  "function acceptRide(uint256 rideId) external",
  "function completeRide(uint256 rideId, uint32 _finalFare) external",
  "function setDriverAvailability(bool _available) external",
  "function disputeFare(uint256 rideId) external",
  "function getActiveRideRequestsCount() external view returns (uint256)",
  "function getAvailableDriversCount() external view returns (uint256)",
  "function getPassengerRideHistory(address passenger) external view returns (uint256[])",
  "function getDriverRideHistory(address driver) external view returns (uint256[])",
  "function getRideDetails(uint256 rideId) external view returns (address passenger, address matchedDriver, uint256 requestTime, bool isActive, bool isMatched)",
  "function getDriverInfo(address driverAddress) external view returns (bool isAvailable, bool isVerified, uint256 totalRides, uint256 registrationTime)",
  "function getCompletedRideInfo(uint256 rideId) external view returns (address passenger, address driver, uint256 startTime, uint256 endTime, bool isCompleted, bool fareDisputed)",
  "function registeredDrivers(address) external view returns (bool)",
  "function rideCounter() external view returns (uint256)",
  "event RideRequested(uint256 indexed rideId, address indexed passenger, uint256 timestamp)",
  "event DriverRegistered(address indexed driver, uint256 timestamp)",
  "event RideMatched(uint256 indexed rideId, address indexed passenger, address indexed driver)",
  "event RideCompleted(uint256 indexed rideId, address indexed passenger, address indexed driver)",
  "event LocationUpdated(address indexed driver, uint256 timestamp)",
  "event FareDispute(uint256 indexed rideId, address indexed disputer)"
] as const;

export const CONTRACT_CONFIG = {
  // Replace with your deployed contract address
  address: "0x87288E6cEE215e01d2704c0d4d01EAF1d192659d" as const,
  abi: RIDESHARE_ABI,
} as const;

export interface ContractConfig {
  address: string;
  abi: readonly string[];
}
