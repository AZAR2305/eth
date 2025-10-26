const hre = require("hardhat");

async function main() {
  const movieManagerAddress = "0xdA9f29795aD5e7BbeA6AeD5151Ff0324Bc7d1804";
  
  // Your wallet address (the one you deployed with)
  const [deployer] = await hre.ethers.getSigners();
  const yourWalletAddress = deployer.address;
  
  console.log("🎭 Registering Theater Owner...\n");
  console.log("Your wallet:", yourWalletAddress);
  console.log("MovieManager:", movieManagerAddress);
  
  const MovieManager = await hre.ethers.getContractFactory("MovieManager");
  const movieManager = await MovieManager.attach(movieManagerAddress);
  
  try {
    // Check if already registered
    const hasRole = await movieManager.hasRole(
      await movieManager.THEATER_OWNER_ROLE(),
      yourWalletAddress
    );
    
    if (hasRole) {
      console.log("\n✅ You are already a theater owner!");
    } else {
      console.log("\n⏳ Registering you as a theater owner...");
      const tx = await movieManager.registerTheaterOwner(yourWalletAddress);
      await tx.wait();
      console.log("✅ Successfully registered as theater owner!");
      console.log("Transaction:", tx.hash);
    }
    
    console.log("\n🎉 You can now add movies to the blockchain!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
