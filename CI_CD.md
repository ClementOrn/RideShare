# CI/CD Pipeline Documentation

Comprehensive continuous integration and deployment setup for the Private Rideshare Platform.

---

## Table of Contents

1. [Overview](#overview)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Code Quality Checks](#code-quality-checks)
4. [Test Automation](#test-automation)
5. [Deployment Pipeline](#deployment-pipeline)
6. [Configuration](#configuration)
7. [Secrets Management](#secrets-management)
8. [Badges and Status](#badges-and-status)

---

## Overview

The CI/CD pipeline automates testing, quality checks, and deployment processes using GitHub Actions.

### Pipeline Features

- ✅ **Automated Testing** - Runs on every push and PR
- ✅ **Multi-Node Support** - Tests on Node.js 18.x, 20.x, 22.x
- ✅ **Code Quality** - ESLint, Solhint, Prettier, TypeScript
- ✅ **Security Scanning** - npm audit, Snyk integration
- ✅ **Coverage Reports** - Codecov integration
- ✅ **Gas Reporting** - Ethereum gas usage tracking
- ✅ **Automated Deployment** - Vercel for frontend, Sepolia for contracts

---

## GitHub Actions Workflows

### 1. Main CI Pipeline (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**

#### Lint Job
- **Purpose**: Code quality validation
- **Steps**:
  1. Checkout code
  2. Setup Node.js 20.x
  3. Install dependencies
  4. Run ESLint
  5. Run Solhint
  6. Run TypeScript type check

#### Test Job
- **Purpose**: Run test suite across multiple Node versions
- **Matrix**: Node.js 18.x, 20.x, 22.x
- **Steps**:
  1. Checkout code
  2. Setup Node.js (matrix version)
  3. Install dependencies
  4. Compile contracts
  5. Run tests
  6. Generate coverage
  7. Upload to Codecov (Node 20.x only)

#### Build Frontend Job
- **Purpose**: Verify Next.js builds successfully
- **Steps**:
  1. Checkout code
  2. Setup Node.js 20.x
  3. Install dependencies
  4. Build Next.js app
  5. Upload build artifacts

#### Security Audit Job
- **Purpose**: Identify security vulnerabilities
- **Steps**:
  1. Run npm audit
  2. Run Snyk security scan

#### Gas Report Job
- **Purpose**: Track gas usage
- **Steps**:
  1. Generate gas report
  2. Comment on PR with results

---

### 2. Code Quality Workflow (`.github/workflows/code-quality.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests

**Jobs:**

#### Solhint
- Lints Solidity code
- Follows `.solhint.json` rules
- Annotates code with issues

#### Prettier
- Checks code formatting
- Validates consistency

#### ESLint
- Lints JavaScript/TypeScript
- Generates JSON report
- Annotates issues

#### TypeScript Check
- Validates type correctness
- Ensures compilation success

#### Dependency Review
- Reviews dependency changes
- Flags security issues

#### Bundle Size Check
- Measures build size
- Reports to summary

---

### 3. Deployment Workflow (`.github/workflows/deploy.yml`)

**Triggers:**
- Push to `main` branch
- Tags starting with `v*`
- Manual dispatch

**Jobs:**

#### Deploy Frontend
- Builds Next.js application
- Deploys to Vercel
- Sets environment variables

#### Deploy Contracts
- Compiles smart contracts
- Deploys to Sepolia testnet
- Verifies on Etherscan

#### Create Release
- Creates GitHub release
- Generates release notes
- Attaches artifacts

---

## Code Quality Checks

### ESLint Configuration

Next.js ESLint configuration with TypeScript support.

**Running locally:**
```bash
npm run lint
```

### Solhint Configuration

Solidity linting with recommended rules.

**File:** `.solhint.json`

**Key Rules:**
- Compiler version: `^0.8.0`
- Double quotes for strings
- CamelCase for contracts
- Max line length: 120
- Code complexity: 8
- Function max lines: 50

**Running locally:**
```bash
npm run lint:solidity
npm run lint:fix  # Auto-fix issues
```

### Prettier Configuration

Code formatting for consistency.

**File:** `.prettierrc.json`

**Settings:**
- Single quotes for JS/TS
- Double quotes for Solidity
- 2 spaces indent (4 for .sol)
- Semicolons required
- Print width: 100 (120 for .sol)

**Running locally:**
```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

### TypeScript Type Checking

**Running locally:**
```bash
npm run type-check
```

---

## Test Automation

### Test Execution

Tests run automatically on:
- Every push to `main` or `develop`
- All pull requests
- Multiple Node.js versions (18.x, 20.x, 22.x)

**Matrix Testing:**
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]
```

### Coverage Reporting

**Codecov Integration:**
- Automatic upload from Node.js 20.x jobs
- Coverage targets:
  - Project: 80%
  - Patch: 75%
- Comments on PRs with coverage diff

**Configuration:** `codecov.yml`

**Running locally:**
```bash
npm run test:coverage
```

### Gas Reporting

Tracks Ethereum gas usage for contract operations.

**Running locally:**
```bash
npm run test:gas
```

---

## Deployment Pipeline

### Frontend Deployment (Vercel)

**Process:**
1. Build Next.js application
2. Set environment variables
3. Deploy to Vercel
4. Verify deployment

**Requirements:**
- Vercel account
- Vercel token
- Organization ID
- Project ID

### Smart Contract Deployment (Sepolia)

**Process:**
1. Compile contracts
2. Deploy to Sepolia testnet
3. Verify on Etherscan
4. Save deployment artifacts

**Requirements:**
- Sepolia RPC URL
- Private key with Sepolia ETH
- Etherscan API key

---

## Configuration

### Environment Variables

#### Local Development (`.env`)
```bash
# Blockchain
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=your_rpc_url
ETHERSCAN_API_KEY=your_api_key

# Frontend
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5986FF19B524534F159af67f421ca081c6F5Acff
```

#### CI/CD (GitHub Secrets)
```bash
# Deployment
DEPLOYER_PRIVATE_KEY
SEPOLIA_RPC_URL
ETHERSCAN_API_KEY

# Frontend
WALLETCONNECT_PROJECT_ID
CONTRACT_ADDRESS

# Services
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
CODECOV_TOKEN
SNYK_TOKEN
```

---

## Secrets Management

### GitHub Secrets

**Required Secrets:**

#### Blockchain
- `DEPLOYER_PRIVATE_KEY` - Ethereum private key for deployments
- `SEPOLIA_RPC_URL` - Sepolia RPC endpoint
- `ETHERSCAN_API_KEY` - For contract verification

#### Frontend
- `WALLETCONNECT_PROJECT_ID` - WalletConnect project ID
- `CONTRACT_ADDRESS` - Deployed contract address

#### Services
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `CODECOV_TOKEN` - Codecov upload token
- `SNYK_TOKEN` - Snyk security scanning token

### Setting Secrets

**Via GitHub UI:**
1. Go to repository Settings
2. Navigate to Secrets and variables > Actions
3. Click "New repository secret"
4. Add name and value
5. Save

**Via GitHub CLI:**
```bash
gh secret set CODECOV_TOKEN
gh secret set VERCEL_TOKEN
gh secret set DEPLOYER_PRIVATE_KEY
```

---

## Badges and Status

### Status Badges

Add these to your `README.md`:

```markdown
![CI/CD](https://github.com/your-org/private-rideshare-platform/workflows/CI%2FCD%20Pipeline/badge.svg)
![Code Quality](https://github.com/your-org/private-rideshare-platform/workflows/Code%20Quality/badge.svg)
[![codecov](https://codecov.io/gh/your-org/private-rideshare-platform/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/private-rideshare-platform)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

### Coverage Badge

**From Codecov:**
1. Go to Codecov dashboard
2. Navigate to Settings > Badge
3. Copy markdown code
4. Add to README

---

## Running CI Locally

### Full CI Pipeline

```bash
npm run ci
```

This runs:
1. ESLint
2. Solhint
3. TypeScript check
4. Tests

### Individual Checks

```bash
# Linting
npm run lint              # Next.js/TypeScript
npm run lint:solidity     # Solidity

# Formatting
npm run format:check      # Check formatting
npm run format            # Fix formatting

# Type checking
npm run type-check

# Testing
npm test                  # Run tests
npm run test:coverage     # With coverage
npm run test:gas          # With gas report
```

---

## Workflow Examples

### Pull Request Workflow

1. **Developer pushes to PR branch**
2. **CI triggers:**
   - Lint job runs
   - Tests run on Node 18.x, 20.x, 22.x
   - Code quality checks
   - Security audit
   - Bundle size check
3. **Results posted:**
   - Status checks on PR
   - Coverage comment
   - Gas report comment
4. **Review and merge:**
   - All checks must pass
   - Coverage must meet threshold

### Release Workflow

1. **Tag new version:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **CI triggers:**
   - Run all tests
   - Build frontend
   - Deploy to Vercel
   - Deploy contracts to Sepolia
   - Verify on Etherscan
   - Create GitHub release

3. **Verification:**
   - Check Vercel deployment
   - Verify contract on Etherscan
   - Test live application

---

## Troubleshooting

### Common Issues

#### Workflow Fails on Dependencies

**Issue:** `npm ci` fails
**Solution:**
```yaml
- name: Install dependencies
  run: npm ci --legacy-peer-deps
```

#### Test Timeout

**Issue:** Tests take too long
**Solution:** Increase timeout in workflow
```yaml
- name: Run tests
  run: npm test
  timeout-minutes: 20
```

#### Codecov Upload Fails

**Issue:** Coverage not uploading
**Solution:** Check `CODECOV_TOKEN` secret exists

#### Deployment Fails

**Issue:** Vercel deployment error
**Solution:**
1. Verify all secrets are set
2. Check build logs
3. Ensure environment variables are correct

---

## Best Practices

### 1. Keep Workflows Fast
- Cache dependencies
- Run jobs in parallel
- Skip unnecessary steps

### 2. Security
- Never commit secrets
- Use GitHub Secrets
- Rotate tokens regularly

### 3. Testing
- Test locally before pushing
- Run `npm run ci` before PR
- Check coverage reports

### 4. Deployment
- Test on staging first
- Use semantic versioning
- Tag releases properly

---

## Monitoring

### GitHub Actions
- View workflow runs in Actions tab
- Check logs for failures
- Monitor run times

### Codecov
- Track coverage trends
- Review coverage diffs
- Set coverage goals

### Vercel
- Monitor deployment status
- Check build logs
- Review analytics

---

## Resources

### Documentation
- [GitHub Actions](https://docs.github.com/en/actions)
- [Codecov](https://docs.codecov.com/)
- [Vercel](https://vercel.com/docs)
- [Solhint](https://github.com/protofire/solhint)

### Tools
- [act](https://github.com/nektos/act) - Run GitHub Actions locally
- [GitHub CLI](https://cli.github.com/) - Manage secrets
- [Codecov CLI](https://docs.codecov.com/docs/codecov-uploader) - Upload coverage

---

## Summary

✅ **3 GitHub Actions workflows** configured:
- Main CI/CD pipeline with multi-version testing
- Code quality checks with linting
- Deployment automation

✅ **Code quality tools** integrated:
- ESLint for JavaScript/TypeScript
- Solhint for Solidity
- Prettier for formatting
- TypeScript compiler

✅ **Coverage tracking** with Codecov:
- 80% project target
- 75% patch target
- PR comments with diff

✅ **Security scanning**:
- npm audit
- Snyk integration
- Dependency review

✅ **Automated deployment**:
- Vercel for frontend
- Sepolia for smart contracts
- GitHub releases

---

**Last Updated**: 2025-10-24
**CI/CD Platform**: GitHub Actions
**Coverage Service**: Codecov
