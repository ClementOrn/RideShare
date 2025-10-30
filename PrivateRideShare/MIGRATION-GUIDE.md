# Migration Guide: Static HTML/JS to Next.js

This guide explains the migration from the static HTML/JavaScript application to the modern Next.js/React/TypeScript application.

## Overview

The PrivateRideShare application has been completely rebuilt using modern web technologies while maintaining all original functionality and improving the developer experience.

## What Changed

### Technology Stack

**Before (Static):**
- Plain HTML with inline styles
- Vanilla JavaScript (ES6)
- CDN-loaded libraries (ethers.js, fhevmjs)
- No build system
- No type safety

**After (Next.js):**
- Next.js 14 with App Router
- React 18 with TypeScript
- @fhevm/universal-sdk integration
- Tailwind CSS for styling
- Modern build system with hot reload
- Full TypeScript type safety

### File Structure

**Before:**
```
PrivateRideShare/
├── index.html          # Single HTML file with all UI
├── script.js           # Single JS file with all logic
├── contracts/          # Solidity contracts (unchanged)
├── scripts/            # Deploy scripts (unchanged)
└── hardhat.config.js   # Hardhat config (unchanged)
```

**After:**
```
PrivateRideShare/
├── src/
│   ├── app/            # Next.js pages
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilities
│   └── types/          # TypeScript types
├── contracts/          # Solidity contracts (unchanged)
├── scripts/            # Deploy scripts (unchanged)
├── public/
│   └── legacy/         # Old HTML/JS files (backup)
├── next.config.js      # Next.js configuration
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # Tailwind configuration
├── hardhat.config.js   # Hardhat config (unchanged)
└── package.json        # Updated dependencies
```

## Key Improvements

### 1. Component Architecture

The monolithic HTML/JS has been split into reusable React components:

- **Header.tsx**: Wallet connection and network info
- **PassengerTab.tsx**: Ride request form
- **DriverTab.tsx**: Driver registration and management
- **RidesTab.tsx**: Ride history display
- **RideCard.tsx**: Individual ride information
- **AvailableRides.tsx**: Available rides for drivers

### 2. Custom Hooks

Logic has been extracted into reusable hooks:

- **useWallet**: Wallet connection and state management
- **useRideShare**: Contract interactions and state

### 3. Type Safety

Full TypeScript implementation with:
- Contract ABI types
- Domain types (RideDetails, DriverInfo, etc.)
- Component prop types
- Function signatures

### 4. FHEVM SDK Integration

Replaced direct `fhevmjs` usage with the Universal SDK:

**Before:**
```javascript
const fhevmClient = await createFhevmInstance({
  network: window.ethereum.networkVersion,
  gatewayUrl: "https://gateway.sepolia.zama.ai"
});
```

**After:**
```typescript
import { createFhevmInstance } from '@fhevm/universal-sdk';

const instance = await createFhevmInstance({
  chainId: Number(network.chainId),
  network: 'sepolia',
  gatewayUrl: 'https://gateway.sepolia.zama.ai',
});
```

### 5. State Management

**Before:**
- Global variables
- Direct DOM manipulation
- Manual event listeners

**After:**
- React hooks (useState, useEffect, useCallback)
- Declarative UI updates
- Automatic re-rendering

### 6. Styling

**Before:**
- Inline CSS in HTML
- Manual class toggling

**After:**
- Tailwind CSS utility classes
- Responsive design utilities
- Custom CSS in globals.css
- Consistent design system

## Feature Parity

All features from the original application are preserved:

| Feature | Static Version | Next.js Version | Status |
|---------|----------------|-----------------|--------|
| Wallet Connection | ✓ | ✓ | ✓ Improved |
| Request Ride | ✓ | ✓ | ✓ Same |
| Register Driver | ✓ | ✓ | ✓ Same |
| Update Location | ✓ | ✓ | ✓ Same |
| Toggle Availability | ✓ | ✓ | ✓ Same |
| Accept Ride | ✓ | ✓ | ✓ Same |
| Complete Ride | ✓ | ✓ | ✓ Same |
| View History | ✓ | ✓ | ✓ Improved |
| FHE Encryption | ✓ | ✓ | ✓ SDK-based |

## Migration Benefits

1. **Developer Experience**
   - Hot reload during development
   - TypeScript intellisense
   - Better error messages
   - Modern debugging tools

2. **Performance**
   - Optimized React rendering
   - Code splitting
   - Image optimization
   - Better caching

3. **Maintainability**
   - Modular code structure
   - Reusable components
   - Typed interfaces
   - Better test coverage potential

4. **Scalability**
   - Easy to add new features
   - Component reusability
   - Better state management
   - API routes for backend logic

## Backward Compatibility

The original static HTML/JS version is preserved in `public/legacy/`:
- `public/legacy/index.html`
- `public/legacy/script.js`

You can still access the legacy version if needed, though it's recommended to use the new Next.js version.

## Contract Compatibility

**No changes required to smart contracts or deployment scripts.**

The contract interface remains exactly the same:
- Same ABI
- Same function signatures
- Same events
- Same address

## Getting Started with New Version

1. Install dependencies:
```bash
npm install
```

2. Set up environment:
```bash
cp .env.example .env
# Update .env with your contract address
```

3. Run development server:
```bash
npm run dev
```

4. Open http://localhost:3000

## Common Migration Tasks

### Adding New Features

1. Create component in `src/components/`
2. Create types in `src/types/`
3. Add hook logic in `src/hooks/`
4. Import and use in `src/app/page.tsx`

### Modifying Contract Interactions

1. Update contract ABI in `src/types/contract.ts`
2. Add method to `useRideShare` hook
3. Use method in component

### Styling Changes

1. Use Tailwind classes for most styling
2. Add custom styles to `src/app/globals.css` if needed
3. Modify `tailwind.config.js` for theme customization

## Troubleshooting

### Build Errors

If you encounter build errors:
1. Delete `.next` folder
2. Run `npm install` again
3. Run `npm run build`

### Type Errors

If TypeScript complains:
1. Check `src/types/global.d.ts` for global types
2. Update interfaces in `src/types/`
3. Run `npm run type-check`

### FHEVM SDK Issues

If SDK initialization fails:
1. Check network configuration
2. Verify gateway URL
3. Ensure wallet is connected
4. Check browser console for errors

## Support

For issues specific to the migration:
1. Check this guide first
2. Review the new code structure
3. Compare with legacy version in `public/legacy/`
4. Check Next.js and React documentation

For FHEVM-specific issues:
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Universal SDK Guide](https://docs.zama.ai/fhevm/guides/sdk)

## Next Steps

After migration:
1. Test all features thoroughly
2. Update deployment documentation
3. Train team on new architecture
4. Consider adding tests
5. Set up CI/CD pipeline
