// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PartyToken is ERC20 {
    constructor() ERC20("Party", "PTY") {
        _mint(msg.sender, 276338660057000000000000000000);
    }
}
