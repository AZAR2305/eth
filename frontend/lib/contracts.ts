import { ethers } from 'ethers';

// ABIs in proper JSON format for wagmi v2 (V2 - Multiple Showtimes)
export const MOVIE_MANAGER_ABI = [
  {
    "inputs": [
      { "name": "title", "type": "string" },
      { "name": "ageRestriction", "type": "uint8" },
      { "name": "metadataURI", "type": "string" }
    ],
    "name": "addMovie",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "movieId", "type": "uint256" },
      { "name": "showtime", "type": "uint256" },
      { "name": "ticketPrice", "type": "uint256" },
      { "name": "totalSeats", "type": "uint256" }
    ],
    "name": "addShow",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "movieId", "type": "uint256" }],
    "name": "getMovie",
    "outputs": [
      {
        "components": [
          { "name": "id", "type": "uint256" },
          { "name": "title", "type": "string" },
          { "name": "ageRestriction", "type": "uint8" },
          { "name": "metadataURI", "type": "string" },
          { "name": "owner", "type": "address" },
          { "name": "active", "type": "bool" }
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "showId", "type": "uint256" }],
    "name": "getShow",
    "outputs": [
      {
        "components": [
          { "name": "id", "type": "uint256" },
          { "name": "movieId", "type": "uint256" },
          { "name": "showtime", "type": "uint256" },
          { "name": "ticketPrice", "type": "uint256" },
          { "name": "totalSeats", "type": "uint256" },
          { "name": "availableSeats", "type": "uint256" },
          { "name": "active", "type": "bool" }
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "movieId", "type": "uint256" }],
    "name": "getMovieShows",
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllShows",
    "outputs": [
      {
        "components": [
          { "name": "id", "type": "uint256" },
          { "name": "movieId", "type": "uint256" },
          { "name": "showtime", "type": "uint256" },
          { "name": "ticketPrice", "type": "uint256" },
          { "name": "totalSeats", "type": "uint256" },
          { "name": "availableSeats", "type": "uint256" },
          { "name": "active", "type": "bool" }
        ],
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllMovies",
    "outputs": [
      {
        "components": [
          { "name": "id", "type": "uint256" },
          { "name": "title", "type": "string" },
          { "name": "ageRestriction", "type": "uint8" },
          { "name": "metadataURI", "type": "string" },
          { "name": "owner", "type": "address" },
          { "name": "active", "type": "bool" }
        ],
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveMovies",
    "outputs": [
      {
        "components": [
          { "name": "id", "type": "uint256" },
          { "name": "title", "type": "string" },
          { "name": "ageRestriction", "type": "uint8" },
          { "name": "metadataURI", "type": "string" },
          { "name": "owner", "type": "address" },
          { "name": "active", "type": "bool" }
        ],
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "owner", "type": "address" }],
    "name": "registerTheaterOwner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "movieId", "type": "uint256" },
      { "indexed": false, "name": "title", "type": "string" },
      { "indexed": true, "name": "owner", "type": "address" },
      { "indexed": false, "name": "showtime", "type": "uint256" }
    ],
    "name": "MovieAdded",
    "type": "event"
  }
] as const;

export const TICKET_ESCROW_ABI = [
  {
    "inputs": [
      { "name": "showId", "type": "uint256" },
      { "name": "seatNumbers", "type": "uint256[]" }
    ],
    "name": "buyTicket",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "purchaseId", "type": "uint256" },
      { "name": "encryptedTicketURI", "type": "string" }
    ],
    "name": "issueTicket",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "user", "type": "address" }],
    "name": "getUserPurchases",
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "purchaseId", "type": "uint256" }],
    "name": "getPurchase",
    "outputs": [
      {
        "components": [
          { "name": "showId", "type": "uint256" },
          { "name": "movieId", "type": "uint256" },
          { "name": "buyer", "type": "address" },
          { "name": "amount", "type": "uint256" },
          { "name": "seatNumbers", "type": "uint256[]" },
          { "name": "issued", "type": "bool" },
          { "name": "timestamp", "type": "uint256" }
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "showId", "type": "uint256" }],
    "name": "getShowPurchases",
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "showId", "type": "uint256" }],
    "name": "getShowBookingStats",
    "outputs": [
      { "name": "totalBookings", "type": "uint256" },
      { "name": "totalRevenue", "type": "uint256" },
      { "name": "ticketsSold", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "showId", "type": "uint256" },
      { "name": "seatNumber", "type": "uint256" }
    ],
    "name": "isSeatTaken",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "purchaseId", "type": "uint256" }],
    "name": "getPurchase",
    "outputs": [
      {
        "components": [
          { "name": "showId", "type": "uint256" },
          { "name": "movieId", "type": "uint256" },
          { "name": "buyer", "type": "address" },
          { "name": "amount", "type": "uint256" },
          { "name": "seatNumbers", "type": "uint256[]" },
          { "name": "issued", "type": "bool" },
          { "name": "timestamp", "type": "uint256" }
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "purchaseId", "type": "uint256" }],
    "name": "requestRefund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const AGE_VERIFICATION_ABI = [
  {
    "inputs": [
      { "name": "user", "type": "address" },
      { "name": "signature", "type": "bytes" }
    ],
    "name": "verifyAge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "user", "type": "address" }],
    "name": "isVerified",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const TICKET_NFT_ABI = [
  {
    "inputs": [{ "name": "user", "type": "address" }],
    "name": "getUserTickets",
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "", "type": "uint256" }],
    "name": "tickets",
    "outputs": [
      { "name": "movieId", "type": "uint256" },
      { "name": "owner", "type": "address" },
      { "name": "encryptedURI", "type": "string" },
      { "name": "issuedAt", "type": "uint256" },
      { "name": "used", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const PYUSD_ABI = [
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const getContract = (
  address: string,
  abi: any[],
  signerOrProvider: ethers.Signer | ethers.Provider
) => {
  return new ethers.Contract(address, abi, signerOrProvider);
};
