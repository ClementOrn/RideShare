# PrivateRideShare API Documentation

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `MIN_FARE` | 100 | Minimum fare in smallest unit |
| `MAX_FARE` | 10,000,000 | Maximum fare |
| `REQUEST_TIMEOUT` | 1 hour | Timeout for ride requests |
| `DECRYPTION_TIMEOUT` | 30 minutes | Timeout for decryption callbacks |
| `MIN_DEPOSIT` | 0.001 ether | Minimum deposit required |
| `PLATFORM_FEE_PERCENT` | 5 | Platform fee percentage |
| `PRIVACY_MULTIPLIER_RANGE` | 1000 | Range for random privacy multiplier |

---

## Driver Functions

### registerDriver

Registers a new driver with encrypted credentials.

```solidity
function registerDriver(
    externalEuint32 _encryptedLat,
    externalEuint32 _encryptedLng,
    externalEuint32 _encryptedMinFare,
    bytes calldata inputProof
) external payable
```

**Parameters:**
- `_encryptedLat`: Encrypted latitude (scaled integer)
- `_encryptedLng`: Encrypted longitude (scaled integer)
- `_encryptedMinFare`: Encrypted minimum fare requirement
- `inputProof`: FHE input proof

**Requirements:**
- `msg.value >= MIN_DEPOSIT`
- Not already registered

**Events:** `DriverRegistered(address driver, uint256 timestamp, uint256 deposit)`

---

### updateDriverLocation

Updates driver's current location.

```solidity
function updateDriverLocation(
    externalEuint32 _encryptedLat,
    externalEuint32 _encryptedLng,
    bytes calldata inputProof
) external
```

**Requirements:**
- Must be registered driver
- Must be available

**Events:** `LocationUpdated(address driver, uint256 timestamp)`

---

### setDriverAvailability

Toggles driver availability status.

```solidity
function setDriverAvailability(bool _available) external
```

---

### withdrawDriverDeposit

Withdraws driver deposit after first completed ride.

```solidity
function withdrawDriverDeposit() external
```

**Requirements:**
- Must have deposit > 0
- Must have completed at least 1 ride

**Events:** `DepositRefunded(address user, uint256 amount)`

---

## Passenger Functions

### requestRide

Creates a new encrypted ride request.

```solidity
function requestRide(
    externalEuint32 _encryptedPickupLat,
    externalEuint32 _encryptedPickupLng,
    externalEuint32 _encryptedDestLat,
    externalEuint32 _encryptedDestLng,
    externalEuint32 _encryptedMaxFare,
    bytes calldata inputProof
) external payable
```

**Parameters:**
- `_encryptedPickupLat/Lng`: Encrypted pickup coordinates
- `_encryptedDestLat/Lng`: Encrypted destination coordinates
- `_encryptedMaxFare`: Maximum fare willing to pay
- `inputProof`: FHE input proof

**Requirements:**
- `msg.value >= MIN_DEPOSIT`

**Returns:** Ride ID via event

**Events:** `RideRequested(uint256 rideId, address passenger, uint256 timestamp, uint256 deposit)`

---

## Ride Lifecycle Functions

### acceptRide

Driver accepts a ride request.

```solidity
function acceptRide(uint256 rideId) external
```

**Requirements:**
- Must be registered driver
- Ride must be active and unmatched
- Driver must be available

**Events:** `RideMatched(uint256 rideId, address passenger, address driver)`

---

### completeRide

Driver marks ride as completed.

```solidity
function completeRide(
    uint256 rideId,
    externalEuint32 _encryptedFinalFare,
    bytes calldata inputProof
) external
```

**Requirements:**
- Must be matched driver
- Ride must be active

**Events:** `RideCompleted(uint256 rideId, address passenger, address driver)`

---

### disputeFare

Raises a fare dispute.

```solidity
function disputeFare(uint256 rideId) external
```

**Requirements:**
- Must be passenger or driver
- Ride must be completed
- Not already disputed

**Events:** `FareDispute(uint256 rideId, address disputer)`

---

## Gateway Callback Functions

### requestFareDecryption

Initiates Gateway decryption of final fare.

```solidity
function requestFareDecryption(uint256 rideId) external
```

**Requirements:**
- Must be passenger or driver
- Ride must be completed
- Not already requested

**Events:** `FareDecryptionRequested(uint256 rideId, uint256 requestId)`

---

### fareDecryptionCallback

Gateway callback for decryption result.

```solidity
function fareDecryptionCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external
```

**Called by:** Gateway relayer only

**Events:** `FareRevealed(uint256 rideId, uint64 revealedFare)`

---

## Timeout & Refund Functions

### claimRideRequestTimeout

Claim refund for unmatched ride after timeout.

```solidity
function claimRideRequestTimeout(uint256 rideId) external
```

**Requirements:**
- Must be passenger
- Ride active but not matched
- `block.timestamp >= requestTime + REQUEST_TIMEOUT`

**Events:** `TimeoutClaimed(uint256 rideId, address claimer, uint256 amount)`

---

### claimDecryptionTimeoutRefund

Claim refund when decryption fails.

```solidity
function claimDecryptionTimeoutRefund(uint256 rideId) external
```

**Requirements:**
- Must be passenger or driver
- Decryption pending
- `block.timestamp >= decryptionRequestTime + DECRYPTION_TIMEOUT`
- Not already refunded

**Events:** `RefundProcessed(uint256 rideId, address recipient, uint256 amount, string reason)`

---

## Admin Functions

### setTesting

Enable/disable testing mode.

```solidity
function setTesting(bool enabled) external
```

**Access:** Owner only

---

### withdrawPlatformFees

Withdraw accumulated platform fees.

```solidity
function withdrawPlatformFees(address to) external
```

**Access:** Owner only

**Events:** `PlatformFeesWithdrawn(address to, uint256 amount)`

---

### verifyDriver

Mark a driver as verified.

```solidity
function verifyDriver(address driverAddress) external
```

**Access:** Owner only

---

## View Functions

### getActiveRideRequestsCount

```solidity
function getActiveRideRequestsCount() external view returns (uint256)
```

### getAvailableDriversCount

```solidity
function getAvailableDriversCount() external view returns (uint256)
```

### getPassengerRideHistory

```solidity
function getPassengerRideHistory(address passenger) external view returns (uint256[] memory)
```

### getDriverRideHistory

```solidity
function getDriverRideHistory(address driver) external view returns (uint256[] memory)
```

### getRideDetails

```solidity
function getRideDetails(uint256 rideId) external view returns (
    address passenger,
    address matchedDriver,
    uint256 requestTime,
    bool isActive,
    bool isMatched,
    uint256 deposit,
    bool decryptionPending
)
```

### getDriverInfo

```solidity
function getDriverInfo(address driverAddress) external view returns (
    bool isAvailable,
    bool isVerified,
    uint256 totalRides,
    uint256 registrationTime,
    uint256 deposit
)
```

### getCompletedRideInfo

```solidity
function getCompletedRideInfo(uint256 rideId) external view returns (
    address passenger,
    address driver,
    uint256 startTime,
    uint256 endTime,
    bool isCompleted,
    bool fareDisputed,
    uint64 revealedFare,
    bool refundProcessed
)
```

### getDecryptionStatus

```solidity
function getDecryptionStatus(uint256 rideId) external view returns (
    uint256 decryptionRequestId,
    bool decryptionPending,
    uint256 decryptionRequestTime,
    bool canClaimTimeout
)
```

---

## Events Reference

| Event | Parameters |
|-------|------------|
| `RideRequested` | rideId, passenger, timestamp, deposit |
| `DriverRegistered` | driver, timestamp, deposit |
| `RideMatched` | rideId, passenger, driver |
| `RideCompleted` | rideId, passenger, driver |
| `LocationUpdated` | driver, timestamp |
| `FareDispute` | rideId, disputer |
| `FareDecryptionRequested` | rideId, requestId |
| `FareRevealed` | rideId, revealedFare |
| `RefundProcessed` | rideId, recipient, amount, reason |
| `TimeoutClaimed` | rideId, claimer, amount |
| `PlatformFeesWithdrawn` | to, amount |
| `DepositRefunded` | user, amount |
