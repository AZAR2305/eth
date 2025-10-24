export const CONTRACT_ADDRESSES = {
  movieManager: process.env.NEXT_PUBLIC_MOVIE_MANAGER_ADDRESS as `0x${string}`,
  ticketEscrow: process.env.NEXT_PUBLIC_TICKET_ESCROW_ADDRESS as `0x${string}`,
  ageVerification: process.env.NEXT_PUBLIC_AGE_VERIFICATION_ADDRESS as `0x${string}`,
  ticketNFT: process.env.NEXT_PUBLIC_TICKET_NFT_ADDRESS as `0x${string}`,
  pyusd: process.env.NEXT_PUBLIC_PYUSD_ADDRESS as `0x${string}`,
};

// Optional network constants to avoid importing wagmi entirely
export const NETWORK = {
  chainIdHex: '11155111', // Sepolia chainId in hex
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum-sepolia.publicnode.com',
  explorer: 'https://sepolia.etherscan.io',
};
