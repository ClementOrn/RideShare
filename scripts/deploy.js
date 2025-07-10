const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("========================================");
  console.log("🚀 Starting PrivateRideShare Deployment");
  console.log("========================================\n");

  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deployment Configuration:");
  console.log("   Network:", network.name);
  console.log("   Chain ID:", network.config.chainId);
  console.log("   Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("   Balance:", ethers.formatEther(balance), "ETH\n");

  // Check balance
  if (balance === 0n) {
    throw new Error("❌ Deployer account has no balance!");
  }

  console.log("📦 Deploying PrivateRideShare contract...\n");

  // Deploy the contract
  const PrivateRideShare = await ethers.getContractFactory("PrivateRideShare");
  const privateRideShare = await PrivateRideShare.deploy();

  await privateRideShare.waitForDeployment();

  const contractAddress = await privateRideShare.getAddress();
  const deploymentTx = privateRideShare.deploymentTransaction();

  console.log("✅ Deployment successful!\n");
  console.log("📄 Contract Details:");
  console.log("   Address:", contractAddress);
  console.log("   Transaction Hash:", deploymentTx.hash);
  console.log("   Block Number:", deploymentTx.blockNumber);
  console.log("   Gas Used:", deploymentTx.gasLimit.toString());

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    contract: "PrivateRideShare",
    address: contractAddress,
    deployer: deployer.address,
    transactionHash: deploymentTx.hash,
    blockNumber: deploymentTx.blockNumber,
    timestamp: new Date().toISOString(),
    constructorArguments: []
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", deploymentFile);

  // Verify the contract if on a testnet
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await deploymentTx.wait(6);

    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (e) {
      if (e.message.includes("Already Verified")) {
        console.log("✅ Contract already verified!");
      } else {
        console.log("⚠️  Verification failed:", e.message);
        console.log("   You can verify manually using:");
        console.log(`   npx hardhat verify --network ${network.name} ${contractAddress}`);
      }
    }
  }

  // Print helpful links
  console.log("\n========================================");
  console.log("🎉 Deployment Complete!");
  console.log("========================================\n");

  if (network.name === "sepolia") {
    console.log("🔗 Useful Links:");
    console.log(`   Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log(`   Transaction: https://sepolia.etherscan.io/tx/${deploymentTx.hash}`);
  } else if (network.name === "zama") {
    console.log("🔗 Useful Links:");
    console.log(`   Zama Explorer: https://devnet.zama.ai/address/${contractAddress}`);
  }

  console.log("\n📝 Next Steps:");
  console.log("   1. Update your frontend config with the contract address");
  console.log("   2. Run 'npm run verify:sepolia' if verification failed");
  console.log("   3. Run 'npm run interact' to test the contract");
  console.log("   4. Run 'npm run simulate' to run a full simulation\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });