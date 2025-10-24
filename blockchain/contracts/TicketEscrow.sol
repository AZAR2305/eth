// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

struct Movie {
    uint256 id;
    string title;
    uint8 ageRestriction;
    string metadataURI;
    address owner;
    bool active;
}

struct Show {
    uint256 id;
    uint256 movieId;
    uint256 showtime;
    uint256 ticketPrice;
    uint256 totalSeats;
    uint256 availableSeats;
    bool active;
}

interface IMovieManager {
    function getMovie(uint256 movieId) external view returns (Movie memory);
    function getShow(uint256 showId) external view returns (Show memory);
    function decrementAvailableSeats(uint256 showId) external;
    function incrementAvailableSeats(uint256 showId) external;
}

interface IAgeVerification {
    function isVerified(address user) external view returns (bool);
}

interface ITicketNFT {
    function mintTicket(address to, uint256 movieId, string memory encryptedURI) external returns (uint256);
}

contract TicketEscrow is ReentrancyGuard {
    IERC20 public pyusd;
    IMovieManager public movieManager;
    IAgeVerification public ageVerification;
    ITicketNFT public ticketNFT;

    struct Purchase {
        uint256 showId;
        uint256 movieId;
        address buyer;
        uint256 amount;
        uint256[] seatNumbers; // Seats purchased (e.g., [1, 2, 3])
        bool issued;
        uint256 timestamp;
    }

    mapping(uint256 => Purchase) public purchases;
    mapping(address => uint256[]) public userPurchases;
    mapping(uint256 => uint256[]) public showPurchases; // showId => purchaseIds[]
    mapping(uint256 => mapping(uint256 => bool)) public showSeatTaken; // showId => seatNumber => taken
    uint256 public nextPurchaseId;

    event TicketPurchased(uint256 indexed purchaseId, uint256 indexed showId, address indexed buyer, uint256 amount, uint256[] seatNumbers);
    event TicketIssued(uint256 indexed purchaseId, uint256 indexed ticketId, address indexed buyer);
    event FundsWithdrawn(address indexed theaterOwner, uint256 amount);

    constructor(
        address _pyusd,
        address _movieManager,
        address _ageVerification,
        address _ticketNFT
    ) {
        pyusd = IERC20(_pyusd);
        movieManager = IMovieManager(_movieManager);
        ageVerification = IAgeVerification(_ageVerification);
        ticketNFT = ITicketNFT(_ticketNFT);
    }

    function buyTicket(uint256 showId, uint256[] memory seatNumbers) external nonReentrant returns (uint256) {
        require(seatNumbers.length > 0 && seatNumbers.length <= 6, "Must buy 1-6 tickets");
        
        Show memory show = movieManager.getShow(showId);
        Movie memory movie = movieManager.getMovie(show.movieId);

        require(show.active, "Show is not active");
        require(show.availableSeats >= seatNumbers.length, "Not enough seats available");

        // Check if seats are already taken
        for (uint256 i = 0; i < seatNumbers.length; i++) {
            require(seatNumbers[i] > 0 && seatNumbers[i] <= show.totalSeats, "Invalid seat number");
            require(!showSeatTaken[showId][seatNumbers[i]], "Seat already taken");
        }

        // Age verification check
        if (movie.ageRestriction == 18) {
            require(ageVerification.isVerified(msg.sender), "Age verification required");
        }

        // Calculate total price
        uint256 totalPrice = show.ticketPrice * seatNumbers.length;

        // Transfer PYUSD to escrow
        require(pyusd.transferFrom(msg.sender, address(this), totalPrice), "PYUSD transfer failed");

        // Mark seats as taken
        for (uint256 i = 0; i < seatNumbers.length; i++) {
            showSeatTaken[showId][seatNumbers[i]] = true;
        }

        // Create purchase record
        uint256 purchaseId = nextPurchaseId++;
        purchases[purchaseId] = Purchase({
            showId: showId,
            movieId: show.movieId,
            buyer: msg.sender,
            amount: totalPrice,
            seatNumbers: seatNumbers,
            issued: false,
            timestamp: block.timestamp
        });

        userPurchases[msg.sender].push(purchaseId);
        showPurchases[showId].push(purchaseId);

        // Decrement available seats
        for (uint256 i = 0; i < seatNumbers.length; i++) {
            movieManager.decrementAvailableSeats(showId);
        }

        emit TicketPurchased(purchaseId, showId, msg.sender, totalPrice, seatNumbers);
        return purchaseId;
    }

    function issueTicket(uint256 purchaseId, string memory encryptedTicketURI) external nonReentrant returns (uint256) {
        Purchase storage purchase = purchases[purchaseId];
        require(!purchase.issued, "Ticket already issued");
        require(purchase.buyer == msg.sender, "Not the buyer");

        // Mint NFT ticket
        uint256 ticketId = ticketNFT.mintTicket(msg.sender, purchase.movieId, encryptedTicketURI);

        // Mark as issued
        purchase.issued = true;

        // Transfer funds to theater owner
        Movie memory purchaseMovie = movieManager.getMovie(purchase.movieId);
        require(pyusd.transfer(purchaseMovie.owner, purchase.amount), "PYUSD transfer to owner failed");

        emit TicketIssued(purchaseId, ticketId, msg.sender);
        return ticketId;
    }

    function getUserPurchases(address user) external view returns (uint256[] memory) {
        return userPurchases[user];
    }

    function getPurchase(uint256 purchaseId) external view returns (Purchase memory) {
        return purchases[purchaseId];
    }

    // Theater owner analytics
    function getShowPurchases(uint256 showId) external view returns (uint256[] memory) {
        return showPurchases[showId];
    }

    function getShowBookingStats(uint256 showId) external view returns (
        uint256 totalBookings,
        uint256 totalRevenue,
        uint256 ticketsSold
    ) {
        uint256[] memory purchaseIds = showPurchases[showId];
        totalBookings = purchaseIds.length;
        
        for (uint256 i = 0; i < purchaseIds.length; i++) {
            Purchase memory purchase = purchases[purchaseIds[i]];
            totalRevenue += purchase.amount;
            ticketsSold += purchase.seatNumbers.length;
        }
    }

    function isSeatTaken(uint256 showId, uint256 seatNumber) external view returns (bool) {
        return showSeatTaken[showId][seatNumber];
    }

    // Refund functionality: 50% to customer, 50% to theater owner
    function requestRefund(uint256 purchaseId) external nonReentrant {
        Purchase storage purchase = purchases[purchaseId];
        require(purchase.buyer == msg.sender, "Not the buyer");
        require(!purchase.issued, "Ticket already issued, cannot refund");
        
        Show memory show = movieManager.getShow(purchase.showId);
        require(show.showtime > block.timestamp, "Show already started, cannot refund");
        
        // Calculate 50/50 split
        uint256 customerRefund = purchase.amount / 2;
        uint256 theaterOwnerFee = purchase.amount - customerRefund;
        
        // Release seats
        for (uint256 i = 0; i < purchase.seatNumbers.length; i++) {
            showSeatTaken[purchase.showId][purchase.seatNumbers[i]] = false;
        }
        
        // Increment available seats back
        for (uint256 i = 0; i < purchase.seatNumbers.length; i++) {
            movieManager.incrementAvailableSeats(purchase.showId);
        }
        
        // Transfer refunds
        Movie memory movie = movieManager.getMovie(purchase.movieId);
        require(pyusd.transfer(msg.sender, customerRefund), "Customer refund failed");
        require(pyusd.transfer(movie.owner, theaterOwnerFee), "Theater owner fee failed");
        
        // Mark purchase as refunded by setting amount to 0
        purchase.amount = 0;
        
        emit RefundProcessed(purchaseId, msg.sender, customerRefund, theaterOwnerFee);
    }

    event RefundProcessed(uint256 indexed purchaseId, address indexed buyer, uint256 customerAmount, uint256 theaterOwnerAmount);
}
