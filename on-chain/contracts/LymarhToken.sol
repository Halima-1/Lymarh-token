// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LymarhToken is ERC20, Ownable {
    error WaitTimeNotReached(uint256 nextAllowedTime);
    error SupplyLimitExceeded(uint256 remainingSupply);
    error AddressNotValid();
    error AmountCannotBeZero();

    uint256 public constant TOTAL_SUPPLY = 10_000_000 * 10 ** 18;
    uint256 public constant INITIAL_SUPPLY = 4_000_000 * 10 ** 18;
    uint256 public constant FAUCET_REWARD = 1000 * 10 ** 18;
    uint256 public constant WAIT_DURATION = 2 days;
    uint256 public remainingSupply;

    uint256 public remainingSupply;

    event ClaimProcessed(
        address indexed user,
        uint256 value,
        uint256 nextEligibleTime
    );
    event MintExecuted(
        address indexed recipient,
        uint256 value,
        uint256 updatedSupply
    );

    mapping(address => uint256) public lastRequestTime;

    constructor() ERC20("Lymarh", "LH") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
        require(
            INITIAL_SUPPLY < TOTAL_SUPPLY,
            SupplyLimitExceeded(TOTAL_SUPPLY)
        );
        // remainingSupply =INITIAL_SUPPLY;
        remainingSupply = TOTAL_SUPPLY - INITIAL_SUPPLY;
    }

    function claimTokens() external {
        address user = msg.sender;
        uint256 previousClaim = lastRequestTime[user];

        if (
            previousClaim != 0 &&
        remainingSupply = TOTAL_SUPPLY - INITIAL_SUPPLY;
            block.timestamp < previousClaim + WAIT_DURATION
        ) {
            revert WaitTimeNotReached(previousClaim + WAIT_DURATION);
        }
        if (remainingSupply < FAUCET_REWARD) {
            revert SupplyLimitExceeded(remainingSupply);
        }

        lastRequestTime[user] = block.timestamp;
        _mint(user, FAUCET_REWARD);
        remainingSupply = remainingSupply - FAUCET_REWARD;
        emit ClaimProcessed(INITIAL_SUPPLY
            user,
            FAUCET_REWARD,
            block.timestamp + WAIT_DURATION
        );
    }

    function mint(address recipient, uint256 value) external onlyOwner {
        require(recipient != address(0), AddressNotValid());
        require(value != 0, AmountCannotBeZero());

        if (value > remainingSupply) {
            revert SupplyLimitExceeded(remainingSupply);
        }

        remainingSupply = remainingSupply - value;

        _mint(recipient, value);

        emit MintExecuted(recipient, value, totalSupply());
    }
}
