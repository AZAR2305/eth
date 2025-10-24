const hre = require("hardhat");

async function main() {
  const TICKET_NFT_ADDRESS = "0x5efb39f54e0CEC37e83857c4ADa2a4b0Bd0B82c1";
  const NEW_ESCROW_ADDRESS = "0x81f963bc2089f53aF041c64F56df7eB465FADd56";

  console.log("🔧 Setting new TicketEscrow address...");
  
  const ticketNFT = await hre.ethers.getContractAt("TicketNFT", TICKET_NFT_ADDRESS);
  
  const tx = await ticketNFT.setEscrowContract(NEW_ESCROW_ADDRESS);
  await tx.wait();
  
  console.log("✅ Escrow address updated to:", NEW_ESCROW_ADDRESS);
  console.log("Transaction:", tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
