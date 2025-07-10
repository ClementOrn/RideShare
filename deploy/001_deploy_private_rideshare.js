module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("----------------------------------------------------");
  log("Deploying PrivateRideShare contract...");

  const privateRideShare = await deploy("PrivateRideShare", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });

  log(`PrivateRideShare deployed at ${privateRideShare.address}`);
  log("----------------------------------------------------");

  // Verify contract if on testnet
  if (network.name !== "hardhat" && network.name !== "localhost") {
    log("Waiting for block confirmations...");
    await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait 30 seconds

    log("Verifying contract...");
    try {
      await run("verify:verify", {
        address: privateRideShare.address,
        constructorArguments: [],
      });
      log("Contract verified successfully");
    } catch (e) {
      if (e.message.toLowerCase().includes("already verified")) {
        log("Contract already verified");
      } else {
        log("Verification failed:", e.message);
      }
    }
  }

  log("Deployment completed!");
};

module.exports.tags = ["all", "PrivateRideShare"];
