const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log("Checking PYUSD for address:", signer.address);

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

  const balance = await pyusd.balanceOf(signer.address);
  const allowance = await pyusd.allowance(signer.address, ESCROW_ADDRESS);
  const decimals = await pyusd.decimals();

  console.log("\n💰 PYUSD Status:");
  console.log("================");
  console.log("Balance:", hre.ethers.formatUnits(balance, decimals), "PYUSD");
  console.log("Allowance for Escrow:", hre.ethers.formatUnits(allowance, decimals), "PYUSD");
  
  if (balance === 0n) {
    console.log("\n❌ NO PYUSD BALANCE!");
    console.log("You need to get PYUSD from:");
    console.log("1. Sepolia PYUSD Faucet");
    console.log("2. Bridge from another network");
    console.log("3. Swap on a DEX");
  } else if (allowance === 0n) {
    console.log("\n⚠️ NO ALLOWANCE SET!");
    console.log("You need to approve PYUSD spending first.");
  } else {
    console.log("\n✅ Ready to buy tickets!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
