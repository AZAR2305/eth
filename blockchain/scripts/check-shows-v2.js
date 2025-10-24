const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  const MOVIE_MANAGER_ADDRESS = "0xdA9f29795aD5e7BbeA6AeD5151Ff0324Bc7d1804";
  
  const MovieManager = await hre.ethers.getContractAt("MovieManager", MOVIE_MANAGER_ADDRESS);
  
  console.log("\n🎬 V2 SYSTEM CHECK");
  console.log("=".repeat(50));
  
  // Get all movies
  console.log(`\n🎥 MOVIES:`);
  const allMovies = await MovieManager.getAllMovies();
  
  console.log(`\n📊 Overview:`);
  console.log(`   Total Movies: ${allMovies.length}`);
  
  // Get all shows
  const allShows = await MovieManager.getAllShows();
  console.log(`   Total Shows: ${allShows.length}`);
  for (let i = 0; i < allMovies.length; i++) {
    const movie = allMovies[i];
    console.log(`\n   Movie ${i}:`);
    console.log(`      ID: ${movie.id}`);
    console.log(`      Title: ${movie.title}`);
    console.log(`      Age: ${movie.ageRestriction}+`);
    console.log(`      Owner: ${movie.owner}`);
    console.log(`      Active: ${movie.active}`);
    console.log(`      Metadata: ${movie.metadataURI}`);
  }
  
  // Display shows
  console.log(`\n\n🎭 SHOWS:`);
  
  if (allShows.length === 0) {
    console.log(`   ❌ NO SHOWS AVAILABLE!`);
    console.log(`   This is why the customer page is empty.`);
  } else {
    for (let i = 0; i < allShows.length; i++) {
      const show = allShows[i];
      const movie = allMovies.find(m => m.id.toString() === show.movieId.toString());
      
      console.log(`\n   Show ${i}:`);
      console.log(`      Show ID: ${show.id}`);
      console.log(`      Movie ID: ${show.movieId}`);
      console.log(`      Movie Title: ${movie ? movie.title : 'Unknown'}`);
      console.log(`      Showtime: ${new Date(Number(show.showtime) * 1000).toLocaleString()}`);
      console.log(`      Price: ${Number(show.ticketPrice) / 1e6} PYUSD`);
      console.log(`      Seats: ${Number(show.availableSeats)}/${Number(show.totalSeats)}`);
      console.log(`      Active: ${show.active}`);
      console.log(`      URL: http://localhost:3000/movie/${show.id}`);
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
