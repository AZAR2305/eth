// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AgeVerification is ReentrancyGuard {
    mapping(address => bool) public isVerified;
    mapping(address => uint256) public verificationTimestamp;
    
    address public verifier; // Trusted verifier address (can be multisig or DAO)

    event AgeVerified(address indexed user, uint256 timestamp);

    constructor(address _verifier) {
        verifier = _verifier;
    }

    modifier onlyVerifier() {
        require(msg.sender == verifier, "Not authorized verifier");
        _;
    }

    // Called after Lit Attestation SDK verification off-chain
    function verifyAge(address user, bytes memory signature) external onlyVerifier nonReentrant {
        require(!isVerified[user], "User already verified");
        
        // In production, verify signature from Lit Protocol attestation
        // For now, trusted verifier marks as verified
        isVerified[user] = true;
        verificationTimestamp[user] = block.timestamp;

        emit AgeVerified(user, block.timestamp);
    }

    // Self-verification after Lit Attestation (user submits proof)
    function selfVerify(bytes memory litAttestationProof) external nonReentrant {
        require(!isVerified[msg.sender], "User already verified");
        
        // Verify Lit Protocol attestation proof
        // This would integrate with Lit Protocol's on-chain verification
        // For implementation: decode and verify the attestation signature
        
        isVerified[msg.sender] = true;
        verificationTimestamp[msg.sender] = block.timestamp;

        emit AgeVerified(msg.sender, block.timestamp);
    }

    function checkVerification(address user) external view returns (bool) {
        return isVerified[user];
    }

    function updateVerifier(address newVerifier) external onlyVerifier {
        verifier = newVerifier;
    }
}
