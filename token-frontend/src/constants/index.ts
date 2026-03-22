export const CONTRACT_ADDRESS = "0x4AeB54Dcb53330df6F2885CBCCD3667a04B0e949";

export const ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function claimTokens() external",
  "function FAUCET_REWARD() view returns (uint256)",
  "function WAIT_DURATION() view returns (uint256)",
  "function lastRequestTime(address) view returns (uint256)",
  "function remainingSupply() view returns (uint256)",
  "function mint(address recipient, uint256 value) external",
  "function owner() view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event ClaimProcessed(address indexed user, uint256 value, uint256 nextEligibleTime)",
  "event MintExecuted(address indexed recipient, uint256 value, uint256 updatedSupply)"
];
