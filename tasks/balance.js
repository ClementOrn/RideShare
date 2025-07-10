const { task } = require("hardhat/config");

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs, hre) => {
    const provider = hre.ethers.provider;
    const balance = await provider.getBalance(taskArgs.account);
    const balanceInEth = hre.ethers.formatEther(balance);

    console.log("\n========================================");
    console.log("💰 Account Balance");
    console.log("========================================\n");
    console.log(`Address: ${taskArgs.account}`);
    console.log(`Balance: ${balanceInEth} ETH`);
    console.log(`Network: ${hre.network.name}`);
    console.log("\n========================================\n");
  });

module.exports = {};
