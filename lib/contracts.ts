export const CONTRACT_ADDRESS = '0x5986FF19B524534F159af67f421ca081c6F5Acff' as const;

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "getActiveRideRequestsCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAvailableDriversCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "driverAddress", "type": "address" }],
    "name": "getDriverInfo",
    "outputs": [
      { "internalType": "bool", "name": "isRegistered", "type": "bool" },
      { "internalType": "bool", "name": "isVerified", "type": "bool" },
      { "internalType": "bool", "name": "isAvailable", "type": "bool" },
      { "internalType": "uint256", "name": "totalRides", "type": "uint256" },
      { "internalType": "uint256", "name": "rating", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "rideId", "type": "uint256" }],
    "name": "getRideDetails",
    "outputs": [
      { "internalType": "address", "name": "passenger", "type": "address" },
      { "internalType": "address", "name": "driver", "type": "address" },
      { "internalType": "uint8", "name": "status", "type": "uint8" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "registerDriver",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "requestRide",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "rideId", "type": "uint256" }],
    "name": "acceptRide",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "rideId", "type": "uint256" }],
    "name": "completeRide",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bool", "name": "available", "type": "bool" }],
    "name": "setDriverAvailability",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "driver", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "DriverRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "rideId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "passenger", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "RideRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "rideId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "driver", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "RideAccepted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "rideId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "RideCompleted",
    "type": "event"
  }
] as const;

export const RIDE_STATUS = {
  REQUESTED: 0,
  ACCEPTED: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
  CANCELLED: 4,
} as const;

export const RIDE_STATUS_LABELS: Record<number, string> = {
  0: 'Requested',
  1: 'Accepted',
  2: 'In Progress',
  3: 'Completed',
  4: 'Cancelled',
};
