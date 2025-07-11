# Developer Guide - Private Ride Share DApp

## Quick Start

### Prerequisites
- Node.js v16+ and npm
- MetaMask browser extension
- Sepolia ETH for testing

### Installation
```bash
# Clone repository and navigate to project
cd D:\

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# Add SEPOLIA_RPC_URL, PRIVATE_KEY, and ETHERSCAN_API_KEY
```

### Development Workflow

#### 1. Compile Contracts
```bash
npm run compile
```
This will:
- Compile Solidity contracts
- Generate TypeChain types
- Run contract sizer to check sizes
- Output artifacts to `artifacts/` and types to `typechain-types/`

#### 2. Run Tests
```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run specific test file
npx hardhat test test/PrivateRideShare.test.js
```

#### 3. Deploy Locally
```bash
# Start local Hardhat node
npm run node

# In another terminal, deploy
npx hardhat run scripts/deploy.js --network localhost
```

#### 4. Deploy to Sepolia
```bash
# Using standard script
npm run deploy:sepolia

# Or using hardhat-deploy
npx hardhat deploy --network sepolia --tags PrivateRideShare
```

#### 5. Verify Contract
```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### Frontend Development

#### Run Local Server
```bash
npm run dev
# Opens on http://localhost:3000
```

#### Update Contract Address
After deploying, update `contractAddress` in `script.js`:
```javascript
this.contractAddress = "0xYourDeployedContractAddress";
```

## Smart Contract Architecture

### Core Components

#### 1. Data Structures
```solidity
struct PrivateLocation {
    euint32 encryptedLat;  // Encrypted latitude
    euint32 encryptedLng;  // Encrypted longitude
    bool isSet;
}

struct PrivateRideRequest {
    address passenger;
    PrivateLocation pickup;
    PrivateLocation destination;
    euint32 encryptedMaxFare;
    uint256 requestTime;
    bool isActive;
    bool isMatched;
    address matchedDriver;
    uint256 estimatedDuration;
}

struct PrivateDriver {
    address driverAddress;
    PrivateLocation currentLocation;
    euint32 encryptedMinFare;
    bool isAvailable;
    bool isVerified;
    uint256 totalRides;
    uint256 registrationTime;
}

struct RideMatch {
    uint256 rideId;
    address passenger;
    address driver;
    euint64 encryptedFinalFare;
    uint256 startTime;
    uint256 endTime;
    bool isCompleted;
    bool fareDisputed;
}
```

#### 2. Access Control Modifiers
```solidity
modifier onlyOwner()           // Owner-only functions
modifier onlyRegisteredDriver() // Registered drivers only
modifier onlyPauser()          // Authorized pausers only
modifier whenNotPaused()       // When contract is active
modifier whenPaused()          // When contract is paused
modifier onlyActiveRide()      // Valid active ride
```

### Function Reference

#### Passenger Functions
```solidity
// Request a ride with encrypted details
function requestRide(
    inEuint32 calldata _encryptedPickupLat,
    inEuint32 calldata _encryptedPickupLng,
    inEuint32 calldata _encryptedDestinationLat,
    inEuint32 calldata _encryptedDestinationLng,
    inEuint32 calldata _encryptedMaxFare,
    bytes calldata inputProof
) external whenNotPaused

// Dispute a completed ride
function disputeFare(uint256 rideId) external
```

#### Driver Functions
```solidity
// Register as a driver
function registerDriver(
    inEuint32 calldata _encryptedInitialLat,
    inEuint32 calldata _encryptedInitialLng,
    inEuint32 calldata _encryptedMinFare,
    bytes calldata inputProof
) external whenNotPaused

// Update location
function updateDriverLocation(
    inEuint32 calldata _encryptedNewLat,
    inEuint32 calldata _encryptedNewLng,
    bytes calldata inputProof
) external onlyRegisteredDriver whenNotPaused

// Accept a ride
function acceptRide(uint256 rideId)
    external onlyRegisteredDriver onlyActiveRide(rideId) whenNotPaused

// Complete a ride
function completeRide(
    uint256 rideId,
    inEuint64 calldata _encryptedFinalFare,
    bytes calldata inputProof
) external onlyRegisteredDriver whenNotPaused

// Toggle availability
function setDriverAvailability(bool _available)
    external onlyRegisteredDriver whenNotPaused
```

#### Admin Functions
```solidity
// Pauser management
function addPauser(address _pauser) external onlyOwner
function removePauser(address _pauser) external onlyOwner

// Emergency controls
function pause() external onlyPauser whenNotPaused
function unpause() external onlyPauser whenPaused

// Driver verification
function verifyDriver(address driverAddress) external onlyOwner
```

#### Gateway Functions
```solidity
// Request fare decryption
function requestFareDecryption(uint256 rideId) external

// Gateway callback (called by Gateway only)
function callbackFareDecryption(
    uint256 requestId,
    uint64 decryptedFare
) external onlyGateway
```

## Frontend Integration Guide

### Initialize FHEVM
```javascript
// Import fhevmjs
const { createInstance } = await import('https://cdn.jsdelivr.net/npm/fhevmjs@0.5.0/+esm');

// Create instance
this.fhevm = await createInstance({
    chainId: parseInt(window.ethereum.networkVersion),
    publicKey: '', // Fetched from contract
    gatewayUrl: "https://gateway.sepolia.zama.ai"
});

// Generate encryption token
const signature = await signer.signMessage("Access to encrypted data");
this.encryptionToken = signature;
```

### Encrypt Data
```javascript
// Encrypt 32-bit values (coordinates, small numbers)
const encrypted32 = await fhevm.encrypt32(value);

// Encrypt 64-bit values (large numbers like fares)
const encrypted64 = await fhevm.encrypt64(value);

// Generate input proof for multiple values
const inputProof = await fhevm.generateProof([
    encrypted1,
    encrypted2,
    encrypted3
]);
```

### Example: Request Ride
```javascript
async function requestRide(pickupLat, pickupLng, destLat, destLng, maxFare) {
    // Convert to integers (multiply by 1,000,000 for precision)
    const pickupLatInt = Math.floor(pickupLat * 1000000);
    const pickupLngInt = Math.floor(pickupLng * 1000000);
    const destLatInt = Math.floor(destLat * 1000000);
    const destLngInt = Math.floor(destLng * 1000000);

    // Encrypt values
    const encPickupLat = await fhevm.encrypt32(pickupLatInt);
    const encPickupLng = await fhevm.encrypt32(pickupLngInt);
    const encDestLat = await fhevm.encrypt32(destLatInt);
    const encDestLng = await fhevm.encrypt32(destLngInt);
    const encMaxFare = await fhevm.encrypt32(maxFare);

    // Generate proof
    const proof = await fhevm.generateProof([
        encPickupLat,
        encPickupLng,
        encDestLat,
        encDestLng,
        encMaxFare
    ]);

    // Call contract
    const tx = await contract.requestRide(
        encPickupLat,
        encPickupLng,
        encDestLat,
        encDestLng,
        encMaxFare,
        proof
    );
    await tx.wait();
}
```

## Testing Guide

### Test Structure
```javascript
describe("Contract Name", function () {
    let contract, owner, user1, user2;

    beforeEach(async function () {
        // Deploy fresh contract before each test
        [owner, user1, user2] = await ethers.getSigners();
        const Contract = await ethers.getContractFactory("PrivateRideShare");
        contract = await Contract.deploy();
        await contract.waitForDeployment();
    });

    describe("Feature Group", function () {
        it("Should perform expected behavior", async function () {
            // Test implementation
            expect(await contract.someFunction()).to.equal(expectedValue);
        });
    });
});
```

### Common Test Patterns

#### Test Events
```javascript
await expect(contract.someFunction())
    .to.emit(contract, "EventName")
    .withArgs(arg1, arg2);
```

#### Test Reverts
```javascript
await expect(
    contract.someFunction()
).to.be.revertedWith("Error message");
```

#### Test State Changes
```javascript
const before = await contract.someValue();
await contract.changeValue();
const after = await contract.someValue();
expect(after).to.equal(before + 1);
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Contract size under limit (check with contract-sizer)
- [ ] Environment variables configured
- [ ] RPC endpoint working
- [ ] Wallet has sufficient Sepolia ETH

### Deployment
- [ ] Deploy contract to Sepolia
- [ ] Save deployment address
- [ ] Verify contract on Etherscan
- [ ] Test basic functions on testnet

### Post-Deployment
- [ ] Update frontend with new address
- [ ] Test full user flow
- [ ] Add initial pausers if needed
- [ ] Document deployment in README

## Common Issues & Solutions

### Issue: Contract Size Too Large
**Solution**:
- Enable optimizer with higher runs
- Split contract into multiple contracts
- Remove unnecessary functions/variables

### Issue: FHE Initialization Fails
**Solution**:
- Check network connection
- Verify Gateway URL is correct
- Ensure proper CORS headers
- Check browser console for errors

### Issue: Transaction Fails with "Max fare must be positive"
**Solution**:
- Ensure encrypted value is non-zero
- Check encryption is working correctly
- Verify input proof is valid

### Issue: "Contract is paused" Error
**Solution**:
- Check contract pause status
- Ensure you have pauser role to unpause
- Contact contract owner

## Best Practices

### Security
1. Never commit `.env` file
2. Use hardware wallet for mainnet
3. Test thoroughly on testnet first
4. Audit contracts before mainnet deployment
5. Implement timelock for critical changes

### Code Quality
1. Write comprehensive tests (>80% coverage)
2. Use descriptive variable names
3. Add comments for complex logic
4. Follow Solidity style guide
5. Use latest stable compiler version

### Gas Optimization
1. Use `calldata` instead of `memory` for external functions
2. Pack storage variables efficiently
3. Avoid unnecessary storage reads/writes
4. Use events instead of storage for historical data
5. Batch operations when possible

## Resources

### Documentation
- [Zama FHEVM Docs](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)

### Tools
- [Remix IDE](https://remix.ethereum.org/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)
- [MetaMask](https://metamask.io/)

### Community
- [Zama Discord](https://discord.gg/zama)
- [Ethereum Stack Exchange](https://ethereum.stackexchange.com/)
- [Hardhat Discord](https://discord.gg/hardhat)

## Support

For issues and questions:
1. Check this guide first
2. Review IMPLEMENTATION_SUMMARY.md
3. Search existing issues
4. Create new issue with detailed description
5. Join community channels for help

## Contributing

When contributing:
1. Fork the repository
2. Create feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit pull request with description

---

Last Updated: 2025-10-23
Version: 1.0.0
