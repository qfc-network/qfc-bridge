export const BRIDGE_LOCK_ABI = [
  "function lock(address _token, uint256 _amount, uint256 _destChain, address _recipient) external",
  "function lockETH(uint256 _destChain, address _recipient) external payable",
  "function unlock(address _token, address _recipient, uint256 _amount, uint256 _srcChain, uint256 _nonce, bytes[] calldata _signatures) external",
  "function bridgeFeeBps() view returns (uint256)",
  "function nonce() view returns (uint256)",
  "function collectedFees(address) view returns (uint256)",
  "event BridgeRequest(uint256 indexed nonce, address indexed token, address indexed sender, uint256 amount, uint256 fee, uint256 destChain, address recipient)",
  "event Unlocked(address indexed token, address indexed recipient, uint256 amount, uint256 srcChain, bytes32 indexed unlockId)",
];

export const BRIDGE_MINT_ABI = [
  "function mint(address _srcToken, address _recipient, uint256 _amount, uint256 _srcChain, uint256 _nonce, bytes[] calldata _signatures) external",
  "function burn(address _srcToken, uint256 _amount, uint256 _destChain, address _recipient) external",
  "function burnNonce() view returns (uint256)",
  "event TokenMinted(address indexed srcToken, address indexed wrappedToken, address indexed recipient, uint256 amount, uint256 srcChain, uint256 nonce)",
  "event BurnRequest(uint256 indexed nonce, address indexed wrappedToken, address indexed sender, uint256 amount, uint256 destChain, address recipient)",
];

export const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];
