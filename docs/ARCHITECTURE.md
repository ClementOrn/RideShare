# PrivateRideShare Architecture

## Overview

PrivateRideShare is a fully homomorphic encryption (FHE) based ride-sharing smart contract that preserves user privacy while enabling fare matching and transaction settlement.

## Core Architecture

### Gateway Callback Pattern

```
User Request → Contract Records → Gateway Decryption → Callback Settlement
```

**Flow:**
1. Passenger submits encrypted ride request with deposit
2. Driver accepts ride (fare compatibility checked via FHE)
3. Driver completes ride with encrypted final fare
4. Either party requests fare decryption
5. Gateway processes decryption request
6. Callback function receives plaintext and settles transaction

### Security Mechanisms

#### Input Validation
- Fare range validation: `MIN_FARE` to `MAX_FARE`
- Coordinate validation: latitude ≤ 90,000,000, longitude ≤ 180,000,000
- Deposit requirements: minimum 0.001 ETH

#### Access Control
- `onlyOwner`: Admin functions (fee withdrawal, driver verification)
- `onlyRegisteredDriver`: Driver-specific operations
- `onlyActiveRide`: Ride state validation
- Participant checks for decryption requests

#### Overflow Protection
- Uses `unchecked` blocks for gas-optimized loop increments only
- Safe math via Solidity 0.8+ default overflow checks
- Explicit bounds checking for fare calculations

#### Reentrancy Protection
- `nonReentrant` modifier on all ETH transfer functions
- State updates before external calls (CEI pattern)

### Timeout Protection

| Operation | Timeout | Purpose |
|-----------|---------|---------|
| Ride Request | 1 hour | Prevent permanent deposit lock |
| Decryption | 30 minutes | Handle Gateway failures |

### Refund Mechanism

**Scenarios:**
1. **Unmatched ride timeout**: Passenger reclaims deposit
2. **Decryption failure**: Passenger refund after timeout
3. **Driver deposit withdrawal**: After completing first ride

## Privacy Techniques

### Random Multiplier (Division Problem)

```solidity
euint32 randomMultiplier = FHE.asEuint32(uint32(block.timestamp % PRIVACY_MULTIPLIER_RANGE + 1));
euint32 obfuscatedMaxFare = FHE.mul(ride.encryptedMaxFare, randomMultiplier);
```

Prevents exact value inference from comparison results.

### Price Obfuscation

```solidity
euint64 privacyFactor = FHE.asEuint64(uint64(block.timestamp % 100 + 1));
euint64 obfuscatedFare = FHE.mul(encryptedFinalFare, privacyFactor);
```

Stored obfuscated fare prevents side-channel leakage.

## Gas/HCU Optimization

### Strategies Employed

1. **Unchecked loop increments**: Saves ~3 gas per iteration
   ```solidity
   for (uint256 i = 0; i < length;) {
       // ...
       unchecked { ++i; }
   }
   ```

2. **Length caching**: Avoids repeated SLOAD
   ```solidity
   uint256 length = activeRideRequests.length;
   ```

3. **Minimal FHE operations**: Only essential comparisons and arithmetic

4. **Batch allowances**: Grouped `FHE.allowThis()` and `FHE.allow()` calls

### HCU (Homomorphic Compute Unit) Usage

| Operation | HCU Cost | Notes |
|-----------|----------|-------|
| `FHE.mul` | Medium | Used for obfuscation |
| `FHE.ge` | Low | Fare comparison |
| `FHE.add` | Low | Not used frequently |
| `FHE.asEuint*` | Low | Type conversion |

## Data Structures

### PrivateRideRequest
- Passenger encrypted locations and fare
- Deposit tracking for refunds
- Decryption state management

### PrivateDriver
- Encrypted location and minimum fare
- Deposit for accountability
- Service history

### RideMatch
- Encrypted and obfuscated fare storage
- Decryption request tracking
- Refund status

## Event Flow

```
RideRequested → RideMatched → RideCompleted →
FareDecryptionRequested → FareRevealed
```

**Error paths:**
- `TimeoutClaimed`: Unmatched ride timeout
- `RefundProcessed`: Decryption failure
- `FareDispute`: Manual dispute flag

## Security Audit Checklist

- [ ] Verify all ETH transfers use reentrancy protection
- [ ] Check deposit accounting accuracy
- [ ] Validate timeout values for mainnet
- [ ] Review FHE permission grants
- [ ] Test callback signature verification
- [ ] Verify platform fee calculations
