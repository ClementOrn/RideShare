# Private Ride Share DApp Deployment Guide

## Contract Deployment Instructions

1. **Update Contract Address**: After deploying the PrivateRideShare contract, update the `contractAddress` variable in `script.js` with the actual deployed contract address.

2. **Network Configuration**: The frontend is configured to work with Sepolia testnet. Make sure to:
   - Connect MetaMask to Sepolia testnet
   - Have Sepolia ETH for transactions
   - Update the contract address after deployment

## Vercel Deployment

This is a static site that can be deployed to Vercel:

1. Connect your GitHub repository to Vercel
2. The build settings are already configured in `vercel.json`
3. No additional build steps required - it's a static site

## Local Development

To run locally:
```bash
npm run dev
```

This will start a local server on port 3000.

## Contract Functions

The frontend interacts with these smart contract functions:
- `registerDriver()` - Register as a driver
- `requestRide()` - Request a ride as passenger
- `acceptRide()` - Accept a ride request as driver
- `completeRide()` - Complete a ride
- `updateDriverLocation()` - Update driver location
- `setDriverAvailability()` - Toggle driver availability

## Privacy Features

This DApp uses Fully Homomorphic Encryption (FHE) to protect:
- Location data (pickup, destination, driver location)
- Fare amounts
- Private matching between drivers and passengers

## Security Notes

- Never share private keys
- Always verify contract addresses
- Use testnet for development
- Audit smart contracts before mainnet deployment