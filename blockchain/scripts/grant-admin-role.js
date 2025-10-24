const hre = require("hardhat");

async function main() {
  const movieManagerAddress = "0x2BC04Cd57B44dA9C7223C17483d74A98c556183D";
  const ticketEscrowAddress = "0x81f963bc2089f53aF041c64F56df7eB465FADd56"; // NEW ESCROW
  
  console.log("🔐 Granting Admin Role to TicketEscrow...\n");
  console.log("MovieManager:", movieManagerAddress);
  console.log("TicketEscrow:", ticketEscrowAddress);
  
  const MovieManager = await hre.ethers.getContractFactory("MovieManager");
  const movieManager = await MovieManager.attach(movieManagerAddress);
  
  try {
    const DEFAULT_ADMIN_ROLE = await movieManager.DEFAULT_ADMIN_ROLE();
    
    // Check if already has role
    const hasRole = await movieManager.hasRole(DEFAULT_ADMIN_ROLE, ticketEscrowAddress);
    
    if (hasRole) {
      console.log("\n✅ TicketEscrow already has admin role!");
    } else {
      console.log("\n⏳ Granting admin role...");
      
      // Get current gas price and add buffer
      const feeData = await hre.ethers.provider.getFeeData();
      const gasPrice = feeData.gasPrice ? (feeData.gasPrice * 150n) / 100n : undefined;
      
      const tx = await movieManager.grantRole(DEFAULT_ADMIN_ROLE, ticketEscrowAddress, {
        gasPrice: gasPrice,
        gasLimit: 100000
      });
      
      console.log("Transaction sent:", tx.hash);
      console.log("Waiting for confirmation...");
      
      await tx.wait();
      console.log("✅ Admin role granted successfully!");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    
    if (error.message.includes("underpriced")) {
      console.log("\n💡 Tip: Network is congested. Wait a few minutes and try again.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
