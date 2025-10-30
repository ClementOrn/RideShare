# Private Ride Share Platform

A privacy-preserving ride-sharing platform built with Fully Homomorphic Encryption (FHE) technology and integrated with the **Universal FHEVM SDK**, enabling secure and anonymous transportation services on the blockchain.

## 🔐 Core Concepts

### FHE Anonymous Ride-Sharing System
This platform leverages Fully Homomorphic Encryption to create a trustless ride-sharing ecosystem where sensitive data remains encrypted throughout the entire process. Passengers and drivers can interact without revealing their exact locations, fare preferences, or personal information to other parties.

### Privacy-First Transportation
- **Location Privacy**: Pickup and destination coordinates are encrypted using FHE
- **Fare Privacy**: Maximum and minimum fare preferences remain confidential
- **Identity Protection**: User interactions are pseudonymous through wallet addresses
- **Computational Privacy**: All matching algorithms operate on encrypted data

## 🚗 Features

### For Passengers
- **Anonymous Ride Requests**: Submit encrypted location data for rides
- **Private Fare Bidding**: Set maximum fare limits without revealing the amount
- **Secure Matching**: Get matched with drivers without location exposure
- **Ride History**: Track your transportation history privately

### For Drivers
- **Private Registration**: Register with encrypted location and fare preferences
- **Confidential Availability**: Update location and availability status securely
- **Encrypted Ride Acceptance**: Accept rides based on encrypted proximity calculations
- **Privacy-Preserved Earnings**: Complete rides with encrypted fare settlements

### Smart Contract Features
- **Encrypted State Management**: All sensitive data stored as encrypted values
- **Automatic Matching**: FHE-based algorithms for optimal passenger-driver pairing
- **Dispute Resolution**: On-chain dispute mechanisms for fare disagreements
- **Reputation System**: Track driver verification and ride completion statistics

## 🛠 Technical Architecture

### Blockchain Layer
- **Smart Contract**: Deployed on FHE-enabled blockchain network
- **Encryption**: Zama FHE library for homomorphic computations
- **Storage**: Encrypted user data and ride information on-chain

### Frontend Layer
- **Web3 Integration**: MetaMask wallet connectivity
- **Real-time Updates**: Dynamic interface for ride status tracking
- **Responsive Design**: Mobile-friendly user interface
- **Error Handling**: Comprehensive transaction and encryption error management

### Privacy Technology
- **FHE Operations**: Computation on encrypted location and fare data
- **Universal FHEVM SDK**: Framework-agnostic SDK for encryption/decryption operations
- **Fallback Support**: Graceful degradation to fhevmjs if SDK unavailable
- **Zero-Knowledge Matching**: Drivers and passengers matched without data exposure
- **Encrypted Communications**: All sensitive interactions use homomorphic encryption

## 📋 Contract Information

**Contract Address**: `0x87288E6cEE215e01d2704c0d4d01EAF1d192659d`

### Key Contract Functions
- `registerDriver()`: Register as a driver with encrypted location and fare data
- `requestRide()`: Submit encrypted ride request with pickup/destination
- `acceptRide()`: Accept rides based on encrypted proximity matching
- `completeRide()`: Complete rides with encrypted fare settlement
- `updateDriverLocation()`: Update driver location with encrypted coordinates

## 🎥 Demo & Documentation

### Live Demo
Experience the platform: [https://private-ride-share-hwho.vercel.app/](https://private-ride-share-hwho.vercel.app/)

### Demo Videos
The repository includes demonstration videos showing:
- User registration and wallet connection
- Ride request submission with encrypted locations
- Driver registration and ride acceptance
- Complete ride workflow from request to completion

### On-Chain Transaction Examples
Screenshots of actual blockchain transactions demonstrate:
- Encrypted ride requests on the network
- Driver registration with FHE data
- Ride matching and completion events
- Gas usage patterns for FHE operations

## 🔧 Usage Guide

### Getting Started
1. **Connect Wallet**: Use MetaMask or compatible Web3 wallet
2. **Choose Role**: Select passenger or driver mode
3. **Register/Request**: Submit encrypted data for rides or driver registration

### As a Passenger
1. Enter pickup and destination coordinates
2. Set maximum fare preference
3. Submit encrypted ride request
4. Wait for driver matching
5. Track ride progress

### As a Driver
1. Register with initial location and minimum fare
2. Update location and availability status
3. Browse available ride requests
4. Accept rides based on encrypted proximity
5. Complete rides and receive payment

## 🌟 Innovation Highlights

### Privacy Preservation
- **Zero Data Leakage**: No plain-text location or fare data exposed
- **Trustless Operations**: No central authority can access user data
- **Computational Privacy**: All matching done on encrypted values

### Blockchain Benefits
- **Decentralized**: No single point of failure or control
- **Transparent**: All operations verifiable on-chain
- **Immutable**: Ride history and reputation data permanently recorded
- **Global**: Accessible worldwide without geographic restrictions

### FHE Advantages
- **Real-time Processing**: Encrypted data processed without decryption
- **Scalable Privacy**: Handles multiple users without privacy degradation
- **Future-Proof**: Quantum-resistant encryption methods
- **Verifiable Computation**: All FHE operations publicly auditable

## 🔗 Links

- **GitHub Repository**: [https://github.com/ClementOrn/PrivateRideShare](https://github.com/ClementOrn/PrivateRideShare)
- **Live Platform**: [https://private-ride-share-hwho.vercel.app/](https://private-ride-share-hwho.vercel.app/)
- **Contract Explorer**: View transactions on blockchain explorer using the contract address

## 🏗 Technology Stack

- **Smart Contracts**: Solidity with Zama FHE library
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Blockchain**: Ethereum-compatible FHE network
- **Encryption**: Fully Homomorphic Encryption (FHE)
- **Universal FHEVM SDK**: `@fhevm/universal-sdk` for encryption/decryption operations
- **Web3**: Ethers.js for blockchain interaction
- **Hosting**: Vercel for frontend deployment

## 📦 Universal SDK Integration

This example demonstrates integration with the Universal FHEVM SDK:

### SDK Features Used

```javascript
// Initialize Universal SDK client
const { FHEVMClient } = window.FHEVMUniversalSDK;
this.fhevmClient = new FHEVMClient({
    network: 'sepolia',
    gatewayUrl: "https://gateway.sepolia.zama.ai",
    provider: this.provider,
    signer: this.signer
});

// Get contract with SDK wrapper
this.contract = this.fhevmClient.getContract(contractAddress, abi);

// Encrypt values using SDK
const encrypted = await this.fhevmClient.encrypt(value, 'euint32');

// Decrypt values using SDK
const decrypted = await this.fhevmClient.decrypt(handle, 'euint32');
```

### Fallback Support

The application includes fallback support for fhevmjs when the Universal SDK is not available:

- **Primary**: Uses Universal FHEVM SDK when loaded
- **Fallback**: Uses fhevmjs library for backward compatibility
- **Graceful Degradation**: Works with or without FHE encryption

### SDK Benefits in This Example

1. **Simplified Integration**: Easier encryption/decryption API
2. **Framework Agnostic**: Works in browser environment
3. **Type Safety**: Better TypeScript support
4. **Error Handling**: Comprehensive error messages
5. **Future-Proof**: Easy to upgrade to newer SDK versions

### Installation

For npm/yarn projects:

```bash
npm install @fhevm/universal-sdk
# or
yarn add @fhevm/universal-sdk
```

For browser usage, the SDK can be bundled or loaded via module import.

## 🛡 Security Features

- **End-to-End Encryption**: All sensitive data encrypted from client to contract
- **FHE Computations**: Calculations performed on encrypted data
- **Wallet Security**: Private key management through MetaMask
- **Input Validation**: Comprehensive parameter checking and sanitization
- **Access Controls**: Role-based permissions for different user types

## 🌍 Impact & Vision

This platform demonstrates the potential for privacy-preserving transportation networks that protect user data while maintaining the efficiency and transparency benefits of blockchain technology. By combining FHE with smart contracts, we enable a new paradigm of privacy-first sharing economy applications.

The system serves as a foundation for building trust in decentralized transportation networks, where users can participate without sacrificing personal privacy or location data to centralized platforms.