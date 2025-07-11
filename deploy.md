# Private Ride Share DApp - Deployment Guide

Complete deployment guide for the Private Ride Share DApp built with Hardhat and FHE technology.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Compilation](#compilation)
4. [Testing](#testing)
5. [Deployment](#deployment)
6. [Contract Verification](#contract-verification)
7. [Interaction & Simulation](#interaction--simulation)
8. [Frontend Deployment](#frontend-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version
- **MetaMask**: Browser extension installed

### Required Accounts & API Keys
1. **MetaMask Wallet** with Sepolia ETH
   - Get free Sepolia ETH from: https://sepoliafaucet.com/
2. **Infura or Alchemy Account**
   - Infura: https://infura.io
   - Alchemy: https://alchemy.com
3. **Etherscan API Key**
   - Get from: https://etherscan.io/myapikey

---

## Environment Setup

### 1. Clone Repository
```bash
git clone <your-repository-url>
cd dapp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` file with your actual values:

```bash
# Required: Your wallet private key (without 0x prefix)
PRIVATE_KEY=your_actual_private_key_here

# Required: Sepolia RPC URL
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Required: Etherscan API key for verification
ETHERSCAN_API_KEY=your_actual_etherscan_api_key

# Optional: Gas reporting
REPORT_GAS=true
```

**SECURITY WARNING**: Never commit your `.env` file to Git!

---

## Compilation

### Compile Smart Contracts

```bash
npm run compile
```

Or using Hardhat directly:
```bash
npx hardhat compile
```

**Expected Output:**
```
Compiled 1 Solidity file successfully
Contract bytecode size: XX.XX KB
```

### Clean Artifacts (if needed)

```bash
npm run clean
```

---

## Testing

### Run All Tests

```bash
npm run test
```

### Run Tests with Gas Report

```bash
REPORT_GAS=true npm run test
```

### Run Coverage Report

```bash
npm run test:coverage
```

**Expected Test Output:**
```
  PrivateRideShare Contract
    ✓ Should deploy successfully
    ✓ Should register driver
    ✓ Should request ride
    ✓ Should accept ride
    ✓ Should complete ride

  X passing (Xs)
```

---

## Deployment

### Deploy to Local Hardhat Network

1. Start local Hardhat node:
```bash
npm run node
```

2. In a new terminal, deploy:
```bash
npm run deploy
```

### Deploy to Sepolia Testnet

**Prerequisites:**
- Ensure you have Sepolia ETH in your wallet
- Verify `.env` is configured correctly

```bash
npm run deploy:sepolia
```

**Deployment Process:**
1. Script connects to Sepolia network
2. Deploys PrivateRideShare contract
3. Waits for confirmations
4. Auto-verifies on Etherscan (if configured)
5. Saves deployment info to `deployments/sepolia.json`

**Expected Output:**
```
========================================
🚀 Starting PrivateRideShare Deployment
========================================

📋 Deployment Configuration:
   Network: sepolia
   Chain ID: 11155111
   Deployer: 0x...
   Balance: 0.5 ETH

📦 Deploying PrivateRideShare contract...

✅ Deployment successful!

📄 Contract Details:
   Address: 0x5986FF19B524534F159af67f421ca081c6F5Acff
   Transaction Hash: 0x...
   Block Number: 12345678
   Gas Used: 2500000

💾 Deployment info saved to: deployments/sepolia.json

🔗 Useful Links:
   Etherscan: https://sepolia.etherscan.io/address/0x5986FF19B524534F159af67f421ca081c6F5Acff
   Transaction: https://sepolia.etherscan.io/tx/0x...

📝 Next Steps:
   1. Update your frontend config with the contract address
   2. Run 'npm run verify:sepolia' if verification failed
   3. Run 'npm run interact' to test the contract
   4. Run 'npm run simulate' to run a full simulation
```

### Deploy to Zama Devnet (FHE)

```bash
npm run deploy:zama
```

---

## Contract Verification

### Automatic Verification
Verification happens automatically during deployment on public networks.

### Manual Verification

If automatic verification fails:

```bash
npm run verify:sepolia
```

Or use Hardhat directly:
```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

**Expected Output:**
```
========================================
🔍 Starting Contract Verification
========================================

📋 Verification Configuration:
   Network: sepolia
   Contract: PrivateRideShare
   Address: 0x5986FF19B524534F159af67f421ca081c6F5Acff

⏳ Verifying contract on Etherscan...

✅ Contract verified successfully!

🔗 View on Etherscan:
   https://sepolia.etherscan.io/address/0x5986FF19B524534F159af67f421ca081c6F5Acff#code
```

---

## Interaction & Simulation

### Interact with Deployed Contract

Query contract state and test basic functions:

```bash
npm run interact:sepolia
```

**Features:**
- Query contract owner
- Check ride and driver counters
- View active rides and available drivers
- Test owner functions
- Get driver and ride information

### Run Full Simulation

Test complete ride workflow:

```bash
npm run simulate:sepolia
```

**Simulation Steps:**
1. Register drivers with encrypted data
2. Verify drivers
3. Request rides with encrypted locations
4. Match drivers to rides
5. Update driver locations
6. Complete rides with encrypted fares

---

## Deployment Information

### Current Deployment (Sepolia Testnet)

**Contract Address:** `0x5986FF19B524534F159af67f421ca081c6F5Acff`

**Network Details:**
- **Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **Block Explorer**: https://sepolia.etherscan.io/

**Etherscan Links:**
- **Contract**: https://sepolia.etherscan.io/address/0x5986FF19B524534F159af67f421ca081c6F5Acff
- **Verified Source Code**: https://sepolia.etherscan.io/address/0x5986FF19B524534F159af67f421ca081c6F5Acff#code

### Deployment Files

All deployment information is automatically saved in:
```
deployments/
  ├── sepolia.json       # Sepolia deployment info
  ├── zama.json          # Zama deployment info (if deployed)
  └── localhost.json     # Local deployment info (if deployed)
```

**Example deployment file structure:**
```json
{
  "network": "sepolia",
  "chainId": 11155111,
  "contract": "PrivateRideShare",
  "address": "0x5986FF19B524534F159af67f421ca081c6F5Acff",
  "deployer": "0x...",
  "transactionHash": "0x...",
  "blockNumber": 12345678,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "constructorArguments": [],
  "verified": true,
  "verifiedAt": "2024-01-15T10:35:00.000Z"
}
```

---

## Frontend Deployment

### Update Frontend Configuration

After deploying the contract, update the frontend:

1. **Update `script.js`**:
```javascript
const contractAddress = "0x5986FF19B524534F159af67f421ca081c6F5Acff";
```

2. **Update `public/config.js`** (if exists):
```javascript
window.CONTRACT_CONFIG = {
  address: "0x5986FF19B524534F159af67f421ca081c6F5Acff",
  network: "sepolia",
  chainId: 11155111
};
```

### Deploy to Vercel

1. **Connect GitHub repository** to Vercel
2. **Configure build settings** (already set in `vercel.json`):
   - Build Command: (none - static site)
   - Output Directory: `.`
3. **Deploy**

Or use Vercel CLI:
```bash
npm install -g vercel
vercel
```

### Deploy to Other Platforms

**GitHub Pages:**
```bash
# Enable GitHub Actions workflow in .github/workflows/
git push origin main
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy
```

---

## Contract Functions Reference

### Driver Functions
- `registerDriver(lat, lng, minFare, proof)` - Register as a driver
- `updateDriverLocation(lat, lng, proof)` - Update location
- `setDriverAvailability(available)` - Toggle availability
- `acceptRide(rideId)` - Accept a ride request
- `completeRide(rideId, finalFare, proof)` - Complete a ride

### Passenger Functions
- `requestRide(pickupLat, pickupLng, destLat, destLng, maxFare, proof)` - Request ride
- `cancelRide(rideId)` - Cancel ride request
- `reportFareDispute(rideId)` - Report fare issue

### View Functions
- `getDriverInfo(address)` - Get driver details
- `getRideDetails(rideId)` - Get ride information
- `getActiveRideRequestsCount()` - Count active rides
- `getAvailableDriversCount()` - Count available drivers

### Owner Functions
- `verifyDriver(address)` - Verify a driver
- `addPauser(address)` - Add pauser role
- `pause()` / `unpause()` - Emergency controls

---

## Privacy Features

### FHE Encrypted Data

This DApp uses **Fully Homomorphic Encryption (FHE)** to protect:

1. **Location Data**
   - Pickup coordinates (latitude, longitude)
   - Destination coordinates
   - Driver current location

2. **Fare Information**
   - Maximum fare (passenger preference)
   - Minimum fare (driver requirement)
   - Final fare amount

3. **Matching Algorithm**
   - Distance calculations on encrypted data
   - Fare compatibility checks
   - All computed without decryption

### Security Implementation

- All sensitive data encrypted using `fhevmjs` library
- Encrypted values stored as `euint32` or `euint64`
- Computations performed on encrypted data
- Results remain encrypted until authorized decryption

---

## Troubleshooting

### Common Issues

#### 1. Deployment Fails - Insufficient Funds
```
Error: insufficient funds for gas
```
**Solution:** Get more Sepolia ETH from faucet: https://sepoliafaucet.com/

#### 2. Verification Fails
```
Error: already verified
```
**Solution:** Contract is already verified, check Etherscan link

#### 3. Network Connection Issues
```
Error: could not detect network
```
**Solution:**
- Check your RPC URL in `.env`
- Try alternative RPC provider
- Ensure internet connection is stable

#### 4. Private Key Issues
```
Error: private key must be 64 characters
```
**Solution:**
- Remove `0x` prefix from private key
- Ensure key is 64 hexadecimal characters

#### 5. FHE Operations Fail
```
Error: FHE operation not supported
```
**Solution:**
- Use Zama devnet for FHE operations
- Or test with mock encrypted values on Sepolia

### Get Help

- **Documentation**: Check official Hardhat docs: https://hardhat.org/docs
- **FHE Support**: Zama documentation: https://docs.zama.ai/
- **Issues**: Report bugs in GitHub repository

---

## Scripts Reference

### Available NPM Scripts

```bash
# Development
npm run dev              # Start local dev server
npm run node             # Start local Hardhat node

# Compilation
npm run compile          # Compile contracts
npm run clean            # Clean artifacts
npm run typechain        # Generate TypeChain types

# Testing
npm run test             # Run tests
npm run test:coverage    # Run with coverage

# Deployment
npm run deploy           # Deploy to localhost
npm run deploy:sepolia   # Deploy to Sepolia
npm run deploy:zama      # Deploy to Zama devnet

# Verification
npm run verify           # Verify on current network
npm run verify:sepolia   # Verify on Sepolia

# Interaction
npm run interact         # Interact with contract
npm run interact:sepolia # Interact on Sepolia

# Simulation
npm run simulate         # Run full simulation
npm run simulate:sepolia # Simulate on Sepolia
```

---

## Next Steps

After successful deployment:

1. ✅ **Test Contract**: Run `npm run interact:sepolia`
2. ✅ **Simulate Full Flow**: Run `npm run simulate:sepolia`
3. ✅ **Update Frontend**: Add contract address to frontend config
4. ✅ **Deploy Frontend**: Deploy to Vercel or GitHub Pages
5. ✅ **Test DApp**: Connect MetaMask and test full user flow
6. ✅ **Monitor**: Watch contract activity on Etherscan

---

## Security Checklist

Before mainnet deployment:

- [ ] Full test coverage (>80%)
- [ ] Professional smart contract audit
- [ ] Security review by multiple developers
- [ ] Test all functions on testnet
- [ ] Review all encrypted data handling
- [ ] Set up monitoring and alerts
- [ ] Document emergency procedures
- [ ] Configure multi-sig for owner functions
- [ ] Review gas optimizations
- [ ] Verify all dependencies are secure

---

## License

MIT License - See LICENSE file for details

---

**Last Updated**: 2024-01-15
**Contract Version**: 1.0.0
**Network**: Sepolia Testnet