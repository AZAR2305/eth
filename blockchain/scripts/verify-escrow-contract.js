const hre = require("hardhat");

async function main() {
  const ESCROW_ADDRESS = "0x81f963bc2089f53aF041c64F56df7eB465FADd56";
  
  console.log("🔍 Checking contract at:", ESCROW_ADDRESS);
  
  // Get contract code
  const code = await hre.ethers.provider.getCode(ESCROW_ADDRESS);
  
  console.log("\nContract exists:", code !== "0x");
  console.log("Bytecode length:", code.length);
  
  // Try to call buyTicket to see what error we get
  console.log("\n🧪 Testing buyTicket function...");
  
  try {
    const escrow = await hre.ethers.getContractAt("TicketEscrow", ESCROW_ADDRESS);
    
    // Check contract variables
    console.log("\nContract state:");
    const nextPurchaseId = await escrow.nextPurchaseId();
    console.log("  nextPurchaseId:", nextPurchaseId.toString());
    
    const pyusdAddress = await escrow.pyusd();
    console.log("  PYUSD address:", pyusdAddress);
    
    const movieManagerAddress = await escrow.movieManager();
    console.log("  MovieManager address:", movieManagerAddress);
    
    const ticketNFTAddress = await escrow.ticketNFT();
    console.log("  TicketNFT address:", ticketNFTAddress);
    
    console.log("\n✅ Contract is TicketEscrow!");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
