const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Minting test PYUSD to:", deployer.address);

  const PYUSD_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

  // This might not work if PYUSD doesn't have a mint function
  // In that case, you'll need to get it from a faucet or another source
  
  console.log("\n⚠️ PYUSD on Sepolia is a real token.");
  console.log("You need to get it from:");
  console.log("\n1. Circle (if they provide testnet tokens)");
  console.log("2. A Sepolia DEX or faucet");
  console.log("3. Ask in PayPal/Circle developer communities");
  
  console.log("\n💡 ALTERNATIVE: Use a mock PYUSD token!");
  console.log("Do you want me to deploy a mock PYUSD for testing? (y/n)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
