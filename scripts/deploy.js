const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying PrivateRideShare contract...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance));

  // Deploy the contract
  const PrivateRideShare = await ethers.getContractFactory("PrivateRideShare");
  const privateRideShare = await PrivateRideShare.deploy();

  await privateRideShare.waitForDeployment();

  const contractAddress = await privateRideShare.getAddress();
  console.log("PrivateRideShare deployed to:", contractAddress);

  // Verify the contract if on a testnet
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await privateRideShare.deploymentTransaction().wait(6);

    console.log("Verifying contract...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
    } catch (e) {
      console.log("Verification failed:", e.message);
    }
  }

  console.log("Deployment completed!");
  console.log("Contract address:", contractAddress);
  console.log("Transaction hash:", privateRideShare.deploymentTransaction().hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });