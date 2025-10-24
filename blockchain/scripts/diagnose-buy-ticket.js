const hre = require("hardhat");

async function main() {
  const customerWallet = "0x5326290Ce26e95FD7fdbd7cfdE70d9f35126d5D7";
  const movieId = 0;

  console.log("🔍 Diagnosing why buyTicket is failing...\n");

  const MOVIE_MANAGER_ADDRESS = "0x2BC04Cd57B44dA9C7223C17483d74A98c556183D";
  const ESCROW_ADDRESS = "0xBBeBA51A7756C0A23453784f8508200CC821B0e4";
  const AGE_VERIFICATION_ADDRESS = "0x5C5e3A03954cd646842290383dF460FBD205C8aC";
  const PYUSD_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

  // Get movie manager contract
  const movieManager = await hre.ethers.getContractAt(
    ["function getMovie(uint256) view returns (uint256,string,uint256,uint8,string,address,uint256,uint256,uint256,bool)"],
    MOVIE_MANAGER_ADDRESS
  );

  const movie = await movieManager.getMovie(movieId);
  console.log("📽️ Movie Details:");
  console.log("  Title:", movie[1]);
  console.log("  Age Restriction:", movie[3]);
  console.log("  Price:", hre.ethers.formatUnits(movie[6], 6), "PYUSD");
  console.log("  Available Seats:", movie[8].toString());
  console.log("  Active:", movie[9]);

  // Check age verification
  if (movie[3] === 18) {
    const ageVerification = await hre.ethers.getContractAt(
      ["function isVerified(address) view returns (bool)"],
      AGE_VERIFICATION_ADDRESS
    );
    const isVerified = await ageVerification.isVerified(customerWallet);
    console.log("\n🔞 Age Verification Required:");
    console.log("  Customer verified:", isVerified);
    
    if (!isVerified) {
      console.log("\n❌ PROBLEM FOUND: Customer is not age verified!");
      console.log("  They need to verify their age first.");
      return;
    }
  }

  // Check PYUSD
  const pyusd = await hre.ethers.getContractAt(
    ["function balanceOf(address) view returns (uint256)", "function allowance(address,address) view returns (uint256)"],
    PYUSD_ADDRESS
  );

  const balance = await pyusd.balanceOf(customerWallet);
  const allowance = await pyusd.allowance(customerWallet, ESCROW_ADDRESS);

  console.log("\n💰 PYUSD Check:");
  console.log("  Balance:", hre.ethers.formatUnits(balance, 6), "PYUSD");
  console.log("  Allowance:", hre.ethers.formatUnits(allowance, 6), "PYUSD");
  console.log("  Needed:", hre.ethers.formatUnits(movie[6], 6), "PYUSD");

  if (balance < movie[6]) {
    console.log("\n❌ PROBLEM FOUND: Insufficient PYUSD balance!");
    return;
  }

  if (allowance < movie[6]) {
    console.log("\n❌ PROBLEM FOUND: Insufficient allowance!");
    return;
  }

  console.log("\n✅ All checks passed! Transaction should work...");
  console.log("\n🤔 If it's still failing, the issue might be:");
  console.log("  1. Gas limit too low (but we set it to 500k)");
  console.log("  2. Nonce issue (try resetting MetaMask)");
  console.log("  3. RPC node issue (try again)");
  console.log("  4. Contract bug (check transaction on Etherscan)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
