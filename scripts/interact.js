const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("========================================");
  console.log("🔗 Contract Interaction Script");
  console.log("========================================\n");

  // Load deployment info
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network.name}.json`);

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`❌ Deployment file not found: ${deploymentFile}\nPlease deploy the contract first using: npm run deploy:${network.name}`);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.address;

  console.log("📋 Configuration:");
  console.log("   Network:", network.name);
  console.log("   Contract Address:", contractAddress);
  console.log("");

  // Get signers
  const signers = await ethers.getSigners();
  const owner = signers[0];
  const driver1 = signers[1] || owner;
  const driver2 = signers[2] || owner;
  const passenger1 = signers[3] || owner;
  const passenger2 = signers[4] || owner;

  console.log("👥 Available Accounts:");
  console.log("   Owner:", owner.address);
  if (signers.length > 1) {
    console.log("   Driver 1:", driver1.address);
    console.log("   Driver 2:", driver2.address);
    console.log("   Passenger 1:", passenger1.address);
    console.log("   Passenger 2:", passenger2.address);
  } else {
    console.log("   Note: Using single account for all roles (Sepolia network)");
  }
  console.log("");

  // Attach to deployed contract
  const PrivateRideShare = await ethers.getContractFactory("PrivateRideShare");
  const contract = PrivateRideShare.attach(contractAddress);

  // ==========================================
  // CONTRACT STATE QUERIES
  // ==========================================
  console.log("========================================");
  console.log("📊 Querying Contract State");
  console.log("========================================\n");

  try {
    const contractOwner = await contract.owner();
    console.log("✅ Contract Owner:", contractOwner);

    const rideCounter = await contract.rideCounter();
    console.log("✅ Ride Counter:", rideCounter.toString());

    const driverCounter = await contract.driverCounter();
    console.log("✅ Driver Counter:", driverCounter.toString());

    const isPaused = await contract.paused();
    console.log("✅ Contract Paused:", isPaused);

    const activeRidesCount = await contract.getActiveRideRequestsCount();
    console.log("✅ Active Ride Requests:", activeRidesCount.toString());

    const availableDriversCount = await contract.getAvailableDriversCount();
    console.log("✅ Available Drivers:", availableDriversCount.toString());

    console.log("");

  } catch (error) {
    console.error("❌ Error querying contract state:", error.message);
    throw error;
  }

  // ==========================================
  // OWNER FUNCTIONS
  // ==========================================
  console.log("========================================");
  console.log("👑 Testing Owner Functions");
  console.log("========================================\n");

  try {
    // Add a pauser
    console.log("⏳ Adding driver1 as a pauser...");
    const addPauserTx = await contract.connect(owner).addPauser(driver1.address);
    await addPauserTx.wait();
    console.log("✅ Pauser added successfully");
    console.log("   Transaction Hash:", addPauserTx.hash);

    // Check if pauser was added
    const isPauser = await contract.pausers(driver1.address);
    console.log("✅ Driver1 is pauser:", isPauser);
    console.log("");

  } catch (error) {
    console.error("❌ Error in owner functions:", error.message);
  }

  // ==========================================
  // DRIVER INFORMATION
  // ==========================================
  console.log("========================================");
  console.log("🚗 Checking Driver Information");
  console.log("========================================\n");

  try {
    const isDriver1Registered = await contract.registeredDrivers(driver1.address);
    console.log("Driver1 registered:", isDriver1Registered);

    if (isDriver1Registered) {
      const driverInfo = await contract.getDriverInfo(driver1.address);
      console.log("✅ Driver1 Information:");
      console.log("   Available:", driverInfo.isAvailable);
      console.log("   Verified:", driverInfo.isVerified);
      console.log("   Total Rides:", driverInfo.totalRides.toString());
      console.log("   Registration Time:", new Date(Number(driverInfo.registrationTime) * 1000).toISOString());
    }

    console.log("");

  } catch (error) {
    console.error("❌ Error checking driver info:", error.message);
  }

  // ==========================================
  // RIDE INFORMATION
  // ==========================================
  console.log("========================================");
  console.log("🚖 Checking Ride Information");
  console.log("========================================\n");

  try {
    // Get passenger ride history
    const passenger1History = await contract.getPassengerRideHistory(passenger1.address);
    console.log(`📜 Passenger1 ride history (${passenger1History.length} rides):`,
                passenger1History.map(id => id.toString()));

    // Get driver ride history
    const driver1History = await contract.getDriverRideHistory(driver1.address);
    console.log(`📜 Driver1 ride history (${driver1History.length} rides):`,
                driver1History.map(id => id.toString()));

    // If there are rides, get details of the first ride
    if (passenger1History.length > 0) {
      const rideId = passenger1History[0];
      console.log(`\n🔍 Details for Ride #${rideId}:`);

      const rideDetails = await contract.getRideDetails(rideId);
      console.log("   Passenger:", rideDetails.passenger);
      console.log("   Matched Driver:", rideDetails.matchedDriver);
      console.log("   Request Time:", new Date(Number(rideDetails.requestTime) * 1000).toISOString());
      console.log("   Is Active:", rideDetails.isActive);
      console.log("   Is Matched:", rideDetails.isMatched);

      // Check if ride is completed
      try {
        const completedRideInfo = await contract.getCompletedRideInfo(rideId);
        if (completedRideInfo.isCompleted) {
          console.log("\n✅ Ride Completed:");
          console.log("   Start Time:", new Date(Number(completedRideInfo.startTime) * 1000).toISOString());
          console.log("   End Time:", new Date(Number(completedRideInfo.endTime) * 1000).toISOString());
          console.log("   Fare Disputed:", completedRideInfo.fareDisputed);
        }
      } catch (e) {
        console.log("   (Ride not completed yet)");
      }
    }

    console.log("");

  } catch (error) {
    console.error("❌ Error checking ride info:", error.message);
  }

  // ==========================================
  // ETHERSCAN LINKS
  // ==========================================
  if (network.name === "sepolia") {
    console.log("========================================");
    console.log("🔗 Useful Links");
    console.log("========================================\n");
    console.log(`Contract: https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log(`Owner: https://sepolia.etherscan.io/address/${owner.address}`);
    console.log("");
  }

  console.log("========================================");
  console.log("🎉 Interaction Complete!");
  console.log("========================================\n");

  console.log("💡 To test full ride flow, run:");
  console.log("   npm run simulate\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Interaction failed:");
    console.error(error);
    process.exit(1);
  });
