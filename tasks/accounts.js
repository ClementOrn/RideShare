const { task } = require("hardhat/config");

task("accounts", "Prints the list of accounts with their balances")
  .setAction(async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
    const provider = hre.ethers.provider;

    console.log("\n========================================");
    console.log("📋 Available Accounts");
    console.log("========================================\n");

    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      const balance = await provider.getBalance(account.address);
      const balanceInEth = hre.ethers.formatEther(balance);

      console.log(`Account #${i}:`);
      console.log(`  Address: ${account.address}`);
      console.log(`  Balance: ${balanceInEth} ETH`);
      console.log("");
    }

    console.log("========================================\n");
  });

module.exports = {};
