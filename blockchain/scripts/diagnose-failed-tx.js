const hre = require("hardhat");

async function main() {
  // Transaction hash that failed
  const txHash = "0xea82ec50650f60d4f0415a3e4d1ca36a05d806084ee6dfaa67a5f657da2b1078";
  
  console.log("\n🔍 ANALYZING FAILED TRANSACTION");
  console.log("=".repeat(50));
  console.log("TX Hash:", txHash);
  console.log("");
  
  try {
    const tx = await hre.ethers.provider.getTransaction(txHash);
    
    if (!tx) {
      console.log("❌ Transaction not found");
      return;
    }
    
    console.log("📝 Transaction Details:");
    console.log("   From:", tx.from);
    console.log("   To:", tx.to);
    console.log("   Value:", hre.ethers.formatEther(tx.value), "ETH");
    console.log("   Gas Limit:", tx.gasLimit.toString());
    console.log("   Gas Price:", hre.ethers.formatUnits(tx.gasPrice, "gwei"), "Gwei");
    console.log("");
    
    // Get the receipt to see why it failed
    const receipt = await hre.ethers.provider.getTransactionReceipt(txHash);
    
    if (receipt) {
      console.log("📋 Receipt:");
      console.log("   Status:", receipt.status === 1 ? "✅ Success" : "❌ Failed");
      console.log("   Block:", receipt.blockNumber);
      console.log("   Gas Used:", receipt.gasUsed.toString());
      console.log("");
      
      if (receipt.status === 0) {
        console.log("❌ TRANSACTION FAILED!");
        console.log("");
        
        // Try to decode the input data
        const TICKET_ESCROW_ADDRESS = "0x5FC9Df8D5D97AdB2FB9674ea02362cECfF21761A";
        const TicketEscrow = await hre.ethers.getContractAt("TicketEscrow", TICKET_ESCROW_ADDRESS);
        
        console.log("📊 Attempting to decode transaction input...");
        
        try {
          const decoded = TicketEscrow.interface.parseTransaction({ data: tx.data });
          console.log("   Function:", decoded.name);
          console.log("   Args:", decoded.args);
          console.log("");
          
          if (decoded.name === "buyTicket") {
            const showId = decoded.args[0];
            const seatNumbers = decoded.args[1];
            
            console.log("🎬 Attempted Purchase:");
            console.log("   Show ID:", showId.toString());
            console.log("   Seat Numbers:", seatNumbers.map(n => n.toString()).join(", "));
            console.log("");
            
            // Check show status
            const MOVIE_MANAGER_ADDRESS = "0xdA9f29795aD5e7BbeA6AeD5151Ff0324Bc7d1804";
            const MovieManager = await hre.ethers.getContractAt("MovieManager", MOVIE_MANAGER_ADDRESS);
            
            try {
              const show = await MovieManager.getShow(showId);
              console.log("✅ Show exists:");
              console.log("   Active:", show.active);
              console.log("   Available Seats:", show.availableSeats.toString());
              console.log("   Total Seats:", show.totalSeats.toString());
              console.log("   Price:", hre.ethers.formatUnits(show.ticketPrice, 6), "PYUSD");
              console.log("");
              
              // Check if seats are valid
              for (let seat of seatNumbers) {
                const seatNum = Number(seat);
                if (seatNum < 1 || seatNum > Number(show.totalSeats)) {
                  console.log(`❌ Invalid seat number: ${seatNum} (must be 1-${show.totalSeats})`);
                }
              }
              
              // Check PYUSD balance and allowance
              const PYUSD_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
              const PYUSD = await hre.ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", PYUSD_ADDRESS);
              
              const totalPrice = show.ticketPrice * BigInt(seatNumbers.length);
              const balance = await PYUSD.balanceOf(tx.from);
              const allowance = await PYUSD.allowance(tx.from, TICKET_ESCROW_ADDRESS);
              
              console.log("💰 Payment Check:");
              console.log("   Total Cost:", hre.ethers.formatUnits(totalPrice, 6), "PYUSD");
              console.log("   User Balance:", hre.ethers.formatUnits(balance, 6), "PYUSD");
              console.log("   Allowance:", hre.ethers.formatUnits(allowance, 6), "PYUSD");
              console.log("");
              
              if (balance < totalPrice) {
                console.log("❌ INSUFFICIENT BALANCE!");
              } else if (allowance < totalPrice) {
                console.log("❌ INSUFFICIENT ALLOWANCE!");
              } else {
                console.log("✅ Balance and allowance OK");
                console.log("");
                console.log("⚠️ BYZANTIUM ERROR likely caused by:");
                console.log("   1. Seat already taken");
                console.log("   2. Show not active");
                console.log("   3. Contract logic issue");
                console.log("   4. Reentrancy issue");
              }
              
            } catch (error) {
              console.log("❌ Show doesn't exist or error reading:", error.message);
            }
          }
        } catch (decodeError) {
          console.log("⚠️ Could not decode transaction:", decodeError.message);
        }
      }
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
  
  console.log("\n" + "=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
