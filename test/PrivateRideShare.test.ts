import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { PrivateRideShare } from "../typechain-types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};

describe("PrivateRideShare", function () {
  let signers: Signers;
  let contract: PrivateRideShare;
  let contractAddress: string;

  async function deployFixture() {
    const factory = await ethers.getContractFactory("PrivateRideShare");
    const deployedContract = await factory.deploy();
    await deployedContract.waitForDeployment();
    const address = await deployedContract.getAddress();

    return { contract: deployedContract as PrivateRideShare, contractAddress: address };
  }

  before(async function () {
    const ethSigners = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
      charlie: ethSigners[3],
    };
  });

  beforeEach(async function () {
    ({ contract, contractAddress } = await deployFixture());
  });

  describe("Deployment and Initialization", function () {
    it("should deploy successfully with valid contract address", async function () {
      expect(contractAddress).to.be.properAddress;
      expect(await contract.getAddress()).to.equal(contractAddress);
    });

    it("should have zero ride counter initially", async function () {
      const rideCounter = await contract.rideCounter();
      expect(rideCounter).to.equal(0);
    });

    it("should have zero driver counter initially", async function () {
      const driverCounter = await contract.driverCounter();
      expect(driverCounter).to.equal(0);
    });

    it("should have deployer as owner", async function () {
      const owner = await contract.owner();
      expect(owner).to.equal(signers.deployer.address);
    });

    it("should not be paused after deployment", async function () {
      const isPaused = await contract.paused();
      expect(isPaused).to.be.false;
    });

    it("should have zero active rides initially", async function () {
      const activeRides = await contract.getActiveRideRequestsCount();
      expect(activeRides).to.equal(0);
    });

    it("should have zero available drivers initially", async function () {
      const availableDrivers = await contract.getAvailableDriversCount();
      expect(availableDrivers).to.equal(0);
    });
  });

  describe("Driver Registration", function () {
    it("should allow new driver to register", async function () {
      const tx = await contract.connect(signers.alice).registerDriver();
      await tx.wait();

      const driverInfo = await contract.getDriverInfo(signers.alice.address);
      expect(driverInfo.isRegistered).to.be.true;
      expect(driverInfo.isVerified).to.be.false;
      expect(driverInfo.isAvailable).to.be.false;
      expect(driverInfo.totalRides).to.equal(0);
    });

    it("should increment driver counter after registration", async function () {
      await contract.connect(signers.alice).registerDriver();
      const driverCounter = await contract.driverCounter();
      expect(driverCounter).to.equal(1);
    });

    it("should emit DriverRegistered event", async function () {
      await expect(contract.connect(signers.alice).registerDriver())
        .to.emit(contract, "DriverRegistered")
        .withArgs(signers.alice.address);
    });

    it("should reject duplicate driver registration", async function () {
      await contract.connect(signers.alice).registerDriver();

      await expect(
        contract.connect(signers.alice).registerDriver()
      ).to.be.reverted;
    });

    it("should allow multiple different drivers to register", async function () {
      await contract.connect(signers.alice).registerDriver();
      await contract.connect(signers.bob).registerDriver();
      await contract.connect(signers.charlie).registerDriver();

      const driverCounter = await contract.driverCounter();
      expect(driverCounter).to.equal(3);

      const aliceInfo = await contract.getDriverInfo(signers.alice.address);
      const bobInfo = await contract.getDriverInfo(signers.bob.address);
      const charlieInfo = await contract.getDriverInfo(signers.charlie.address);

      expect(aliceInfo.isRegistered).to.be.true;
      expect(bobInfo.isRegistered).to.be.true;
      expect(charlieInfo.isRegistered).to.be.true;
    });

    it("should not increase available drivers count before verification", async function () {
      await contract.connect(signers.alice).registerDriver();
      const availableDrivers = await contract.getAvailableDriversCount();
      expect(availableDrivers).to.equal(0);
    });
  });

  describe("Ride Requests", function () {
    it("should allow passenger to request ride", async function () {
      const tx = await contract.connect(signers.bob).requestRide();
      await tx.wait();

      const rideCounter = await contract.rideCounter();
      expect(rideCounter).to.equal(1);
    });

    it("should increment ride counter", async function () {
      await contract.connect(signers.bob).requestRide();
      await contract.connect(signers.charlie).requestRide();

      const rideCounter = await contract.rideCounter();
      expect(rideCounter).to.equal(2);
    });

    it("should emit RideRequested event", async function () {
      await expect(contract.connect(signers.bob).requestRide())
        .to.emit(contract, "RideRequested");
    });

    it("should increment active ride requests count", async function () {
      await contract.connect(signers.bob).requestRide();
      const activeRides = await contract.getActiveRideRequestsCount();
      expect(activeRides).to.equal(1);
    });

    it("should allow same passenger to request multiple rides", async function () {
      await contract.connect(signers.bob).requestRide();
      await contract.connect(signers.bob).requestRide();

      const rideCounter = await contract.rideCounter();
      expect(rideCounter).to.equal(2);
    });

    it("should allow multiple passengers to request rides", async function () {
      await contract.connect(signers.alice).requestRide();
      await contract.connect(signers.bob).requestRide();
      await contract.connect(signers.charlie).requestRide();

      const rideCounter = await contract.rideCounter();
      expect(rideCounter).to.equal(3);

      const activeRides = await contract.getActiveRideRequestsCount();
      expect(activeRides).to.equal(3);
    });
  });

  describe("Ride Acceptance", function () {
    beforeEach(async function () {
      // Register and verify driver
      await contract.connect(signers.alice).registerDriver();
      await contract.connect(signers.deployer).verifyDriver(signers.alice.address);

      // Request ride
      await contract.connect(signers.bob).requestRide();
    });

    it("should allow verified driver to accept ride", async function () {
      const rideId = 1;
      const tx = await contract.connect(signers.alice).acceptRide(rideId);
      await tx.wait();

      const rideDetails = await contract.getRideDetails(rideId);
      expect(rideDetails.driver).to.equal(signers.alice.address);
    });

    it("should emit RideAccepted event", async function () {
      const rideId = 1;
      await expect(contract.connect(signers.alice).acceptRide(rideId))
        .to.emit(contract, "RideAccepted")
        .withArgs(rideId, signers.alice.address);
    });

    it("should reject non-registered driver from accepting ride", async function () {
      const rideId = 1;
      await expect(
        contract.connect(signers.charlie).acceptRide(rideId)
      ).to.be.reverted;
    });

    it("should reject unverified driver from accepting ride", async function () {
      const rideId = 1;
      // Bob is not registered/verified
      await expect(
        contract.connect(signers.bob).acceptRide(rideId)
      ).to.be.reverted;
    });

    it("should reject acceptance of non-existent ride", async function () {
      const nonExistentRideId = 999;
      await expect(
        contract.connect(signers.alice).acceptRide(nonExistentRideId)
      ).to.be.reverted;
    });
  });

  describe("Driver Verification", function () {
    beforeEach(async function () {
      await contract.connect(signers.alice).registerDriver();
    });

    it("should allow owner to verify driver", async function () {
      await contract.connect(signers.deployer).verifyDriver(signers.alice.address);

      const driverInfo = await contract.getDriverInfo(signers.alice.address);
      expect(driverInfo.isVerified).to.be.true;
    });

    it("should emit DriverVerified event", async function () {
      await expect(contract.connect(signers.deployer).verifyDriver(signers.alice.address))
        .to.emit(contract, "DriverVerified")
        .withArgs(signers.alice.address);
    });

    it("should reject non-owner from verifying driver", async function () {
      await expect(
        contract.connect(signers.bob).verifyDriver(signers.alice.address)
      ).to.be.reverted;
    });

    it("should reject verification of non-registered driver", async function () {
      await expect(
        contract.connect(signers.deployer).verifyDriver(signers.bob.address)
      ).to.be.reverted;
    });
  });

  describe("Driver Availability", function () {
    beforeEach(async function () {
      await contract.connect(signers.alice).registerDriver();
      await contract.connect(signers.deployer).verifyDriver(signers.alice.address);
    });

    it("should allow driver to set availability to true", async function () {
      await contract.connect(signers.alice).setDriverAvailability(true);

      const driverInfo = await contract.getDriverInfo(signers.alice.address);
      expect(driverInfo.isAvailable).to.be.true;
    });

    it("should allow driver to set availability to false", async function () {
      await contract.connect(signers.alice).setDriverAvailability(true);
      await contract.connect(signers.alice).setDriverAvailability(false);

      const driverInfo = await contract.getDriverInfo(signers.alice.address);
      expect(driverInfo.isAvailable).to.be.false;
    });

    it("should update available drivers count when set to true", async function () {
      await contract.connect(signers.alice).setDriverAvailability(true);
      const availableDrivers = await contract.getAvailableDriversCount();
      expect(availableDrivers).to.equal(1);
    });

    it("should reject non-registered driver from setting availability", async function () {
      await expect(
        contract.connect(signers.bob).setDriverAvailability(true)
      ).to.be.reverted;
    });
  });

  describe("Access Control and Permissions", function () {
    it("should reject non-owner from pausing contract", async function () {
      await expect(
        contract.connect(signers.alice).pause()
      ).to.be.reverted;
    });

    it("should allow owner to pause contract", async function () {
      await contract.connect(signers.deployer).pause();
      const isPaused = await contract.paused();
      expect(isPaused).to.be.true;
    });

    it("should reject non-owner from unpausing contract", async function () {
      await contract.connect(signers.deployer).pause();

      await expect(
        contract.connect(signers.alice).unpause()
      ).to.be.reverted;
    });

    it("should allow owner to unpause contract", async function () {
      await contract.connect(signers.deployer).pause();
      await contract.connect(signers.deployer).unpause();

      const isPaused = await contract.paused();
      expect(isPaused).to.be.false;
    });

    it("should prevent driver registration when paused", async function () {
      await contract.connect(signers.deployer).pause();

      await expect(
        contract.connect(signers.alice).registerDriver()
      ).to.be.reverted;
    });

    it("should prevent ride requests when paused", async function () {
      await contract.connect(signers.deployer).pause();

      await expect(
        contract.connect(signers.bob).requestRide()
      ).to.be.reverted;
    });
  });

  describe("Edge Cases and Boundary Conditions", function () {
    it("should handle ride ID 0 correctly", async function () {
      await expect(
        contract.getRideDetails(0)
      ).to.be.reverted;
    });

    it("should handle non-existent driver query", async function () {
      const driverInfo = await contract.getDriverInfo(signers.bob.address);
      expect(driverInfo.isRegistered).to.be.false;
      expect(driverInfo.isVerified).to.be.false;
      expect(driverInfo.totalRides).to.equal(0);
    });

    it("should handle zero address driver query", async function () {
      const zeroAddress = ethers.ZeroAddress;
      const driverInfo = await contract.getDriverInfo(zeroAddress);
      expect(driverInfo.isRegistered).to.be.false;
    });

    it("should maintain consistency after multiple operations", async function () {
      // Register 3 drivers
      await contract.connect(signers.alice).registerDriver();
      await contract.connect(signers.bob).registerDriver();
      await contract.connect(signers.charlie).registerDriver();

      // Verify 2 drivers
      await contract.connect(signers.deployer).verifyDriver(signers.alice.address);
      await contract.connect(signers.deployer).verifyDriver(signers.bob.address);

      // Request 2 rides
      await contract.connect(signers.charlie).requestRide();
      await contract.connect(signers.deployer).requestRide();

      // Verify counters
      expect(await contract.driverCounter()).to.equal(3);
      expect(await contract.rideCounter()).to.equal(2);
      expect(await contract.getActiveRideRequestsCount()).to.equal(2);
    });

    it("should handle rapid sequential ride requests", async function () {
      const numRides = 10;

      for (let i = 0; i < numRides; i++) {
        await contract.connect(signers.bob).requestRide();
      }

      const rideCounter = await contract.rideCounter();
      expect(rideCounter).to.equal(numRides);
    });

    it("should handle rapid sequential driver registrations", async function () {
      // Get 10 signers
      const allSigners = await ethers.getSigners();
      const driversToRegister = allSigners.slice(0, 10);

      for (const signer of driversToRegister) {
        await contract.connect(signer).registerDriver();
      }

      const driverCounter = await contract.driverCounter();
      expect(driverCounter).to.equal(10);
    });
  });

  describe("View Functions and State Queries", function () {
    beforeEach(async function () {
      // Setup: Register 2 drivers, verify 1, request 3 rides
      await contract.connect(signers.alice).registerDriver();
      await contract.connect(signers.bob).registerDriver();
      await contract.connect(signers.deployer).verifyDriver(signers.alice.address);
      await contract.connect(signers.alice).setDriverAvailability(true);

      await contract.connect(signers.charlie).requestRide();
      await contract.connect(signers.deployer).requestRide();
      await contract.connect(signers.bob).requestRide();
    });

    it("should return correct driver info for registered driver", async function () {
      const driverInfo = await contract.getDriverInfo(signers.alice.address);
      expect(driverInfo.isRegistered).to.be.true;
      expect(driverInfo.isVerified).to.be.true;
      expect(driverInfo.isAvailable).to.be.true;
    });

    it("should return correct active ride count", async function () {
      const activeRides = await contract.getActiveRideRequestsCount();
      expect(activeRides).to.equal(3);
    });

    it("should return correct available drivers count", async function () {
      const availableDrivers = await contract.getAvailableDriversCount();
      expect(availableDrivers).to.equal(1);
    });

    it("should return correct ride details", async function () {
      const rideId = 1;
      const rideDetails = await contract.getRideDetails(rideId);
      expect(rideDetails.passenger).to.equal(signers.charlie.address);
    });
  });

  describe("Gas Optimization", function () {
    it("should register driver with reasonable gas cost", async function () {
      const tx = await contract.connect(signers.alice).registerDriver();
      const receipt = await tx.wait();

      if (receipt) {
        expect(receipt.gasUsed).to.be.lt(500000); // Less than 500k gas
      }
    });

    it("should request ride with reasonable gas cost", async function () {
      const tx = await contract.connect(signers.bob).requestRide();
      const receipt = await tx.wait();

      if (receipt) {
        expect(receipt.gasUsed).to.be.lt(500000);
      }
    });

    it("should verify driver with reasonable gas cost", async function () {
      await contract.connect(signers.alice).registerDriver();
      const tx = await contract.connect(signers.deployer).verifyDriver(signers.alice.address);
      const receipt = await tx.wait();

      if (receipt) {
        expect(receipt.gasUsed).to.be.lt(300000);
      }
    });
  });
});
