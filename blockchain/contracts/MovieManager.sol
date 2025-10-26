// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MovieManager is AccessControl, ReentrancyGuard {
    bytes32 public constant THEATER_OWNER_ROLE = keccak256("THEATER_OWNER_ROLE");

    struct Movie {
        uint256 id;
        string title;
        uint8 ageRestriction; // 0 = no restriction, 12 = 12+, 18 = 18+
        string metadataURI; // IPFS URI for movie metadata (poster, description, etc.)
        address owner;
        bool active;
    }

    struct Show {
        uint256 id;
        uint256 movieId;
        uint256 showtime; // Unix timestamp
        uint256 ticketPrice; // Price in PYUSD (smallest unit)
        uint256 totalSeats;
        uint256 availableSeats;
        bool active;
    }

    mapping(uint256 => Movie) public movies;
    mapping(uint256 => Show) public shows;
    mapping(uint256 => uint256[]) public movieShows; // movieId => showIds[]
    
    uint256 public nextMovieId;
    uint256 public nextShowId;
    
    event MovieAdded(uint256 indexed movieId, string title, address indexed owner);
    event MovieUpdated(uint256 indexed movieId, string title);
    event MovieDeactivated(uint256 indexed movieId);
    event ShowAdded(uint256 indexed showId, uint256 indexed movieId, uint256 showtime, uint256 ticketPrice);
    event ShowUpdated(uint256 indexed showId, uint256 showtime, uint256 ticketPrice);
    event ShowDeactivated(uint256 indexed showId);
    event TheaterOwnerRegistered(address indexed owner);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlyTheaterOwner() {
        require(hasRole(THEATER_OWNER_ROLE, msg.sender), "Not a theater owner");
        _;
    }

    function registerTheaterOwner(address owner) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(THEATER_OWNER_ROLE, owner);
        emit TheaterOwnerRegistered(owner);
    }

    function addMovie(
        string memory title,
        uint8 ageRestriction,
        string memory metadataURI
    ) external onlyTheaterOwner nonReentrant returns (uint256) {
        require(ageRestriction == 0 || ageRestriction == 12 || ageRestriction == 18, "Invalid age restriction");

        uint256 movieId = nextMovieId++;
        movies[movieId] = Movie({
            id: movieId,
            title: title,
            ageRestriction: ageRestriction,
            metadataURI: metadataURI,
            owner: msg.sender,
            active: true
        });

        emit MovieAdded(movieId, title, msg.sender);
        return movieId;
    }

    function addShow(
        uint256 movieId,
        uint256 showtime,
        uint256 ticketPrice,
        uint256 totalSeats
    ) external onlyTheaterOwner nonReentrant returns (uint256) {
        require(movies[movieId].active, "Movie does not exist or is inactive");
        require(movies[movieId].owner == msg.sender, "Not the movie owner");
        require(showtime > block.timestamp, "Showtime must be in the future");
        require(totalSeats > 0, "Total seats must be greater than 0");
        require(ticketPrice > 0, "Ticket price must be greater than 0");

        uint256 showId = nextShowId++;
        shows[showId] = Show({
            id: showId,
            movieId: movieId,
            showtime: showtime,
            ticketPrice: ticketPrice,
            totalSeats: totalSeats,
            availableSeats: totalSeats,
            active: true
        });

        movieShows[movieId].push(showId);

        emit ShowAdded(showId, movieId, showtime, ticketPrice);
        return showId;
    }

    function updateMovie(
        uint256 movieId,
        string memory title,
        uint8 ageRestriction,
        string memory metadataURI
    ) external onlyTheaterOwner nonReentrant {
        Movie storage movie = movies[movieId];
        require(movie.owner == msg.sender, "Not the movie owner");
        require(movie.active, "Movie is not active");

        movie.title = title;
        movie.ageRestriction = ageRestriction;
        movie.metadataURI = metadataURI;

        emit MovieUpdated(movieId, title);
    }

    function updateShow(
        uint256 showId,
        uint256 showtime,
        uint256 ticketPrice
    ) external onlyTheaterOwner nonReentrant {
        Show storage show = shows[showId];
        Movie memory movie = movies[show.movieId];
        require(movie.owner == msg.sender, "Not the movie owner");
        require(show.active, "Show is not active");
        require(showtime > block.timestamp, "Showtime must be in the future");

        show.showtime = showtime;
        show.ticketPrice = ticketPrice;

        emit ShowUpdated(showId, showtime, ticketPrice);
    }

    function deactivateMovie(uint256 movieId) external onlyTheaterOwner {
        Movie storage movie = movies[movieId];
        require(movie.owner == msg.sender, "Not the movie owner");
        movie.active = false;
        emit MovieDeactivated(movieId);
    }

    function deactivateShow(uint256 showId) external onlyTheaterOwner {
        Show storage show = shows[showId];
        Movie memory movie = movies[show.movieId];
        require(movie.owner == msg.sender, "Not the movie owner");
        show.active = false;
        emit ShowDeactivated(showId);
    }

    function decrementAvailableSeats(uint256 showId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Show storage show = shows[showId];
        require(show.availableSeats > 0, "No seats available");
        show.availableSeats--;
    }

    function incrementAvailableSeats(uint256 showId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Show storage show = shows[showId];
        require(show.availableSeats < show.totalSeats, "All seats already available");
        show.availableSeats++;
    }

    function getMovie(uint256 movieId) external view returns (Movie memory) {
        return movies[movieId];
    }

    function getShow(uint256 showId) external view returns (Show memory) {
        return shows[showId];
    }

    function getMovieShows(uint256 movieId) external view returns (uint256[] memory) {
        return movieShows[movieId];
    }

    function getAllMovies() external view returns (Movie[] memory) {
        Movie[] memory allMovies = new Movie[](nextMovieId);
        for (uint256 i = 0; i < nextMovieId; i++) {
            allMovies[i] = movies[i];
        }
        return allMovies;
    }

    function getAllShows() external view returns (Show[] memory) {
        Show[] memory allShows = new Show[](nextShowId);
        for (uint256 i = 0; i < nextShowId; i++) {
            allShows[i] = shows[i];
        }
        return allShows;
    }

    function getActiveMovies() external view returns (Movie[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < nextMovieId; i++) {
            if (movies[i].active) {
                activeCount++;
            }
        }

        Movie[] memory activeMovies = new Movie[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < nextMovieId; i++) {
            if (movies[i].active) {
                activeMovies[index] = movies[i];
                index++;
            }
        }
        return activeMovies;
    }
}
