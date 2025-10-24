// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockPYUSD is ERC20, Ownable {
    constructor() ERC20("PayPal USD (Test)", "PYUSD") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000 * 10**6); // 1 million PYUSD
    }

    function decimals() public pure override returns (uint8) {
        return 6; // PYUSD uses 6 decimals
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function faucet() public {
        // Anyone can get 1000 PYUSD for testing
        _mint(msg.sender, 1000 * 10**6);
    }
}
