# Private Ride Share - Next.js Version

A decentralized ride-sharing platform built with Next.js, React, TypeScript, and the Universal FHEVM SDK. This application demonstrates privacy-preserving ride-sharing using Fully Homomorphic Encryption (FHE).

## Features

- **Passenger Features**
  - Request rides with encrypted location data
  - Set maximum fare limits
  - View ride history
  - Track ride status

- **Driver Features**
  - Register as a driver
  - Update location (encrypted)
  - Toggle availability
  - Accept ride requests
  - Complete rides with fare submission
  - View ride history

- **Privacy Features**
  - Fully encrypted location data using FHE
  - Private fare information
  - Secure matching algorithm
  - On-chain encrypted state

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Ethereum, Hardhat
- **FHE**: @fhevm/universal-sdk, @fhevm/solidity
- **Wallet**: ethers.js, MetaMask

## Project Structure

```
PrivateRideShare/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Main page
│   │   ├── providers.tsx      # Context providers
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── Header.tsx         # Header with wallet connection
│   │   ├── PassengerTab.tsx   # Passenger interface
│   │   ├── DriverTab.tsx      # Driver interface
│   │   ├── RidesTab.tsx       # Ride history
│   │   └── RideCard.tsx       # Individual ride card
│   ├── hooks/                 # Custom React hooks
│   │   ├── useWallet.ts       # Wallet connection hook
│   │   └── useRideShare.ts    # Contract interaction hook
│   ├── lib/                   # Utility libraries
│   │   ├── fhevm/
│   │   │   └── client.ts      # FHEVM client wrapper
│   │   └── utils/
│   │       ├── coordinates.ts # Coordinate conversion
│   │       └── format.ts      # Formatting utilities
│   └── types/                 # TypeScript definitions
│       ├── contract.ts        # Contract types
│       ├── rideshare.ts       # Domain types
│       └── global.d.ts        # Global declarations
├── contracts/                 # Solidity contracts
│   └── PrivateRideShare.sol   # Main contract
├── scripts/                   # Deployment scripts
│   └── deploy.js             # Contract deployment
├── public/                    # Static assets
│   └── legacy/               # Old HTML/JS version
├── hardhat.config.js         # Hardhat configuration
├── next.config.js            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── package.json              # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask or another Web3 wallet
- Access to a testnet (e.g., Sepolia)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_GATEWAY_URL=https://gateway.sepolia.zama.ai
```

### Development

1. Compile the smart contracts:
```bash
npm run compile
```

2. Deploy to local network (optional):
```bash
# Terminal 1 - Start local node
npm run node

# Terminal 2 - Deploy contract
npm run deploy
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment

#### Deploy Contract to Sepolia

1. Set your private key in `.env`:
```env
PRIVATE_KEY=your_private_key_here
```

2. Deploy:
```bash
npm run deploy:sepolia
```

3. Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env` with the deployed address

#### Build and Deploy Frontend

1. Build the Next.js app:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

Or deploy to Vercel:
```bash
vercel deploy
```

## Usage

### As a Passenger

1. Connect your wallet
2. Go to the "Passenger" tab
3. Enter pickup and destination coordinates
4. Set maximum fare in Wei
5. Click "Request Ride"
6. Wait for a driver to accept
7. View ride status in "My Rides" tab

### As a Driver

1. Connect your wallet
2. Go to the "Driver" tab
3. Register as a driver with:
   - Initial location (lat/lng)
   - Minimum fare in Wei
4. Toggle availability when ready
5. View and accept available rides
6. Update location as needed
7. Complete rides and submit final fare

## Smart Contract

The `PrivateRideShare` contract handles:

- Driver registration and management
- Ride request creation
- Private matching algorithm
- Encrypted location storage
- Fare verification
- Ride completion and history

See [contracts/PrivateRideShare.sol](contracts/PrivateRideShare.sol) for implementation details.

## FHE Integration

This application uses the Universal FHEVM SDK for:

1. **Client-side encryption**: Encrypt sensitive data before sending to contract
2. **On-chain computation**: Perform calculations on encrypted data
3. **Decryption**: Retrieve and decrypt results when needed

Key encrypted data:
- Pickup and destination coordinates
- Driver locations
- Fare amounts (minimum and maximum)

## Architecture

### State Management

- Wallet state: `useWallet` hook
- Contract state: `useRideShare` hook
- Local state: React hooks (useState, useEffect)

### Data Flow

1. User connects wallet → `useWallet` initializes
2. FHEVM client initializes → Encryption ready
3. User submits data → Encrypted via FHEVM
4. Transaction sent → Contract processes encrypted data
5. Events emitted → UI updates

## Testing

Run contract tests:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

## Troubleshooting

### Common Issues

1. **Wallet not connecting**
   - Ensure MetaMask is installed
   - Check network settings
   - Refresh the page

2. **Contract interaction failing**
   - Verify contract address is correct
   - Check you're on the right network
   - Ensure sufficient gas

3. **FHE encryption errors**
   - Wait for FHEVM client initialization
   - Check gateway URL is accessible
   - Verify network compatibility

## Legacy Version

The original static HTML/JavaScript version is preserved in `public/legacy/` for reference.

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Universal SDK Guide](https://docs.zama.ai/fhevm/guides/sdk)
- [Next.js Documentation](https://nextjs.org/docs)
- [Hardhat Documentation](https://hardhat.org/docs)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions:
- Check existing issues on GitHub
- Review FHEVM documentation
- Join the Zama community Discord
