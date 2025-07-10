const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Helper function to create encrypted inputs for testing
// Note: In production, you would use fhevmjs for real encryption
function createMockEncryptedInput(value) {
  // This is a mock for demonstration. In production use fhevmjs
  return {
    data: ethers.toBeHex(value, 32),
    handles: []
  };
}

async function main() {
  console.log("========================================");
  console.log("🎮 Full Ride Simulation");
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
  const [owner, driver1, driver2, passenger1, passenger2] = await ethers.getSigners();

  console.log("👥 Simulation Accounts:");
  console.log("   Owner:", owner.address);
  console.log("   Driver 1:", driver1.address);
  console.log("   Driver 2:", driver2.address);
  console.log("   Passenger 1:", passenger1.address);
  console.log("   Passenger 2:", passenger2.address);
  console.log("");

  // Attach to deployed contract
  const PrivateRideShare = await ethers.getContractFactory("PrivateRideShare");
  const contract = PrivateRideShare.attach(contractAddress);

  console.log("⚠️  NOTE: This simulation uses mock encrypted values.");
  console.log("   In production, use fhevmjs to create real encrypted inputs.\n");

  // ==========================================
  // STEP 1: REGISTER DRIVERS
  // ==========================================
  console.log("========================================");
  console.log("📝 Step 1: Register Drivers");
  console.log("========================================\n");

  const isDriver1Registered = await contract.registeredDrivers(driver1.address);

  if (!isDriver1Registered) {
    try {
      console.log("⏳ Registering Driver 1...");
      console.log("   Location: (lat: 40.7128, lng: -74.0060) - New York");
      console.log("   Min Fare: $10");

      // Mock encrypted values (in production, use fhevmjs)
      const encryptedLat = createMockEncryptedInput(407128); // 40.7128 * 10000
      const encryptedLng = createMockEncryptedInput(740060); // 74.0060 * 10000
      const encryptedMinFare = createMockEncryptedInput(1000); // $10.00 in cents

      // Note: This will fail on real FHE network without proper encryption
      // For local testing without FHE, you may need to modify the contract
      console.log("   ⚠️  This requires FHE setup. Skipping actual transaction...\n");

      // Uncomment when you have proper FHE setup:
      /*
      const tx = await contract.connect(driver1).registerDriver(
        encryptedLat.data,
        encryptedLng.data,
        encryptedMinFare.data,
        "0x" // input proof placeholder
      );
      await tx.wait();
      console.log("✅ Driver 1 registered successfully");
      console.log("   Transaction Hash:", tx.hash);
      */

    } catch (error) {
      console.log("⚠️  Driver registration skipped (requires FHE setup)");
      console.log("   Error:", error.message.substring(0, 100) + "...");
    }
  } else {
    console.log("✅ Driver 1 already registered");
    const driverInfo = await contract.getDriverInfo(driver1.address);
    console.log("   Available:", driverInfo.isAvailable);
    console.log("   Total Rides:", driverInfo.totalRides.toString());
  }

  console.log("");

  // ==========================================
  // STEP 2: VERIFY DRIVER
  // ==========================================
  console.log("========================================");
  console.log("✔️  Step 2: Verify Driver");
  console.log("========================================\n");

  if (isDriver1Registered) {
    try {
      const driverInfo = await contract.getDriverInfo(driver1.address);

      if (!driverInfo.isVerified) {
        console.log("⏳ Verifying Driver 1...");
        const tx = await contract.connect(owner).verifyDriver(driver1.address);
        await tx.wait();
        console.log("✅ Driver 1 verified successfully");
        console.log("   Transaction Hash:", tx.hash);
      } else {
        console.log("✅ Driver 1 already verified");
      }
    } catch (error) {
      console.log("⚠️  Driver verification failed:", error.message.substring(0, 100));
    }
  } else {
    console.log("⚠️  Cannot verify driver - not registered yet");
  }

  console.log("");

  // ==========================================
  // STEP 3: REQUEST RIDE
  // ==========================================
  console.log("========================================");
  console.log("🚖 Step 3: Request Ride");
  console.log("========================================\n");

  console.log("Passenger 1 requesting a ride:");
  console.log("   Pickup: (lat: 40.7589, lng: -73.9851) - Times Square");
  console.log("   Destination: (lat: 40.7614, lng: -73.9776) - Central Park");
  console.log("   Max Fare: $25");

  try {
    // Mock encrypted values
    const encryptedPickupLat = createMockEncryptedInput(407589);
    const encryptedPickupLng = createMockEncryptedInput(739851);
    const encryptedDestLat = createMockEncryptedInput(407614);
    const encryptedDestLng = createMockEncryptedInput(739776);
    const encryptedMaxFare = createMockEncryptedInput(2500);

    console.log("   ⚠️  This requires FHE setup. Skipping actual transaction...\n");

    // Uncomment when you have proper FHE setup:
    /*
    const tx = await contract.connect(passenger1).requestRide(
      encryptedPickupLat.data,
      encryptedPickupLng.data,
      encryptedDestLat.data,
      encryptedDestLng.data,
      encryptedMaxFare.data,
      "0x" // input proof placeholder
    );
    await tx.wait();
    console.log("✅ Ride requested successfully");
    console.log("   Transaction Hash:", tx.hash);
    console.log("   Ride ID:", (await contract.rideCounter()).toString());
    */

  } catch (error) {
    console.log("⚠️  Ride request skipped (requires FHE setup)");
    console.log("   Error:", error.message.substring(0, 100) + "...");
  }

  console.log("");

  // ==========================================
  // STEP 4: CHECK ACTIVE RIDES
  // ==========================================
  console.log("========================================");
  console.log("📊 Step 4: Check Active Rides");
  console.log("========================================\n");

  try {
    const activeRidesCount = await contract.getActiveRideRequestsCount();
    console.log("✅ Active Ride Requests:", activeRidesCount.toString());

    const availableDriversCount = await contract.getAvailableDriversCount();
    console.log("✅ Available Drivers:", availableDriversCount.toString());

    const passengerHistory = await contract.getPassengerRideHistory(passenger1.address);
    console.log("✅ Passenger 1 total rides:", passengerHistory.length);

    if (passengerHistory.length > 0) {
      const lastRideId = passengerHistory[passengerHistory.length - 1];
      console.log("\n🔍 Last ride details (Ride #" + lastRideId.toString() + "):");

      const rideDetails = await contract.getRideDetails(lastRideId);
      console.log("   Passenger:", rideDetails.passenger);
      console.log("   Matched Driver:", rideDetails.matchedDriver);
      console.log("   Is Active:", rideDetails.isActive);
      console.log("   Is Matched:", rideDetails.isMatched);
    }

  } catch (error) {
    console.log("❌ Error checking active rides:", error.message);
  }

  console.log("");

  // ==========================================
  // STEP 5: DRIVER ACCEPTS RIDE
  // ==========================================
  console.log("========================================");
  console.log("✋ Step 5: Driver Accepts Ride");
  console.log("========================================\n");

  const passengerHistory = await contract.getPassengerRideHistory(passenger1.address);

  if (passengerHistory.length > 0 && isDriver1Registered) {
    try {
      const rideId = passengerHistory[passengerHistory.length - 1];
      const rideDetails = await contract.getRideDetails(rideId);

      if (rideDetails.isActive && !rideDetails.isMatched) {
        console.log("⏳ Driver 1 accepting Ride #" + rideId.toString() + "...");

        const tx = await contract.connect(driver1).acceptRide(rideId);
        await tx.wait();

        console.log("✅ Ride accepted successfully");
        console.log("   Transaction Hash:", tx.hash);
        console.log("   Driver:", driver1.address);
        console.log("   Passenger:", passenger1.address);
      } else {
        console.log("⚠️  Ride already matched or not active");
      }

    } catch (error) {
      console.log("⚠️  Ride acceptance failed:", error.message.substring(0, 100));
    }
  } else {
    console.log("⚠️  No active rides to accept or driver not registered");
  }

  console.log("");

  // ==========================================
  // STEP 6: UPDATE DRIVER LOCATION
  // ==========================================
  console.log("========================================");
  console.log("📍 Step 6: Update Driver Location");
  console.log("========================================\n");

  if (isDriver1Registered) {
    try {
      console.log("⏳ Updating Driver 1 location...");
      console.log("   New Location: (lat: 40.7614, lng: -73.9776) - Arrived at destination");

      const encryptedNewLat = createMockEncryptedInput(407614);
      const encryptedNewLng = createMockEncryptedInput(739776);

      console.log("   ⚠️  This requires FHE setup. Skipping actual transaction...\n");

      // Uncomment when you have proper FHE setup:
      /*
      const tx = await contract.connect(driver1).updateDriverLocation(
        encryptedNewLat.data,
        encryptedNewLng.data,
        "0x" // input proof placeholder
      );
      await tx.wait();
      console.log("✅ Location updated successfully");
      console.log("   Transaction Hash:", tx.hash);
      */

    } catch (error) {
      console.log("⚠️  Location update skipped (requires FHE setup)");
    }
  }

  console.log("");

  // ==========================================
  // STEP 7: COMPLETE RIDE
  // ==========================================
  console.log("========================================");
  console.log("🏁 Step 7: Complete Ride");
  console.log("========================================\n");

  if (passengerHistory.length > 0 && isDriver1Registered) {
    try {
      const rideId = passengerHistory[passengerHistory.length - 1];
      const rideDetails = await contract.getRideDetails(rideId);

      if (rideDetails.isMatched && rideDetails.matchedDriver === driver1.address) {
        console.log("⏳ Completing Ride #" + rideId.toString() + "...");
        console.log("   Final Fare: $18.50");

        const encryptedFinalFare = createMockEncryptedInput(1850);

        console.log("   ⚠️  This requires FHE setup. Skipping actual transaction...\n");

        // Uncomment when you have proper FHE setup:
        /*
        const tx = await contract.connect(driver1).completeRide(
          rideId,
          encryptedFinalFare.data,
          "0x" // input proof placeholder
        );
        await tx.wait();
        console.log("✅ Ride completed successfully");
        console.log("   Transaction Hash:", tx.hash);

        const completedInfo = await contract.getCompletedRideInfo(rideId);
        console.log("   Duration:",
          Math.floor((Number(completedInfo.endTime) - Number(completedInfo.startTime)) / 60),
          "minutes");
        */

      } else {
        console.log("⚠️  Ride not matched or wrong driver");
      }

    } catch (error) {
      console.log("⚠️  Ride completion skipped (requires FHE setup)");
    }
  }

  console.log("");

  // ==========================================
  // STEP 8: SUMMARY
  // ==========================================
  console.log("========================================");
  console.log("📈 Simulation Summary");
  console.log("========================================\n");

  try {
    const rideCounter = await contract.rideCounter();
    const driverCounter = await contract.driverCounter();
    const activeRidesCount = await contract.getActiveRideRequestsCount();
    const availableDriversCount = await contract.getAvailableDriversCount();

    console.log("Contract Statistics:");
    console.log("   Total Rides:", (rideCounter - 1n).toString());
    console.log("   Total Drivers:", driverCounter.toString());
    console.log("   Active Requests:", activeRidesCount.toString());
    console.log("   Available Drivers:", availableDriversCount.toString());

    if (isDriver1Registered) {
      const driverInfo = await contract.getDriverInfo(driver1.address);
      console.log("\nDriver 1 Statistics:");
      console.log("   Total Rides Completed:", driverInfo.totalRides.toString());
      console.log("   Currently Available:", driverInfo.isAvailable);
      console.log("   Verified:", driverInfo.isVerified);
    }

    const passenger1History = await contract.getPassengerRideHistory(passenger1.address);
    console.log("\nPassenger 1 Statistics:");
    console.log("   Total Rides:", passenger1History.length);

  } catch (error) {
    console.log("❌ Error getting summary:", error.message);
  }

  console.log("");

  // ==========================================
  // HELPFUL INFORMATION
  // ==========================================
  console.log("========================================");
  console.log("💡 Important Notes");
  console.log("========================================\n");

  console.log("This simulation demonstrates the complete ride flow:");
  console.log("   1. ✅ Driver registration (requires FHE)");
  console.log("   2. ✅ Driver verification");
  console.log("   3. ✅ Ride request (requires FHE)");
  console.log("   4. ✅ Ride acceptance");
  console.log("   5. ✅ Location updates (requires FHE)");
  console.log("   6. ✅ Ride completion (requires FHE)");

  console.log("\n⚠️  FHE Operations:");
  console.log("   To run this simulation with real encrypted data:");
  console.log("   1. Set up fhevmjs in your frontend");
  console.log("   2. Use proper encryption for all sensitive data");
  console.log("   3. Deploy to Zama devnet or a network with FHE support");

  console.log("\n🔗 Contract Links:");
  if (network.name === "sepolia") {
    console.log(`   Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
  } else if (network.name === "zama") {
    console.log(`   Zama Explorer: https://devnet.zama.ai/address/${contractAddress}`);
  }

  console.log("");
  console.log("========================================");
  console.log("🎉 Simulation Complete!");
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Simulation failed:");
    console.error(error);
    process.exit(1);
  });
