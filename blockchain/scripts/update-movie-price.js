const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("🎬 Updating movie price to 1 PYUSD...\n");
  console.log("Theater owner:", deployer.address);

  const MOVIE_MANAGER_ADDRESS = "0x2BC04Cd57B44dA9C7223C17483d74A98c556183D";
  const movieId = 0;
  const newPrice = hre.ethers.parseUnits("1", 6); // 1 PYUSD

  const movieManager = await hre.ethers.getContractAt("MovieManager", MOVIE_MANAGER_ADDRESS);
  
  // Get current movie
  const movie = await movieManager.getMovie(movieId);
  console.log("Current movie:");
  console.log("  Title:", movie.title);
  console.log("  Current Price:", hre.ethers.formatUnits(movie.ticketPrice, 6), "PYUSD");
  console.log("  New Price: 1.0 PYUSD");
  
  // Update movie
  console.log("\n📝 Updating movie...");
  const tx = await movieManager.updateMovie(
    movieId,
    movie.title,
    movie.showtime,
    movie.ageRestriction,
    movie.metadataURI,
    newPrice
  );
  
  await tx.wait();
  console.log("✅ Movie updated!");
  console.log("Transaction:", tx.hash);
  
  // Verify
  const updatedMovie = await movieManager.getMovie(movieId);
  console.log("\n✅ Verified - New price:", hre.ethers.formatUnits(updatedMovie.ticketPrice, 6), "PYUSD");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
