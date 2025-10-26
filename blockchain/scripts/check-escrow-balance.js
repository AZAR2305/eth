const hre = require("hardhat");

async function main() {
  console.log('\n🔍 Checking TicketEscrow PYUSD Balance...\n');

  // Get deployed contract addresses
  const TICKET_ESCROW_ADDRESS = process.env.TICKET_ESCROW_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
  const PYUSD_ADDRESS = process.env.PYUSD_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  // Get contract instances
  const MockPYUSD = await hre.ethers.getContractAt('MockPYUSD', PYUSD_ADDRESS);
  const TicketEscrow = await hre.ethers.getContractAt('TicketEscrow', TICKET_ESCROW_ADDRESS);

  // Get signers
  const [owner, user1] = await hre.ethers.getSigners();

  console.log('📍 Contract Addresses:');
  console.log('   MockPYUSD:', PYUSD_ADDRESS);
  console.log('   TicketEscrow:', TICKET_ESCROW_ADDRESS);
  console.log('   Owner:', owner.address);
  console.log('   User1:', user1.address);
  console.log('');

  // Check PYUSD balances
  const escrowBalance = await MockPYUSD.balanceOf(TICKET_ESCROW_ADDRESS);
  const ownerBalance = await MockPYUSD.balanceOf(owner.address);
  const user1Balance = await MockPYUSD.balanceOf(user1.address);

  console.log('💰 PYUSD Balances:');
  console.log(`   Escrow: ${hre.ethers.formatUnits(escrowBalance, 6)} PYUSD`);
  console.log(`   Owner: ${hre.ethers.formatUnits(ownerBalance, 6)} PYUSD`);
  console.log(`   User1: ${hre.ethers.formatUnits(user1Balance, 6)} PYUSD`);
  console.log('');

  // Check if escrow has enough balance
  if (escrowBalance === 0n) {
    console.log('❌ WARNING: Escrow has ZERO PYUSD balance!');
    console.log('   This means either:');
    console.log('   1. No tickets have been purchased yet');
    console.log('   2. All tickets have been issued (funds transferred to owners)');
    console.log('   3. There is a bug in the buyTicket function');
  } else {
    console.log('✅ Escrow has PYUSD balance - ready to issue tickets');
  }
  console.log('');

  // Get purchase info
  try {
    const userPurchases = await TicketEscrow.getUserPurchases(user1.address);
    console.log(`📋 User1 Purchases: ${userPurchases.length} total`);
    
    if (userPurchases.length > 0) {
      for (let i = 0; i < userPurchases.length; i++) {
        const purchaseId = userPurchases[i];
        const purchase = await TicketEscrow.getPurchase(purchaseId);
        
        console.log(`\n   Purchase #${purchaseId}:`);
        console.log(`      ShowId: ${purchase.showId}`);
        console.log(`      Amount: ${hre.ethers.formatUnits(purchase.amount, 6)} PYUSD`);
        console.log(`      Issued: ${purchase.issued}`);
        console.log(`      Buyer: ${purchase.buyer}`);
        console.log(`      Seats: ${purchase.seatNumbers.map(s => s.toString()).join(', ')}`);
        
        if (!purchase.issued && purchase.amount > escrowBalance) {
          console.log(`      ❌ PROBLEM: Escrow balance (${hre.ethers.formatUnits(escrowBalance, 6)}) < Purchase amount (${hre.ethers.formatUnits(purchase.amount, 6)})`);
          console.log(`         This ticket CANNOT be issued!`);
        } else if (!purchase.issued) {
          console.log(`      ✅ Can be issued - escrow has enough balance`);
        }
      }
    }
  } catch (error) {
    console.log('❌ Error fetching purchases:', error.message);
  }

  console.log('\n✅ Check complete!\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
