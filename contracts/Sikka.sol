// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract Sikka is ERC20, ERC20Burnable {
    uint256 public constant MAX_SUPPLY = 40_000_000 * 10 ** 8;

    constructor() ERC20("Sikka", "SIKA") {
        _mint(msg.sender, MAX_SUPPLY);
    }

    function decimals() public pure override returns (uint8) {
        return 8;
    }
}
