import { expect } from "chai";
import { ethers, fhevm, deployments } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { PrivateRideShare } from "../typechain-types";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("PrivateRideShare - Sepolia Testnet", function () {
  let signers: Signers;
  let contract: PrivateRideShare;
  let contractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`    ${++step}/${steps} ${message}`);
  }

  before(async function () {
    // Only run on Sepolia network
    if (fhevm.isMock) {
      console.warn("⚠️  This test suite can only run on Sepolia Testnet. Skipping mock environment.");
      this.skip();
    }

    try {
      const deployment = await deployments.get("PrivateRideShare");
      contractAddress = deployment.address;
      contract = await ethers.getContractAt("PrivateRideShare", deployment.address) as PrivateRideShare;
      console.log(`✅ Using deployed contract at: ${contractAddress}`);
    } catch (e) {
      const error = e as Error;
      error.message += "\n❌ Contract not deployed. Run: npx hardhat deploy --network sepolia";
      throw error;
    }

    const ethSigners = await ethers.getSigners();
    signers = { alice: ethSigners[0] };

    console.log(`📝 Testing with account: ${signers.alice.address}`);
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  describe("Deployment Verification", function () {
    it("should have valid deployed contract", async function () {
      steps = 2;
      this.timeout(40000);

      progress("Checking contract address...");
      expect(contractAddress).to.be.properAddress;

      progress("Verifying contract deployment...");
      const code = await ethers.provider.getCode(contractAddress);
      expect(code).to.not.equal("0x");
    });

    it("should have correct owner", async function () {
      steps = 1;
      this.timeout(40000);

      progress("Querying contract owner...");
      const owner = await contract.owner();
      expect(owner).to.be.properAddress;
      console.log(`    Owner: ${owner}`);
    });

    it("should return contract state", async function () {
      steps = 3;
      this.timeout(60000);

      progress("Querying ride counter...");
      const rideCounter = await contract.rideCounter();
      console.log(`    Ride Counter: ${rideCounter}`);

      progress("Querying driver counter...");
      const driverCounter = await contract.driverCounter();
      console.log(`    Driver Counter: ${driverCounter}`);

      progress("Querying paused status...");
      const isPaused = await contract.paused();
      console.log(`    Is Paused: ${isPaused}`);
    });
  });

  describe("Read Functions", function () {
    it("should query active ride requests", async function () {
      steps = 1;
      this.timeout(40000);

      progress("Getting active ride requests count...");
      const activeRides = await contract.getActiveRideRequestsCount();
      console.log(`    Active Rides: ${activeRides}`);
      expect(activeRides).to.be.gte(0);
    });

    it("should query available drivers", async function () {
      steps = 1;
      this.timeout(40000);

      progress("Getting available drivers count...");
      const availableDrivers = await contract.getAvailableDriversCount();
      console.log(`    Available Drivers: ${availableDrivers}`);
      expect(availableDrivers).to.be.gte(0);
    });

    it("should query driver information", async function () {
      steps = 1;
      this.timeout(40000);

      progress(`Getting driver info for ${signers.alice.address}...`);
      const driverInfo = await contract.getDriverInfo(signers.alice.address);

      console.log(`    Is Registered: ${driverInfo.isRegistered}`);
      console.log(`    Is Verified: ${driverInfo.isVerified}`);
      console.log(`    Is Available: ${driverInfo.isAvailable}`);
      console.log(`    Total Rides: ${driverInfo.totalRides}`);
    });
  });

  describe("Driver Registration on Testnet", function () {
    it("should register driver on Sepolia", async function () {
      steps = 4;
      this.timeout(160000); // 160 seconds

      progress("Checking if already registered...");
      const beforeInfo = await contract.getDriverInfo(signers.alice.address);

      if (beforeInfo.isRegistered) {
        console.log("    ⚠️  Driver already registered. Skipping registration.");
        return;
      }

      progress("Registering driver on Sepolia...");
      const tx = await contract.connect(signers.alice).registerDriver();

      progress("Waiting for transaction confirmation...");
      const receipt = await tx.wait();
      console.log(`    Transaction Hash: ${receipt?.hash}`);
      console.log(`    Gas Used: ${receipt?.gasUsed}`);

      progress("Verifying registration...");
      const afterInfo = await contract.getDriverInfo(signers.alice.address);
      expect(afterInfo.isRegistered).to.be.true;
      console.log("    ✅ Driver registration successful!");
    });
  });

  describe("Ride Request on Testnet", function () {
    it("should request ride on Sepolia", async function () {
      steps = 4;
      this.timeout(160000); // 160 seconds

      progress("Getting current ride counter...");
      const beforeCounter = await contract.rideCounter();
      console.log(`    Current Ride Counter: ${beforeCounter}`);

      progress("Requesting ride on Sepolia...");
      const tx = await contract.connect(signers.alice).requestRide();

      progress("Waiting for transaction confirmation...");
      const receipt = await tx.wait();
      console.log(`    Transaction Hash: ${receipt?.hash}`);
      console.log(`    Gas Used: ${receipt?.gasUsed}`);

      progress("Verifying ride counter increased...");
      const afterCounter = await contract.rideCounter();
      expect(afterCounter).to.be.gt(beforeCounter);
      console.log(`    New Ride Counter: ${afterCounter}`);
      console.log("    ✅ Ride request successful!");
    });
  });

  describe("State Consistency", function () {
    it("should maintain consistent state across calls", async function () {
      steps = 5;
      this.timeout(100000);

      progress("Query 1: Getting ride counter...");
      const counter1 = await contract.rideCounter();

      progress("Query 2: Getting same counter...");
      const counter2 = await contract.rideCounter();

      progress("Verifying consistency...");
      expect(counter1).to.equal(counter2);

      progress("Query 3: Getting active rides...");
      const activeRides1 = await contract.getActiveRideRequestsCount();

      progress("Query 4: Getting active rides again...");
      const activeRides2 = await contract.getActiveRideRequestsCount();

      expect(activeRides1).to.equal(activeRides2);
      console.log("    ✅ State is consistent!");
    });
  });

  describe("Performance Metrics", function () {
    it("should measure read operation latency", async function () {
      steps = 3;
      this.timeout(60000);

      progress("Measuring getRideCounter latency...");
      const start1 = Date.now();
      await contract.rideCounter();
      const latency1 = Date.now() - start1;
      console.log(`    Latency: ${latency1}ms`);

      progress("Measuring getActiveRideRequestsCount latency...");
      const start2 = Date.now();
      await contract.getActiveRideRequestsCount();
      const latency2 = Date.now() - start2;
      console.log(`    Latency: ${latency2}ms`);

      progress("Measuring getDriverInfo latency...");
      const start3 = Date.now();
      await contract.getDriverInfo(signers.alice.address);
      const latency3 = Date.now() - start3;
      console.log(`    Latency: ${latency3}ms`);

      // All read operations should complete within 10 seconds on testnet
      expect(latency1).to.be.lt(10000);
      expect(latency2).to.be.lt(10000);
      expect(latency3).to.be.lt(10000);
    });
  });
});
