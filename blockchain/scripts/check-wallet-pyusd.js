const hre = require("hardhat");

async function main() {
  // Check for the customer wallet that's trying to buy tickets
  const customerWallet = "0x5326290Ce26e95FD7fdbd7cfdE70d9f35126d5D7";
  
  console.log("Checking PYUSD for CUSTOMER wallet:", customerWallet);

  const PYUSD_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const ESCROW_ADDRESS = "0xBBeBA51A7756C0A23453784f8508200CC821B0e4";

  const pyusd = await hre.ethers.getContractAt(
    [
      "function balanceOf(address) view returns (uint256)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ],
    PYUSD_ADDRESS
  );

  const balance = await pyusd.balanceOf(customerWallet);
  const allowance = await pyusd.allowance(customerWallet, ESCROW_ADDRESS);
  const decimals = await pyusd.decimals();

  console.log("\n💰 PYUSD Status for Customer Wallet:");
  console.log("=====================================");
  console.log("Balance:", hre.ethers.formatUnits(balance, decimals), "PYUSD");
  console.log("Allowance for Escrow:", hre.ethers.formatUnits(allowance, decimals), "PYUSD");
  
  if (balance === 0n) {
    console.log("\n❌ NO PYUSD BALANCE!");
    console.log("\n🎯 Your customer wallet needs PYUSD to buy tickets!");
    console.log("\nOptions:");
    console.log("1. Transfer PYUSD to this wallet: " + customerWallet);
    console.log("2. Get PYUSD from a faucet");
    console.log("3. Use Mock PYUSD for testing (recommended)");
  } else if (allowance === 0n) {
    console.log("\n⚠️ NO ALLOWANCE SET!");
    console.log("Balance exists but needs approval to spend.");
  } else {
    console.log("\n✅ Ready to buy tickets!");
    console.log("Can spend up to:", hre.ethers.formatUnits(allowance, decimals), "PYUSD");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
