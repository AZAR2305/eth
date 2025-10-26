const hre = require("hardhat");

async function main() {
  const TICKET_NFT_ADDRESS = "0x5efb39f54e0CEC37e83857c4ADa2a4b0Bd0B82c1";
  
  console.log("🔍 Checking TicketNFT escrow address...\n");
  
  const ticketNFT = await hre.ethers.getContractAt("TicketNFT", TICKET_NFT_ADDRESS);
  const escrowAddress = await ticketNFT.escrowContract();
  
  console.log("Current escrow address:", escrowAddress);
  console.log("\nExpected addresses:");
  console.log("  Old: 0xBBeBA51A7756C0A23453784f8508200CC821B0e4");
  console.log("  New: 0x81f963bc2089f53aF041c64F56df7eB465FADd56");
  
  if (escrowAddress.toLowerCase() === "0x81f963bc2089f53aF041c64F56df7eB465FADd56".toLowerCase()) {
    console.log("\n✅ Escrow address is correct!");
  } else {
    console.log("\n❌ Escrow address is wrong!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
