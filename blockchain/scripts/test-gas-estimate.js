const hre = require("hardhat");

async function main() {
  const [customer] = await hre.ethers.getSigners();
  
  const TICKET_ESCROW_ADDRESS = "0x5FC9Df8D5D97AdB2FB9674ea02362cECfF21761A";
  const PYUSD_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  
  const TicketEscrow = await hre.ethers.getContractAt("TicketEscrow", TICKET_ESCROW_ADDRESS);
  const PYUSD = await hre.ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", PYUSD_ADDRESS);
  
  console.log("\n🧪 TESTING buyTicket GAS USAGE");
  console.log("=".repeat(50));
  console.log("Customer:", customer.address);
  console.log("");
  
  // Show ID 0, Seat 1
  const showId = 0;
  const seatNumbers = [1];
  
  // Check current state
  const balance = await PYUSD.balanceOf(customer.address);
  const allowance = await PYUSD.allowance(customer.address, TICKET_ESCROW_ADDRESS);
  
  console.log("💰 Current State:");
  console.log("   PYUSD Balance:", hre.ethers.formatUnits(balance, 6));
  console.log("   Allowance:", hre.ethers.formatUnits(allowance, 6));
  console.log("");
  
  try {
    // Estimate gas
    console.log("⏳ Estimating gas...");
    const estimatedGas = await TicketEscrow.buyTicket.estimateGas(showId, seatNumbers);
    console.log("✅ Estimated Gas:", estimatedGas.toString());
    console.log("");
    
    console.log("💡 Recommended gas limits:");
    console.log("   Minimum:", estimatedGas.toString());
    console.log("   Safe (1.5x):", (estimatedGas * 3n / 2n).toString());
    console.log("   Very Safe (2x):", (estimatedGas * 2n).toString());
    
  } catch (error) {
    console.error("❌ Gas estimation failed!");
    console.error("Error:", error.message);
    console.log("");
    
    // Try to get more details
    if (error.message.includes("revert")) {
      console.log("⚠️ Transaction would revert with error:");
      console.log(error.message);
    } else if (error.message.includes("out of gas")) {
      console.log("⚠️ Transaction would run out of gas");
      console.log("Need more than 300,000 gas");
    }
    
    // Check if it's an allowance issue
    const MOVIE_MANAGER_ADDRESS = "0xdA9f29795aD5e7BbeA6AeD5151Ff0324Bc7d1804";
    const MovieManager = await hre.ethers.getContractAt("MovieManager", MOVIE_MANAGER_ADDRESS);
    const show = await MovieManager.getShow(showId);
    const totalCost = show.ticketPrice * BigInt(seatNumbers.length);
    
    console.log("");
    console.log("🔍 Checking requirements:");
    console.log("   Total Cost:", hre.ethers.formatUnits(totalCost, 6), "PYUSD");
    console.log("   Your Balance:", hre.ethers.formatUnits(balance, 6), "PYUSD");
    console.log("   Current Allowance:", hre.ethers.formatUnits(allowance, 6), "PYUSD");
    console.log("");
    
    if (allowance < totalCost) {
      console.log("❌ PROBLEM: Allowance too low!");
      console.log(`   Need to approve at least ${hre.ethers.formatUnits(totalCost, 6)} PYUSD`);
      console.log("");
      console.log("🔧 FIX: Increase allowance:");
      console.log(`   1. Go to frontend`);
      console.log(`   2. Click "Buy Tickets"`);
      console.log(`   3. Approve higher amount (e.g., 100 PYUSD)`);
      console.log("");
      console.log("   OR run this command:");
      console.log(`   npx hardhat run scripts/approve-pyusd.js --network sepolia`);
    }
  }
  
  console.log("\n" + "=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
