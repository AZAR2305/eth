const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  console.log("Testing with account:", owner.address);

  const MOVIE_MANAGER = "0xdA9f29795aD5e7BbeA6AeD5151Ff0324Bc7d1804";
  
  const movieManager = await hre.ethers.getContractAt("MovieManager", MOVIE_MANAGER);

  console.log("\n📊 Fetching all movies...");
  const movies = await movieManager.getAllMovies();
  console.log(`Found ${movies.length} movies`);
  
  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    if (movie.active) {
      console.log(`\n🎬 Movie #${movie.id}: ${movie.title}`);
      console.log(`   Age: ${movie.ageRestriction}+ | Owner: ${movie.owner}`);
      
      // Get shows for this movie
      const showIds = await movieManager.getMovieShows(movie.id);
      console.log(`   📅 Shows: ${showIds.length}`);
      
      for (let j = 0; j < showIds.length; j++) {
        const show = await movieManager.getShow(showIds[j]);
        const showtime = new Date(Number(show.showtime) * 1000);
        const price = hre.ethers.formatUnits(show.ticketPrice, 6);
        console.log(`   Show #${show.id}: ${showtime.toLocaleString()} | ${price} PYUSD | ${show.availableSeats}/${show.totalSeats} seats`);
      }
    }
  }
  
  console.log("\n✅ Test complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
