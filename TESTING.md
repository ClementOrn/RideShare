# Testing Documentation - Private Rideshare Platform

Comprehensive testing guide for the privacy-preserving decentralized rideshare platform.

---

## Table of Contents

1. [Test Overview](#test-overview)
2. [Test Infrastructure](#test-infrastructure)
3. [Running Tests](#running-tests)
4. [Test Suites](#test-suites)
5. [Test Coverage](#test-coverage)
6. [Writing Tests](#writing-tests)
7. [Continuous Integration](#continuous-integration)

---

## Test Overview

### Test Statistics

- **Total Test Cases**: 45+
- **Test Files**: 2
- **Code Coverage Target**: >80%
- **Frameworks**: Hardhat, Mocha, Chai
- **Environments**: Mock (Local) + Sepolia Testnet

### Test Categories

| Category | Test Count | Description |
|----------|------------|-------------|
| Deployment & Initialization | 7 | Contract deployment and initial state |
| Driver Registration | 7 | Driver registration workflow |
| Ride Requests | 6 | Passenger ride request functionality |
| Ride Acceptance | 5 | Driver accepting rides |
| Driver Verification | 4 | Owner verifying drivers |
| Driver Availability | 4 | Driver availability management |
| Access Control | 6 | Permission and authorization |
| Edge Cases | 6 | Boundary conditions and stress tests |
| View Functions | 4 | State query functions |
| Gas Optimization | 3 | Gas usage monitoring |

**Total**: 52 test cases

---

## Test Infrastructure

### Technology Stack

```typescript
{
  "frameworks": {
    "testing": "Hardhat 2.26.0",
    "assertion": "Chai 6.2.0",
    "runner": "Mocha 11.7.4"
  },
  "plugins": {
    "fhevm": "@fhevm/hardhat-plugin",
    "matchers": "@nomicfoundation/hardhat-chai-matchers",
    "helpers": "@nomicfoundation/hardhat-network-helpers",
    "typechain": "@typechain/hardhat",
    "coverage": "solidity-coverage",
    "gasReporter": "hardhat-gas-reporter"
  }
}
```

### File Structure

```
rideshare-platform/
├── test/
│   ├── PrivateRideShare.test.ts         # Mock environment tests (45+ cases)
│   └── PrivateRideShare.sepolia.test.ts # Sepolia testnet tests (7 cases)
├── hardhat.config.ts                     # Test configuration
├── TESTING.md                            # This file
└── package.json                          # Test scripts
```

---

## Running Tests

### Local Mock Environment

```bash
# Run all local tests
npm run test

# Run with gas reporting
npm run test:gas

# Run with coverage report
npm run test:coverage

# Run specific test file
npx hardhat test test/PrivateRideShare.test.ts
```

### Sepolia Testnet

```bash
# Prerequisites: Deploy contract first
npx hardhat deploy --network sepolia

# Run Sepolia tests
npm run test:sepolia

# Or directly
npx hardhat test --network sepolia
```

### Environment Configuration

**Mock Environment** (Default):
- Fast execution
- No gas costs
- Complete test suite
- Runs in < 30 seconds

**Sepolia Testnet**:
- Real network conditions
- Requires Sepolia ETH
- Longer execution time (2-5 minutes)
- Real gas costs

---

## Test Suites

### 1. Deployment and Initialization Tests (7 tests)

**File**: `test/PrivateRideShare.test.ts:42-75`

Tests initial contract state after deployment.

```typescript
describe("Deployment and Initialization", function () {
  it("should deploy successfully with valid contract address");
  it("should have zero ride counter initially");
  it("should have zero driver counter initially");
  it("should have deployer as owner");
  it("should not be paused after deployment");
  it("should have zero active rides initially");
  it("should have zero available drivers initially");
});
```

**Coverage**:
- ✅ Contract address validation
- ✅ Counter initialization
- ✅ Owner assignment
- ✅ Pause state
- ✅ Active rides count
- ✅ Available drivers count

---

### 2. Driver Registration Tests (7 tests)

**File**: `test/PrivateRideShare.test.ts:77-137`

Tests driver registration workflow and validations.

```typescript
describe("Driver Registration", function () {
  it("should allow new driver to register");
  it("should increment driver counter after registration");
  it("should emit DriverRegistered event");
  it("should reject duplicate driver registration");
  it("should allow multiple different drivers to register");
  it("should not increase available drivers count before verification");
});
```

**Scenarios Tested**:
- ✅ Successful registration
- ✅ Counter increments
- ✅ Event emission
- ✅ Duplicate prevention
- ✅ Multiple registrations
- ✅ Availability logic

---

### 3. Ride Request Tests (6 tests)

**File**: `test/PrivateRideShare.test.ts:139-185`

Tests passenger ride request functionality.

```typescript
describe("Ride Requests", function () {
  it("should allow passenger to request ride");
  it("should increment ride counter");
  it("should emit RideRequested event");
  it("should increment active ride requests count");
  it("should allow same passenger to request multiple rides");
  it("should allow multiple passengers to request rides");
});
```

**Coverage**:
- ✅ Single ride request
- ✅ Multiple requests from same user
- ✅ Multiple passengers
- ✅ Counter tracking
- ✅ Event emission

---

### 4. Ride Acceptance Tests (5 tests)

**File**: `test/PrivateRideShare.test.ts:187-241`

Tests driver ride acceptance with permissions.

```typescript
describe("Ride Acceptance", function () {
  it("should allow verified driver to accept ride");
  it("should emit RideAccepted event");
  it("should reject non-registered driver from accepting ride");
  it("should reject unverified driver from accepting ride");
  it("should reject acceptance of non-existent ride");
});
```

**Validations**:
- ✅ Verified driver acceptance
- ✅ Event emission
- ✅ Non-registered rejection
- ✅ Unverified rejection
- ✅ Invalid ride ID handling

---

### 5. Driver Verification Tests (4 tests)

**File**: `test/PrivateRideShare.test.ts:243-279`

Tests owner-only driver verification.

```typescript
describe("Driver Verification", function () {
  it("should allow owner to verify driver");
  it("should emit DriverVerified event");
  it("should reject non-owner from verifying driver");
  it("should reject verification of non-registered driver");
});
```

**Access Control**:
- ✅ Owner verification
- ✅ Event tracking
- ✅ Non-owner rejection
- ✅ Invalid driver handling

---

### 6. Driver Availability Tests (4 tests)

**File**: `test/PrivateRideShare.test.ts:281-317`

Tests driver availability toggle.

```typescript
describe("Driver Availability", function () {
  it("should allow driver to set availability to true");
  it("should allow driver to set availability to false");
  it("should update available drivers count when set to true");
  it("should reject non-registered driver from setting availability");
});
```

---

### 7. Access Control Tests (6 tests)

**File**: `test/PrivateRideShare.test.ts:319-369`

Tests permission system and pause mechanism.

```typescript
describe("Access Control and Permissions", function () {
  it("should reject non-owner from pausing contract");
  it("should allow owner to pause contract");
  it("should reject non-owner from unpausing contract");
  it("should allow owner to unpause contract");
  it("should prevent driver registration when paused");
  it("should prevent ride requests when paused");
});
```

**Security**:
- ✅ Owner-only pause
- ✅ Owner-only unpause
- ✅ Non-owner rejection
- ✅ Paused state enforcement

---

### 8. Edge Cases and Boundary Tests (6 tests)

**File**: `test/PrivateRideShare.test.ts:371-436`

Tests extreme conditions and stress scenarios.

```typescript
describe("Edge Cases and Boundary Conditions", function () {
  it("should handle ride ID 0 correctly");
  it("should handle non-existent driver query");
  it("should handle zero address driver query");
  it("should maintain consistency after multiple operations");
  it("should handle rapid sequential ride requests");
  it("should handle rapid sequential driver registrations");
});
```

**Stress Tests**:
- ✅ Invalid inputs
- ✅ Non-existent entities
- ✅ Zero address
- ✅ Multi-operation consistency
- ✅ 10 rapid requests
- ✅ 10 rapid registrations

---

### 9. View Functions Tests (4 tests)

**File**: `test/PrivateRideShare.test.ts:438-471`

Tests state query functions.

```typescript
describe("View Functions and State Queries", function () {
  it("should return correct driver info for registered driver");
  it("should return correct active ride count");
  it("should return correct available drivers count");
  it("should return correct ride details");
});
```

---

### 10. Gas Optimization Tests (3 tests)

**File**: `test/PrivateRideShare.test.ts:473-507`

Monitors gas usage for key operations.

```typescript
describe("Gas Optimization", function () {
  it("should register driver with reasonable gas cost");     // < 500k gas
  it("should request ride with reasonable gas cost");        // < 500k gas
  it("should verify driver with reasonable gas cost");       // < 300k gas
});
```

**Gas Limits**:
- Driver Registration: < 500,000 gas
- Ride Request: < 500,000 gas
- Driver Verification: < 300,000 gas

---

## Test Coverage

### Running Coverage

```bash
npm run test:coverage
```

### Coverage Reports

Coverage reports are generated in:
- `coverage/` - HTML report
- `coverage.json` - JSON data
- Console output - Summary

### Coverage Targets

| Metric | Target | Current |
|--------|--------|---------|
| Statements | >80% | TBD |
| Branches | >75% | TBD |
| Functions | >90% | TBD |
| Lines | >80% | TBD |

### Viewing Reports

```bash
# Generate and open coverage report
npm run test:coverage
open coverage/index.html    # macOS
start coverage/index.html   # Windows
```

---

## Writing Tests

### Test Structure Template

```typescript
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { PrivateRideShare } from "../typechain-types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

describe("FeatureName", function () {
  let signers: Signers;
  let contract: PrivateRideShare;
  let contractAddress: string;

  async function deployFixture() {
    const factory = await ethers.getContractFactory("PrivateRideShare");
    const deployedContract = await factory.deploy();
    await deployedContract.waitForDeployment();
    const address = await deployedContract.getAddress();
    return { contract: deployedContract, contractAddress: address };
  }

  before(async function () {
    if (!fhevm.isMock) {
      this.skip();
    }
    const ethSigners = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
    };
  });

  beforeEach(async function () {
    ({ contract, contractAddress } = await deployFixture());
  });

  it("should test something", async function () {
    // Arrange
    const value = 100;

    // Act
    const tx = await contract.someFunction(value);
    await tx.wait();

    // Assert
    const result = await contract.getResult();
    expect(result).to.equal(expected);
  });
});
```

### Best Practices

#### 1. Test Naming

```typescript
// ✅ Good - Descriptive
it("should allow owner to verify registered driver");
it("should reject non-owner from pausing contract");
it("should emit RideAccepted event when driver accepts ride");

// ❌ Bad - Unclear
it("test1");
it("works");
it("should pass");
```

#### 2. Assertions

```typescript
// ✅ Good - Specific expectations
expect(counter).to.equal(5);
expect(address).to.be.properAddress;
expect(tx).to.emit(contract, "EventName").withArgs(arg1, arg2);

// ❌ Bad - Vague
expect(result).to.be.ok;
expect(value).to.exist;
```

#### 3. Error Testing

```typescript
// ✅ Good - Test reverts
await expect(
  contract.connect(alice).ownerOnlyFunction()
).to.be.reverted;

// Even better - Test specific error
await expect(
  contract.connect(alice).ownerOnlyFunction()
).to.be.revertedWith("Ownable: caller is not the owner");
```

#### 4. Setup and Teardown

```typescript
// Use beforeEach for fresh state
beforeEach(async function () {
  ({ contract, contractAddress } = await deployFixture());
});

// Use before for one-time setup
before(async function () {
  signers = await getSigners();
});
```

---

## Continuous Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20.x'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Generate coverage
      run: npm run test:coverage

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/coverage-final.json
```

---

## Sepolia Testnet Tests

### Prerequisites

1. **Deploy Contract**:
```bash
npx hardhat deploy --network sepolia
```

2. **Fund Account**:
   - Get Sepolia ETH from faucet: https://sepoliafaucet.com/

3. **Configure Environment**:
```bash
# .env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key_without_0x
```

### Running Sepolia Tests

```bash
npm run test:sepolia
```

### Sepolia Test Output

```
PrivateRideShare - Sepolia Testnet
  ✅ Using deployed contract at: 0x5986FF19B524534F159af67f421ca081c6F5Acff
  📝 Testing with account: 0x...

  Deployment Verification
    1/2 Checking contract address...
    2/2 Verifying contract deployment...
    ✅ should have valid deployed contract (2.1s)

  Read Functions
    1/1 Getting active ride requests count...
    Active Rides: 5
    ✅ should query active ride requests (1.8s)

  Driver Registration on Testnet
    1/4 Checking if already registered...
    2/4 Registering driver on Sepolia...
    3/4 Waiting for transaction confirmation...
    Transaction Hash: 0x...
    Gas Used: 245,123
    4/4 Verifying registration...
    ✅ Driver registration successful!
    ✅ should register driver on Sepolia (45.2s)

  7 passing (65s)
```

---

## Troubleshooting

### Common Issues

#### Issue: "Cannot find module"

```bash
# Solution: Reinstall dependencies
rm -rf node_modules
npm install
```

#### Issue: "Contract not deployed" (Sepolia)

```bash
# Solution: Deploy first
npx hardhat deploy --network sepolia
```

#### Issue: "Insufficient funds"

```bash
# Solution: Get Sepolia ETH
# Visit: https://sepoliafaucet.com/
```

#### Issue: "Test timeout"

```typescript
// Solution: Increase timeout
it("slow test", async function () {
  this.timeout(60000); // 60 seconds
  // ...
});
```

---

## Test Metrics

### Expected Performance

| Environment | Total Time | Tests | Avg per Test |
|-------------|------------|-------|--------------|
| Mock Local  | <30s | 52 | <0.6s |
| Sepolia     | 2-5min | 7 | 15-40s |

### Gas Usage Benchmarks

| Operation | Gas Estimate | Actual (TBD) |
|-----------|--------------|--------------|
| Deploy Contract | ~2,000,000 | - |
| Register Driver | <500,000 | - |
| Request Ride | <500,000 | - |
| Accept Ride | <400,000 | - |
| Verify Driver | <300,000 | - |
| Set Availability | <200,000 | - |

---

## Resources

### Documentation
- [Hardhat Testing](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [Chai Assertions](https://www.chaijs.com/api/bdd/)
- [Mocha Framework](https://mochajs.org/)
- [Zama FHEVM](https://docs.zama.ai/fhevm)

### Test Examples
- Mock Environment: `test/PrivateRideShare.test.ts`
- Sepolia Tests: `test/PrivateRideShare.sepolia.test.ts`

---

## Summary

✅ **52 comprehensive test cases** covering:
- Deployment and initialization
- Driver registration workflow
- Ride request and acceptance
- Access control and permissions
- Edge cases and boundaries
- Gas optimization
- Sepolia testnet integration

🎯 **Coverage targets**: >80% statements, >75% branches, >90% functions

🚀 **Fast execution**: <30 seconds for full mock suite

🔗 **Real network testing**: Sepolia testnet integration

---

**Last Updated**: 2025-10-24
**Test Framework**: Hardhat + Mocha + Chai
**Environment**: Mock (Local) + Sepolia Testnet
