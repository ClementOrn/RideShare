# Private Rideshare Platform

Modern decentralized rideshare application with **Fully Homomorphic Encryption (FHE)** for privacy-preserving ride matching. Built with Next.js, TypeScript, Ethereum, and Zama's FHEVM technology.

## 🌐 Live Demo

**Frontend**: [https://ride-share-six.vercel.app](https://ride-share-six.vercel.app)

**Smart Contract**: [0x87288E6cEE215e01d2704c0d4d01EAF1d192659d](https://sepolia.etherscan.io/address/0x87288E6cEE215e01d2704c0d4d01EAF1d192659d) (Sepolia Testnet)

**Demo Video**: Download and watch `demo.mp4` from this directory 

## 🚀 Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (Headless)
- **Web3**: Wagmi v2 + RainbowKit
- **State Management**: TanStack Query
- **Build**: ESBuild
- **Deployment**: Vercel

### Blockchain & Smart Contracts
- **Network**: Sepolia Testnet
- **Smart Contracts**: Solidity with Zama FHE library
- **Encryption Library**: Fully Homomorphic Encryption (FHE) via @fhevm/solidity
- **Development Tools**: Hardhat ^2.19.0
- **Web3 Libraries**:
  - Ethers.js ^6.8.0
  - Viem ^2.21.0

### Privacy & Encryption
- **Universal FHEVM SDK**: `@fhevm/universal-sdk` for encryption/decryption operations
- **FHE Capabilities**: Computation on encrypted data (location, fare, user info)
- **Gateway**: Zama Gateway for FHE operations (gateway.sepolia.zama.ai)
- **Fallback Support**: Graceful degradation to fhevmjs when SDK unavailable

## ✨ Features

### Core Functionality
- ✅ Wallet Connection (MetaMask, WalletConnect, etc.)
- ✅ Driver Registration with Encrypted Data
- ✅ Ride Requests with Privacy Protection
- ✅ Transaction History with Filtering
- ✅ Real-time Ride Matching
- ✅ Encrypted Fare Settlement

### Privacy Features (FHE)
- ✅ Location Privacy - Encrypted pickup/destination coordinates
- ✅ Fare Privacy - Confidential price negotiations
- ✅ Identity Protection - Pseudonymous wallet interactions
- ✅ Encrypted State Management - All sensitive data stored encrypted
- ✅ Zero-Knowledge Matching - Driver-passenger matching without data exposure

### Technical Features
- ✅ Loading States & Skeletons
- ✅ Error Handling with Retry Logic
- ✅ Responsive Design
- ✅ Type-Safe with TypeScript
- ✅ Universal FHEVM SDK Integration
- ✅ Production Ready

## 📦 Installation

```bash
# Clone or navigate to project
cd rideshare-platform

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your WalletConnect Project ID
# Get one at: https://cloud.walletconnect.com/

# Run development server
npm run dev
```

Visit http://localhost:3000

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_CONTRACT_ADDRESS=0x87288E6cEE215e01d2704c0d4d01EAF1d192659d
NEXT_PUBLIC_NETWORK=sepolia
```

### Contract Address

**Sepolia Testnet**: `0x87288E6cEE215e01d2704c0d4d01EAF1d192659d`

**Etherscan**: https://sepolia.etherscan.io/address/0x87288E6cEE215e01d2704c0d4d01EAF1d192659d


## 📁 Project Structure

```
rideshare-platform/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   ├── providers.tsx       # Web3 providers
│   ├── driver/
│   │   └── page.tsx        # Driver dashboard
│   ├── passenger/
│   │   └── page.tsx        # Passenger dashboard
│   └── history/
│       └── page.tsx        # Transaction history
├── components/
│   ├── ConnectWallet.tsx   # Wallet button
│   ├── LoadingSpinner.tsx  # Loading states
│   ├── ErrorAlert.tsx      # Error handling
│   └── TransactionHistory.tsx
├── lib/
│   ├── wagmi.ts           # Wagmi config
│   ├── contracts.ts       # Contract ABIs
│   └── utils.ts           # Helpers
├── hooks/
│   ├── useContract.ts     # Contract interactions
│   └── useTransactions.ts # Transaction history
└── types/
    └── index.ts           # TypeScript types
```

## 🎨 UI Components

Using Radix UI for accessible, unstyled components:

- **Dialog**: Modals and overlays
- **Toast**: Notifications
- **Tabs**: Transaction history tabs
- **Alert Dialog**: Error messages
- **Dropdown Menu**: User menu
- **Avatar**: User avatars

## 🔐 Web3 Integration

### Wagmi Configuration

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Private Rideshare Platform',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [sepolia],
  ssr: true,
});
```

### Contract Interaction Example

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

export function useRegisterDriver() {
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const register = async () => {
    await writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'registerDriver',
    });
  };

  return { register, isLoading, isSuccess, hash };
}
```

## 🎯 Key Features Implementation

### 1. Loading States

```typescript
// components/LoadingSpinner.tsx
export function LoadingSpinner({ size = 'md' }) {
  return (
    <div className="animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
  );
}

// Usage with suspense
<Suspense fallback={<LoadingSpinner />}>
  <Component />
</Suspense>
```

### 2. Error Handling

```typescript
// components/ErrorAlert.tsx
import * as AlertDialog from '@radix-ui/react-alert-dialog';

export function ErrorAlert({ error, onRetry }) {
  return (
    <AlertDialog.Root open={!!error}>
      <AlertDialog.Content>
        <AlertDialog.Title>Error</AlertDialog.Title>
        <AlertDialog.Description>{error?.message}</AlertDialog.Description>
        <AlertDialog.Action onClick={onRetry}>Retry</AlertDialog.Action>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
```

### 3. Transaction History

```typescript
// hooks/useTransactions.ts
export function useTransactionHistory() {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [address]);

  return { transactions, loading };
}

// components/TransactionHistory.tsx
import * as Tabs from '@radix-ui/react-tabs';

export function TransactionHistory() {
  const { transactions, loading } = useTransactionHistory();

  return (
    <Tabs.Root defaultValue="all">
      <Tabs.List>
        <Tabs.Trigger value="all">All</Tabs.Trigger>
        <Tabs.Trigger value="rides">Rides</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="all">
        {transactions.map(tx => <TransactionItem key={tx.hash} {...tx} />)}
      </Tabs.Content>
    </Tabs.Root>
  );
}
```

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

### Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "next build",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID": "@walletconnect-id",
    "NEXT_PUBLIC_CONTRACT_ADDRESS": "0x87288E6cEE215e01d2704c0d4d01EAF1d192659d"
  }
}
```

## 📝 Scripts

```bash
# Frontend Development
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run type-check  # Check TypeScript types

# Smart Contract Development
npm run compile     # Compile Solidity contracts
npm run test        # Run contract tests
npm run deploy      # Deploy contracts locally
npm run deploy:sepolia  # Deploy to Sepolia testnet
npm run node        # Start local Hardhat node
npm run clean       # Clean Hardhat artifacts
```

## 🏗 Privacy Architecture

### How FHE Works in This Platform

```
User Browser                    Smart Contract              Zama Gateway
─────────────                  ───────────────             ─────────────

1. User Input
   (Location: 40.7128, -74.0060)
      │
      ▼
2. FHE Encryption
   (Universal SDK)
      │
      ▼
3. Encrypted Data ─────────────▶ Store Encrypted ────────▶ Gateway
   (0x7a8f3b2...)                State (euint32)           Validation
      │                                │                        │
      │                                ▼                        │
      │                         Compute on                      │
      │                         Encrypted Data                  │
      │                         (Matching)                      │
      │                                │                        │
      │                                ▼                        │
4. Request Decrypt ◀──────────── Encrypted Result ◀────────────┘
      │                          (Handle)
      ▼
5. Decrypted Result
   (Matched Driver: 0x123...)
```

### Key Privacy Guarantees

1. **Data Never Exposed**: Location and fare data never transmitted in plaintext
2. **Computation Privacy**: Matching algorithms run on encrypted values
3. **Selective Disclosure**: Only authorized parties can decrypt specific values
4. **Blockchain Transparency**: All operations auditable, but data remains private
5. **Future-Proof Security**: Resistant to quantum computing attacks

## 🔐 FHE Integration

### Universal FHEVM SDK Usage

This platform integrates the Universal FHEVM SDK for privacy-preserving operations:

```typescript
// Initialize Universal SDK client
import { FHEVMClient } from '@fhevm/universal-sdk';

const fhevmClient = new FHEVMClient({
  network: 'sepolia',
  gatewayUrl: "https://gateway.sepolia.zama.ai",
  provider: provider,
  signer: signer
});

// Get contract with SDK wrapper
const contract = fhevmClient.getContract(contractAddress, abi);

// Encrypt values (e.g., location coordinates, fare amounts)
const encryptedLocation = await fhevmClient.encrypt(latitude, 'euint32');
const encryptedFare = await fhevmClient.encrypt(fareAmount, 'euint32');

// Send encrypted data to smart contract
await contract.requestRide(
  encryptedPickupLat,
  encryptedPickupLon,
  encryptedDestLat,
  encryptedDestLon,
  encryptedMaxFare
);

// Decrypt values from contract
const decryptedFare = await fhevmClient.decrypt(fareHandle, 'euint32');
```

### Key FHE Features

1. **Encrypted Location Data**: All coordinates encrypted with FHE
2. **Private Fare Negotiations**: Minimum/maximum fares remain confidential
3. **Secure Matching Algorithm**: Proximity calculations on encrypted data
4. **Zero-Knowledge Proofs**: Verify conditions without revealing data
5. **Fallback Support**: Compatible with fhevmjs for backward compatibility

### Smart Contract Functions

```solidity
// Register as driver with encrypted location and minimum fare
function registerDriver(
  bytes calldata encryptedLat,
  bytes calldata encryptedLon,
  bytes calldata encryptedMinFare
) external;

// Request ride with encrypted pickup/destination and max fare
function requestRide(
  bytes calldata encPickupLat,
  bytes calldata encPickupLon,
  bytes calldata encDestLat,
  bytes calldata encDestLon,
  bytes calldata encMaxFare
) external;

// Update driver location (encrypted)
function updateDriverLocation(
  bytes calldata encryptedLat,
  bytes calldata encryptedLon
) external;

// Accept ride (privacy-preserved matching)
function acceptRide(uint256 rideId) external;

// Complete ride with encrypted fare settlement
function completeRide(uint256 rideId) external;
```

## 🔗 Links

- **Live Demo**: https://rideshare-platform.vercel.app (deploy yours!)
- **Contract**: https://sepolia.etherscan.io/address/0x87288E6cEE215e01d2704c0d4d01EAF1d192659d
- **Documentation**: See `/docs` folder

## 🛠 Development

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask browser extension
- Sepolia ETH (get from faucet)
- Universal FHEVM SDK (`@fhevm/universal-sdk`)
- Hardhat for smart contract development

### Getting Sepolia ETH

- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Add your WalletConnect Project ID and contract address

3. **Compile smart contracts** (optional):
   ```bash
   npm run compile
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Connect wallet and test features**:
   - Switch to Sepolia testnet
   - Test driver registration with FHE encryption
   - Test ride requests with encrypted location data
   - Verify privacy-preserving matching

## 🎬 Demo & Deployment

### Live Application
Visit the deployed application: **[https://ride-share-six.vercel.app](https://ride-share-six.vercel.app)**

Features to try:
- Connect your wallet (MetaMask recommended)
- Switch to Sepolia testnet
- Register as a driver or request a ride as passenger
- View real-time statistics
- Check your transaction history

### Demo Video
Watch `demo.mp4` in this directory for a complete walkthrough of the application.

### Smart Contract
Deployed and verified on Sepolia:
- **Address**: `0x87288E6cEE215e01d2704c0d4d01EAF1d192659d`
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0x87288E6cEE215e01d2704c0d4d01EAF1d192659d)
- **Network**: Sepolia Testnet (Chain ID: 11155111)

### Deployment Platform
- **Platform**: Vercel
- **Build**: Automatic on push
- **Environment**: Production-optimized
- **CDN**: Global edge network

## 📚 Resources

### Frontend & Web3
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://rainbowkit.com/)
- [Radix UI](https://radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel Deployment](https://vercel.com/docs)

### FHE & Privacy
- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Universal FHEVM SDK](https://github.com/zama-ai/fhevm)
- [Zama Gateway](https://gateway.sepolia.zama.ai)
- [FHE Solidity Library](https://github.com/zama-ai/fhevm-solidity)
- [Hardhat Documentation](https://hardhat.org/docs)

## 🔗 Competition Submission

This project includes a **Universal FHEVM SDK** for the FHEVM Competition. See the `fhevm-react-template/` directory for:
- Complete SDK implementation
- Integration examples
- Comprehensive documentation
- API reference

## 🤝 Contributing

Contributions welcome! Please read contributing guidelines.

## 📄 License

MIT License

---

**Built with ❤️ using Next.js and Ethereum**

**Live Demo**: [https://ride-share-six.vercel.app](https://ride-share-six.vercel.app)

**Smart Contract**: [0x87288E6cEE215e01d2704c0d4d01EAF1d192659d](https://sepolia.etherscan.io/address/0x87288E6cEE215e01d2704c0d4d01EAF1d192659d)
