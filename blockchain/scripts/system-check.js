const hre = require("hardhat");
const { parseUnits } = require("ethers");
require('dotenv').config();

async function main() {
  console.log('🔍 COMPLETE SYSTEM CHECK\n');
  console.log('=' .repeat(50));

  const [deployer] = await hre.ethers.getSigners();
  console.log('Your wallet:', deployer.address);
  console.log('');

  // Contract addresses
  const MOVIE_MANAGER = "0xdA9f29795aD5e7BbeA6AeD5151Ff0324Bc7d1804";
  const TICKET_ESCROW = "0x5FC9Df8D5D97AdB2FB9674ea02362cECfF21761A";
  const PYUSD = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

  // 1. CHECK PYUSD BALANCE
  console.log('💰 1. CHECKING PYUSD BALANCE...');
  const pyusd = await hre.ethers.getContractAt("IERC20", PYUSD);
  const balance = await pyusd.balanceOf(deployer.address);
  console.log(`   Balance: ${Number(balance) / 1e6} PYUSD`);
  
  if (balance === 0n) {
    console.log('   ❌ WARNING: You need PYUSD to buy tickets!');
    console.log('   Get PYUSD at: http://localhost:3000/customer/pyusd-setup');
  } else {
    console.log('   ✅ PYUSD balance sufficient');
  }
  console.log('');

  // 2. CHECK THEATER OWNER STATUS
  console.log('🎭 2. CHECKING THEATER OWNER STATUS...');
  const movieManager = await hre.ethers.getContractAt("MovieManager", MOVIE_MANAGER);
  const isTheaterOwner = await movieManager.hasRole(
    await movieManager.THEATER_OWNER_ROLE(),
    deployer.address
  );
  console.log(`   Is Theater Owner: ${isTheaterOwner}`);
  
  if (!isTheaterOwner) {
    console.log('   ❌ You are NOT registered as theater owner!');
    console.log('   Run: npx hardhat run scripts/register-theater-owner.js --network sepolia');
  } else {
    console.log('   ✅ Theater owner registration confirmed');
  }
  console.log('');

  // 3. CHECK MOVIES & SHOWS
  console.log('🎬 3. CHECKING MOVIES & SHOWS...');
  const movieCount = await movieManager.nextMovieId();
  const showCount = await movieManager.nextShowId();
  console.log(`   Total Movies: ${movieCount}`);
  console.log(`   Total Shows: ${showCount}`);

  if (showCount === 0n) {
    console.log('   ⚠️  No shows created yet!');
    console.log('   Add movies and shows at: http://localhost:3000/theater-owner');
  } else {
    console.log('   ✅ Shows available for customers');
    
    // List all shows
    const allShows = await movieManager.getAllShows();
    console.log('\n   📋 AVAILABLE SHOWS:');
    for (let i = 0; i < allShows.length; i++) {
      const show = allShows[i];
      const movie = await movieManager.movies(show.movieId);
      
      console.log(`\n   Show ${show.id}:`);
      console.log(`     Movie: ${movie.title}`);
      console.log(`     Showtime: ${new Date(Number(show.showtime) * 1000).toLocaleString()}`);
      console.log(`     Price: ${Number(show.ticketPrice) / 1e6} PYUSD`);
      console.log(`     Seats: ${show.availableSeats}/${show.totalSeats}`);
      console.log(`     URL: http://localhost:3000/movie/${show.id}`);
    }
  }
  console.log('');

  // 4. CHECK TICKET PURCHASES
  console.log('🎫 4. CHECKING TICKET PURCHASES...');
  const ticketEscrow = await hre.ethers.getContractAt("TicketEscrow", TICKET_ESCROW);
  const purchaseIds = await ticketEscrow.getUserPurchases(deployer.address);
  console.log(`   Your Purchases: ${purchaseIds.length}`);
  
  if (purchaseIds.length === 0) {
    console.log('   📝 No tickets purchased yet');
    console.log('   Buy tickets at: http://localhost:3000/customer');
  } else {
    console.log('   ✅ Tickets purchased');
    
    for (let i = 0; i < purchaseIds.length; i++) {
      const purchase = await ticketEscrow.purchases(purchaseIds[i]);
      console.log(`\n   Purchase ${purchaseIds[i]}:`);
      console.log(`     Show ID: ${purchase.showId}`);
      console.log(`     Amount: ${Number(purchase.amount) / 1e6} PYUSD`);
      console.log(`     Seats: ${purchase.seatNumbers.map(s => s.toString()).join(', ')}`);
      console.log(`     Issued: ${purchase.issued ? 'Yes' : 'No - pending'}`);
    }
  }
  console.log('');

  // 5. SUMMARY
  console.log('=' .repeat(50));
  console.log('📊 SYSTEM STATUS SUMMARY:\n');
  
  const checks = [
    { name: 'PYUSD Balance', status: balance > 0n },
    { name: 'Theater Owner Role', status: isTheaterOwner },
    { name: 'Shows Available', status: showCount > 0n },
    { name: 'Purchases Made', status: purchaseIds.length > 0 }
  ];

  checks.forEach(check => {
    console.log(`   ${check.status ? '✅' : '❌'} ${check.name}`);
  });

  console.log('\n🌐 QUICK LINKS:');
  console.log('   Theater Owner: http://localhost:3000/theater-owner');
  console.log('   Browse Shows: http://localhost:3000/customer');
  console.log('   Get PYUSD: http://localhost:3000/customer/pyusd-setup');
  console.log('   My Tickets: http://localhost:3000/customer/tickets');
  console.log('');
  console.log('=' .repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
