# Private Rideshare Platform

Modern decentralized rideshare application built with Next.js, TypeScript, and Ethereum.

## 🚀 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript  
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (Headless)
- **Web3**: Wagmi v2 + RainbowKit
- **State Management**: TanStack Query
- **Build**: ESBuild
- **Deployment**: Vercel
- **Network**: Sepolia Testnet

## ✨ Features

- ✅ Wallet Connection (MetaMask, WalletConnect, etc.)
- ✅ Driver Registration
- ✅ Ride Requests
- ✅ Transaction History with Filtering
- ✅ Loading States & Skeletons
- ✅ Error Handling with Retry Logic
- ✅ Responsive Design
- ✅ Type-Safe with TypeScript
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
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run type-check  # Check TypeScript types
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

### Getting Sepolia ETH

- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

### Local Development

1. Install dependencies: `npm install`
2. Set up environment variables
3. Run dev server: `npm run dev`
4. Connect wallet and test features

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://rainbowkit.com/)
- [Radix UI](https://radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel Deployment](https://vercel.com/docs)

## 🤝 Contributing

Contributions welcome! Please read contributing guidelines.

## 📄 License

MIT License

---

**Built with ❤️ using Next.js and Ethereum**
