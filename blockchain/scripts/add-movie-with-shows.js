const hre = require("hardhat");
const { parseUnits } = require("ethers");
require('dotenv').config();

async function main() {
  console.log('🎬 Adding Movie with Shows (V2 System)...\n');

  const [deployer] = await hre.ethers.getSigners();
  console.log('Your wallet:', deployer.address);

  const MOVIE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_MOVIE_MANAGER_ADDRESS || "0xdA9f29795aD5e7BbeA6AeD5151Ff0324Bc7d1804";
  console.log('MovieManager:', MOVIE_MANAGER_ADDRESS);
  
  const MovieManager = await hre.ethers.getContractAt(
    'MovieManager',
    MOVIE_MANAGER_ADDRESS
  );

  // Step 1: Add Movie (just metadata template)
  console.log('\n📝 Step 1: Adding movie metadata...');
  const movieTitle = "GOAT";
  const ageRestriction = 0; // 0 = No restriction
  const metadataURI = "ipfs://QmWTTtcDujabewS8SbJZx9xHkkA8LGjTSnXkNbHUGHEbyi";

  const addMovieTx = await MovieManager.addMovie(
    movieTitle,
    ageRestriction,
    metadataURI,
    { gasLimit: 200000 }
  );
  await addMovieTx.wait();
  
  const movieCount = await MovieManager.nextMovieId();
  const movieId = movieCount - 1n;
  console.log('✅ Movie added! Movie ID:', movieId.toString());

  // Verify movie ownership
  const movie = await MovieManager.movies(movieId);
  console.log('   Owner:', movie.owner);
  console.log('   Your address:', deployer.address);
  console.log('   Match:', movie.owner.toLowerCase() === deployer.address.toLowerCase());

  // Step 2: Add Shows (showtimes)
  console.log('\n🕐 Step 2: Adding showtimes...');

  // Calculate timestamps for today + future dates
  const now = Math.floor(Date.now() / 1000);
  const oneDay = 24 * 60 * 60;

  // Show 1: Today at 10:00 AM
  const show1Time = now + (2 * 60 * 60); // 2 hours from now
  const show1Price = parseUnits('5', 6); // 5 PYUSD
  const show1Seats = 50;

  console.log('  Adding Show 1: 2 hours from now, 5 PYUSD, 50 seats');
  console.log('  Parameters:', {
    movieId: movieId.toString(),
    show1Time,
    show1Price: show1Price.toString(),
    show1Seats
  });
  
  const addShow1Tx = await MovieManager.addShow(
    movieId,
    BigInt(show1Time),
    show1Price,
    BigInt(show1Seats),
    { gasLimit: 300000 }
  );
  await addShow1Tx.wait();
  const showCount1 = await MovieManager.nextShowId();
  const show1Id = showCount1 - 1n;
  console.log('  ✅ Show 1 added! Show ID:', show1Id.toString());

  // Show 2: Today at 2:00 PM
  const show2Time = now + (6 * 60 * 60); // 6 hours from now
  const show2Price = parseUnits('6', 6); // 6 PYUSD
  const show2Seats = 75;

  console.log('  Adding Show 2: 6 hours from now, 6 PYUSD, 75 seats');
  const addShow2Tx = await MovieManager.addShow(
    movieId,
    show2Time,
    show2Price,
    show2Seats,
    { gasLimit: 200000 }
  );
  await addShow2Tx.wait();
  const showCount2 = await MovieManager.nextShowId();
  const show2Id = showCount2 - 1n;
  console.log('  ✅ Show 2 added! Show ID:', show2Id.toString());

  // Show 3: Tomorrow at 6:00 PM
  const show3Time = now + oneDay + (8 * 60 * 60); // Tomorrow + 8 hours
  const show3Price = parseUnits('8', 6); // 8 PYUSD (premium evening)
  const show3Seats = 100;

  console.log('  Adding Show 3: Tomorrow evening, 8 PYUSD, 100 seats');
  const addShow3Tx = await MovieManager.addShow(
    movieId,
    show3Time,
    show3Price,
    show3Seats,
    { gasLimit: 200000 }
  );
  await addShow3Tx.wait();
  const showCount3 = await MovieManager.nextShowId();
  const show3Id = showCount3 - 1n;
  console.log('  ✅ Show 3 added! Show ID:', show3Id.toString());

  // Step 3: Display Results
  console.log('\n🎉 All done! Here\'s what you can do now:\n');
  console.log('📋 MOVIE DETAILS:');
  console.log('   Movie ID:', movieId.toString());
  console.log('   Title:', movieTitle);
  console.log('   Metadata:', metadataURI);
  console.log('');
  console.log('🎬 AVAILABLE SHOWS:');
  console.log('   Show 1 (ID:', show1Id.toString() + ') -', new Date(show1Time * 1000).toLocaleString(), '- 5 PYUSD - 50 seats');
  console.log('   Show 2 (ID:', show2Id.toString() + ') -', new Date(show2Time * 1000).toLocaleString(), '- 6 PYUSD - 75 seats');
  console.log('   Show 3 (ID:', show3Id.toString() + ') -', new Date(show3Time * 1000).toLocaleString(), '- 8 PYUSD - 100 seats');
  console.log('');
  console.log('💡 CUSTOMER INSTRUCTIONS:');
  console.log('   1. Go to: http://localhost:3000/movie/' + show1Id.toString());
  console.log('   2. Or: http://localhost:3000/movie/' + show2Id.toString());
  console.log('   3. Or: http://localhost:3000/movie/' + show3Id.toString());
  console.log('   4. Select seats and buy tickets!');
  console.log('');
  console.log('⚠️  IMPORTANT: Customers browse SHOWS, not movies!');
  console.log('   Each show has its own ID, time, price, and seats.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
