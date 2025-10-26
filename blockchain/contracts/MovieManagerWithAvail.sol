// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MovieManager with Avail DA Integration
 * @notice Manages movies with hybrid storage: on-chain + Avail DA layer
 * @dev Stores small data on-chain, large data commitments from Avail DA
 * 
 * Data Storage Strategy:
 * - Small metadata: On-chain
 * - Large data (posters, trailers): Avail DA (store commitment hash)
 * - Medium data (detailed info): IPFS (store IPFS CID)
 */
contract MovieManagerWithAvail is AccessControl, ReentrancyGuard {
    bytes32 public constant THEATER_OWNER_ROLE = keccak256("THEATER_OWNER_ROLE");

    struct Movie {
        uint256 id;
        string title;
        string genre;
        uint16 duration; // in minutes
        uint8 ageRating; // 0=All, 13=PG-13, 18=R
        bool isActive;
        
        // Hybrid storage references
        string ipfsMetadataURI;      // IPFS for medium metadata
        bytes32 availDataCommitment;  // Avail DA commitment hash
        string availBlockReference;   // Avail block hash + extrinsic index
        
        // On-chain pricing and availability
        uint256 basePrice;
        address theaterOwner;
        uint256 createdAt;
    }

    struct Showtime {
        uint256 movieId;
        uint256 timestamp;
        uint16 totalSeats;
        uint16 availableSeats;
        uint256 priceMultiplier; // 100 = 1x, 150 = 1.5x (premium shows)
        
        // Seat map stored on Avail DA (for large theaters)
        bytes32 seatMapCommitment;
        string seatMapAvailRef;
    }

    struct AvailSubmission {
        bytes32 dataHash;       // keccak256 of the data
        string blockHash;       // Avail block hash
        uint32 extrinsicIndex;  // Position in block
        uint256 timestamp;      // When submitted
        bool verified;          // DA proof verified
    }

    uint256 private nextMovieId = 1;
    uint256 private nextShowtimeId = 1;

    mapping(uint256 => Movie) public movies;
    mapping(uint256 => Showtime) public showtimes;
    mapping(uint256 => uint256[]) public movieShowtimes;
    
    // Track Avail DA submissions
    mapping(bytes32 => AvailSubmission) public availSubmissions;
    mapping(uint256 => bytes32[]) public movieAvailData; // movieId => commitment hashes

    event MovieAdded(
        uint256 indexed movieId,
        string title,
        address indexed owner,
        bytes32 availCommitment
    );
    
    event ShowtimeAdded(
        uint256 indexed showtimeId,
        uint256 indexed movieId,
        uint256 timestamp,
        bytes32 seatMapCommitment
    );
    
    event AvailDataSubmitted(
        uint256 indexed movieId,
        bytes32 indexed commitment,
        string blockHash,
        uint32 extrinsicIndex
    );
    
    event AvailDataVerified(
        bytes32 indexed commitment,
        bool verified
    );

    event SeatBooked(
        uint256 indexed showtimeId,
        address indexed buyer,
        uint16 seatsBooked
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(THEATER_OWNER_ROLE, msg.sender);
    }

    /**
     * @notice Add a new movie with Avail DA commitment
     * @param title Movie title (on-chain)
     * @param genre Genre (on-chain)
     * @param duration Duration in minutes (on-chain)
     * @param ageRating Age rating (on-chain)
     * @param basePrice Base ticket price in wei (on-chain)
     * @param ipfsMetadataURI IPFS URI for medium metadata (on-chain reference)
     * @param availDataCommitment Avail DA commitment hash (on-chain)
     * @param availBlockReference Avail block reference (on-chain)
     */
    function addMovieWithAvail(
        string memory title,
        string memory genre,
        uint16 duration,
        uint8 ageRating,
        uint256 basePrice,
        string memory ipfsMetadataURI,
        bytes32 availDataCommitment,
        string memory availBlockReference
    ) external onlyRole(THEATER_OWNER_ROLE) returns (uint256) {
        require(bytes(title).length > 0, "Title required");
        require(duration > 0, "Duration must be positive");
        require(availDataCommitment != bytes32(0), "Avail commitment required");

        uint256 movieId = nextMovieId++;

        movies[movieId] = Movie({
            id: movieId,
            title: title,
            genre: genre,
            duration: duration,
            ageRating: ageRating,
            isActive: true,
            ipfsMetadataURI: ipfsMetadataURI,
            availDataCommitment: availDataCommitment,
            availBlockReference: availBlockReference,
            basePrice: basePrice,
            theaterOwner: msg.sender,
            createdAt: block.timestamp
        });

        // Track Avail submission
        movieAvailData[movieId].push(availDataCommitment);

        emit MovieAdded(movieId, title, msg.sender, availDataCommitment);
        
        return movieId;
    }

    /**
     * @notice Submit Avail DA proof for movie data
     * @param movieId Movie ID
     * @param dataHash Hash of the data stored on Avail
     * @param blockHash Avail block hash
     * @param extrinsicIndex Extrinsic index in the block
     */
    function submitAvailProof(
        uint256 movieId,
        bytes32 dataHash,
        string memory blockHash,
        uint32 extrinsicIndex
    ) external onlyRole(THEATER_OWNER_ROLE) {
        require(movies[movieId].id != 0, "Movie not found");
        require(movies[movieId].theaterOwner == msg.sender, "Not owner");
        require(dataHash != bytes32(0), "Invalid data hash");
        require(bytes(blockHash).length > 0, "Invalid block hash");

        availSubmissions[dataHash] = AvailSubmission({
            dataHash: dataHash,
            blockHash: blockHash,
            extrinsicIndex: extrinsicIndex,
            timestamp: block.timestamp,
            verified: false // Will be verified by oracle/light client
        });

        movieAvailData[movieId].push(dataHash);

        emit AvailDataSubmitted(movieId, dataHash, blockHash, extrinsicIndex);
    }

    /**
     * @notice Verify Avail DA proof (called by oracle or admin)
     * @param commitment Data commitment hash
     * @param verified True if data is available
     */
    function verifyAvailData(
        bytes32 commitment,
        bool verified
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(availSubmissions[commitment].dataHash != bytes32(0), "Submission not found");
        
        availSubmissions[commitment].verified = verified;
        
        emit AvailDataVerified(commitment, verified);
    }

    /**
     * @notice Add showtime with seat map on Avail DA
     * @param movieId Movie ID
     * @param timestamp Showtime timestamp
     * @param totalSeats Total seats
     * @param priceMultiplier Price multiplier (100 = 1x)
     * @param seatMapCommitment Avail commitment for seat map
     * @param seatMapAvailRef Avail block reference for seat map
     */
    function addShowtimeWithAvailSeats(
        uint256 movieId,
        uint256 timestamp,
        uint16 totalSeats,
        uint256 priceMultiplier,
        bytes32 seatMapCommitment,
        string memory seatMapAvailRef
    ) external onlyRole(THEATER_OWNER_ROLE) returns (uint256) {
        require(movies[movieId].id != 0, "Movie not found");
        require(timestamp > block.timestamp, "Past timestamp");
        require(totalSeats > 0, "Seats required");

        uint256 showtimeId = nextShowtimeId++;

        showtimes[showtimeId] = Showtime({
            movieId: movieId,
            timestamp: timestamp,
            totalSeats: totalSeats,
            availableSeats: totalSeats,
            priceMultiplier: priceMultiplier,
            seatMapCommitment: seatMapCommitment,
            seatMapAvailRef: seatMapAvailRef
        });

        movieShowtimes[movieId].push(showtimeId);

        emit ShowtimeAdded(showtimeId, movieId, timestamp, seatMapCommitment);
        
        return showtimeId;
    }

    /**
     * @notice Book seats (called by TicketEscrow)
     * @param showtimeId Showtime ID
     * @param seatsToBook Number of seats to book
     */
    function bookSeats(uint256 showtimeId, uint16 seatsToBook) external nonReentrant {
        Showtime storage showtime = showtimes[showtimeId];
        require(showtime.movieId != 0, "Showtime not found");
        require(showtime.availableSeats >= seatsToBook, "Not enough seats");
        require(showtime.timestamp > block.timestamp, "Showtime passed");

        showtime.availableSeats -= seatsToBook;

        emit SeatBooked(showtimeId, msg.sender, seatsToBook);
    }

    // View functions

    function getMovie(uint256 movieId) external view returns (Movie memory) {
        return movies[movieId];
    }

    function getShowtime(uint256 showtimeId) external view returns (Showtime memory) {
        return showtimes[showtimeId];
    }

    function getMovieShowtimes(uint256 movieId) external view returns (uint256[] memory) {
        return movieShowtimes[movieId];
    }

    function getAvailSubmission(bytes32 commitment) external view returns (AvailSubmission memory) {
        return availSubmissions[commitment];
    }

    function getMovieAvailData(uint256 movieId) external view returns (bytes32[] memory) {
        return movieAvailData[movieId];
    }

    function isAvailDataVerified(bytes32 commitment) external view returns (bool) {
        return availSubmissions[commitment].verified;
    }

    function getActiveMovies() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i < nextMovieId; i++) {
            if (movies[i].isActive) {
                count++;
            }
        }

        uint256[] memory activeMovies = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i < nextMovieId; i++) {
            if (movies[i].isActive) {
                activeMovies[index] = i;
                index++;
            }
        }

        return activeMovies;
    }

    function registerTheaterOwner(address owner) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(THEATER_OWNER_ROLE, owner);
    }

    function setMovieActive(uint256 movieId, bool active) external onlyRole(THEATER_OWNER_ROLE) {
        require(movies[movieId].theaterOwner == msg.sender, "Not owner");
        movies[movieId].isActive = active;
    }
}
