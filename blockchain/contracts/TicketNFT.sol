// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketNFT is ERC721, ERC721URIStorage, ReentrancyGuard, Ownable {
    uint256 public nextTokenId;
    
    struct Ticket {
        uint256 movieId;
        address owner;
        string encryptedURI; // Encrypted with Lit Protocol
        uint256 issuedAt;
        bool used;
    }

    mapping(uint256 => Ticket) public tickets;
    mapping(address => uint256[]) public userTickets;
    
    address public escrowContract;

    event TicketMinted(uint256 indexed tokenId, uint256 indexed movieId, address indexed owner);
    event TicketUsed(uint256 indexed tokenId);

    constructor() ERC721("MovieTicket", "MTKT") Ownable(msg.sender) {}

    function setEscrowContract(address _escrow) external onlyOwner {
        escrowContract = _escrow;
    }

    modifier onlyEscrow() {
        require(msg.sender == escrowContract, "Only escrow contract");
        _;
    }

    function mintTicket(
        address to,
        uint256 movieId,
        string memory encryptedURI
    ) external onlyEscrow nonReentrant returns (uint256) {
        uint256 tokenId = nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, encryptedURI);

        tickets[tokenId] = Ticket({
            movieId: movieId,
            owner: to,
            encryptedURI: encryptedURI,
            issuedAt: block.timestamp,
            used: false
        });

        userTickets[to].push(tokenId);

        emit TicketMinted(tokenId, movieId, to);
        return tokenId;
    }

    function markTicketAsUsed(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not the ticket owner");
        require(!tickets[tokenId].used, "Ticket already used");
        
        tickets[tokenId].used = true;
        emit TicketUsed(tokenId);
    }

    function getTicket(uint256 tokenId) external view returns (Ticket memory) {
        return tickets[tokenId];
    }

    function getUserTickets(address user) external view returns (uint256[] memory) {
        return userTickets[user];
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
