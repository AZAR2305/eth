const hre = require("hardhat");

async function main() {
  const movieManagerAddress = "0x2BC04Cd57B44dA9C7223C17483d74A98c556183D";
  
  console.log("🔍 Checking movies in MovieManager contract...\n");
  
  const MovieManager = await hre.ethers.getContractFactory("MovieManager");
  const movieManager = await MovieManager.attach(movieManagerAddress);
  
  try {
    // Get all movies
    const movies = await movieManager.getAllMovies();
    console.log(`Total movies found: ${movies.length}\n`);
    
    if (movies.length === 0) {
      console.log("❌ NO MOVIES ON BLOCKCHAIN!");
      console.log("\nThis means:");
      console.log("1. The 'Add Movie' button only uploaded to IPFS (off-chain)");
      console.log("2. The blockchain transaction was NOT sent");
      console.log("3. Your wallet was NEVER asked to sign/pay");
    } else {
      console.log("✅ MOVIES ON BLOCKCHAIN:");
      
      for (let i = 0; i < movies.length; i++) {
        const movie = movies[i];
        console.log(`\n--- Movie #${i} ---`);
        console.log(`Title: ${movie.title}`);
        console.log(`Theater Owner: ${movie.theaterOwner}`);
        console.log(`Showtime: ${new Date(Number(movie.showtime) * 1000).toLocaleString()}`);
        console.log(`Price: ${hre.ethers.formatUnits(movie.ticketPrice, 6)} PYUSD`);
        console.log(`Total Seats: ${movie.totalSeats.toString()}`);
        console.log(`Available Seats: ${movie.availableSeats.toString()}`);
        console.log(`Metadata URI: ${movie.metadataURI}`);
        console.log(`Active: ${movie.active}`);
      }
    }
    
    // Check active movies
    console.log("\n\n🎬 Checking active movies...");
    const activeMovies = await movieManager.getActiveMovies();
    console.log(`Active movies: ${activeMovies.length}`);
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
