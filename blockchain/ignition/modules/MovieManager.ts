import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MovieManagerModule", (m) => {
  // PYUSD Sepolia address (existing)
  const PYUSD_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

  // Use existing AgeVerification and TicketNFT
  const AGE_VERIFICATION_ADDRESS = "0x5C5e3A03954cd646842290383dF460FBD205C8aC";
  const TICKET_NFT_ADDRESS = "0x5efb39f54e0CEC37e83857c4ADa2a4b0Bd0B82c1";

  // Deploy MovieManager
  const movieManager = m.contract("MovieManager");

  // Deploy TicketEscrow with dependencies
  const ticketEscrow = m.contract("TicketEscrow", [
    PYUSD_ADDRESS,
    movieManager,
    AGE_VERIFICATION_ADDRESS,
    TICKET_NFT_ADDRESS,
  ]);

  
  const DEFAULT_ADMIN_ROLE = m.staticCall(movieManager, "DEFAULT_ADMIN_ROLE");
  m.call(movieManager, "grantRole", [DEFAULT_ADMIN_ROLE, ticketEscrow]);

 
  const deployer = m.getAccount(0);
  m.call(movieManager, "registerTheaterOwner", [deployer]);

 
  const ticketNFT = m.contractAt("TicketNFT", TICKET_NFT_ADDRESS);
  m.call(ticketNFT, "setEscrowContract", [ticketEscrow]);

  return { movieManager, ticketEscrow };
});
