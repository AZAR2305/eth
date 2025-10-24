const hre = require("hardhat");

async function main() {
  const customerWallet = "0x5326290Ce26e95FD7fdbd7cfdE70d9f35126d5D7";
  
  const ESCROW_ADDRESS = "0x81f963bc2089f53aF041c64F56df7eB465FADd56";
  const TICKET_NFT_ADDRESS = "0x5efb39f54e0CEC37e83857c4ADa2a4b0Bd0B82c1";
  
  console.log("🎫 Checking tickets for customer:", customerWallet);
  console.log("\n=== PURCHASES (in Escrow) ===");
  
  const escrow = await hre.ethers.getContractAt("TicketEscrow", ESCROW_ADDRESS);
  const purchases = await escrow.getUserPurchases(customerWallet);
  
  if (purchases.length === 0) {
    console.log("❌ No purchases found");
  } else {
    console.log(`Found ${purchases.length} purchase(s):\n`);
    
    for (let i = 0; i < purchases.length; i++) {
      const purchaseId = purchases[i];
      const purchase = await escrow.getPurchase(purchaseId);
      
      console.log(`Purchase #${purchaseId}:`);
      console.log(`  Movie ID: ${purchase.movieId}`);
      console.log(`  Amount: ${hre.ethers.formatUnits(purchase.amount, 6)} PYUSD`);
      console.log(`  Issued: ${purchase.issued}`);
      console.log(`  Timestamp: ${new Date(Number(purchase.timestamp) * 1000).toLocaleString()}`);
      console.log();
    }
  }
  
  console.log("\n=== NFT TICKETS (Minted) ===");
  
  const ticketNFT = await hre.ethers.getContractAt("TicketNFT", TICKET_NFT_ADDRESS);
  const nftBalance = await ticketNFT.balanceOf(customerWallet);
  
  if (nftBalance === 0n) {
    console.log("❌ No NFT tickets minted yet");
  } else {
    console.log(`Found ${nftBalance} NFT ticket(s)`);
    
    const userTickets = await ticketNFT.getUserTickets(customerWallet);
    for (let tokenId of userTickets) {
      const ticket = await ticketNFT.tickets(tokenId);
      const tokenURI = await ticketNFT.tokenURI(tokenId);
      
      console.log(`\nTicket NFT #${tokenId}:`);
      console.log(`  Movie ID: ${ticket.movieId}`);
      console.log(`  Used: ${ticket.used}`);
      console.log(`  Token URI: ${tokenURI}`);
    }
  }
  
  console.log("\n💡 Note: Purchases are created when buying. NFTs are minted when issueTicket() is called.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
