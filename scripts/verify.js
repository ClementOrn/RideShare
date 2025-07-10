const { run, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("========================================");
  console.log("🔍 Starting Contract Verification");
  console.log("========================================\n");

  // Load deployment info
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network.name}.json`);

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`❌ Deployment file not found: ${deploymentFile}\nPlease deploy the contract first using: npm run deploy:${network.name}`);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));

  console.log("📋 Verification Configuration:");
  console.log("   Network:", network.name);
  console.log("   Contract:", deploymentInfo.contract);
  console.log("   Address:", deploymentInfo.address);
  console.log("   Deployer:", deploymentInfo.deployer);
  console.log("   Deployed at:", deploymentInfo.timestamp);
  console.log("");

  if (network.name === "hardhat" || network.name === "localhost") {
    console.log("⚠️  Cannot verify on local network");
    console.log("   Please use a public testnet (sepolia) or mainnet");
    return;
  }

  console.log("⏳ Verifying contract on Etherscan...\n");

  try {
    await run("verify:verify", {
      address: deploymentInfo.address,
      constructorArguments: deploymentInfo.constructorArguments || [],
      contract: "contracts/PrivateRideShare.sol:PrivateRideShare"
    });

    console.log("\n✅ Contract verified successfully!\n");

    if (network.name === "sepolia") {
      console.log("🔗 View on Etherscan:");
      console.log(`   https://sepolia.etherscan.io/address/${deploymentInfo.address}#code\n`);
    }

    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verifiedAt = new Date().toISOString();
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Updated deployment info with verification status\n");

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!\n");

      if (network.name === "sepolia") {
        console.log("🔗 View on Etherscan:");
        console.log(`   https://sepolia.etherscan.io/address/${deploymentInfo.address}#code\n`);
      }

      deploymentInfo.verified = true;
      fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    } else if (error.message.includes("does not have bytecode")) {
      console.error("❌ Contract not found at the specified address");
      console.error("   Please check the deployment address is correct\n");
      throw error;
    } else {
      console.error("❌ Verification failed:");
      console.error(error.message);
      console.log("\n💡 Troubleshooting tips:");
      console.log("   1. Make sure ETHERSCAN_API_KEY is set in .env");
      console.log("   2. Wait a few minutes after deployment before verifying");
      console.log("   3. Check that the network configuration is correct");
      console.log("   4. Try manual verification using:");
      console.log(`      npx hardhat verify --network ${network.name} ${deploymentInfo.address}\n`);
      throw error;
    }
  }

  console.log("========================================");
  console.log("🎉 Verification Complete!");
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Verification process failed\n");
    process.exit(1);
  });
