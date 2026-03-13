import { BrowserProvider, Contract, parseUnits, formatUnits } from "ethers";
import { BRIDGE_LOCK_ABI, ERC20_ABI } from "./abi";
import { CHAINS } from "./chains";
import { type TokenConfig } from "./tokens";

const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const FEE_BPS = 10;
const BPS_DENOMINATOR = 10_000;
export const HISTORY_REFRESH_MS = 15_000;

export function estimateFee(amount: number): { fee: number; received: number } {
  const fee = (amount * FEE_BPS) / BPS_DENOMINATOR;
  return { fee, received: amount - fee };
}

export async function lockTokens(
  provider: BrowserProvider,
  token: TokenConfig,
  amount: string,
  sourceChainKey: string,
  targetChainKey: string,
  recipient: string
): Promise<string> {
  const signer = await provider.getSigner();
  const sourceChain = CHAINS[sourceChainKey];
  const targetChain = CHAINS[targetChainKey];

  if (!sourceChain?.bridgeAddress) {
    throw new Error(`Bridge not configured for ${sourceChain?.name || sourceChainKey}`);
  }

  const bridge = new Contract(sourceChain.bridgeAddress, BRIDGE_LOCK_ABI, signer);
  const parsedAmount = parseUnits(amount, token.decimals);
  const tokenAddress = token.addresses[sourceChainKey];

  let tx;
  if (tokenAddress === NATIVE_TOKEN) {
    tx = await bridge.lockETH(targetChain.chainId, recipient, {
      value: parsedAmount,
    });
  } else {
    const erc20 = new Contract(tokenAddress, ERC20_ABI, signer);
    const allowance = await erc20.allowance(recipient, sourceChain.bridgeAddress);
    if (allowance < parsedAmount) {
      const approveTx = await erc20.approve(sourceChain.bridgeAddress, parsedAmount);
      await approveTx.wait();
    }
    tx = await bridge.lock(tokenAddress, parsedAmount, targetChain.chainId, recipient);
  }

  const receipt = await tx.wait();
  return receipt.hash;
}

export async function getTokenBalance(
  provider: BrowserProvider,
  token: TokenConfig,
  chainKey: string,
  address: string
): Promise<string> {
  const tokenAddress = token.addresses[chainKey];
  if (!tokenAddress) return "0";

  if (tokenAddress === NATIVE_TOKEN) {
    const balance = await provider.getBalance(address);
    return formatUnits(balance, token.decimals);
  }

  const erc20 = new Contract(tokenAddress, ERC20_ABI, provider);
  const balance = await erc20.balanceOf(address);
  return formatUnits(balance, token.decimals);
}

export interface BridgeTx {
  id: string;
  timestamp: number;
  fromChain: string;
  toChain: string;
  token: string;
  amount: string;
  status: "Pending" | "Confirmed" | "Completed" | "Failed";
  txHash: string;
  sender: string;
  recipient: string;
  targetTxHash?: string;
}

const MOCK_HISTORY: BridgeTx[] = [
  {
    id: "1",
    timestamp: Date.now() - 3_600_000,
    fromChain: "eth",
    toChain: "qfc",
    token: "USDT",
    amount: "500.00",
    status: "Completed",
    txHash: "0xabc123def456789012345678901234567890abcdef1234567890abcdef123456",
    targetTxHash: "0xdef789abc123456789012345678901234567890abcdef1234567890abcdef789",
    sender: "0x1B2c3D4e5F6789012345678901234567890ABcD1",
    recipient: "0x1B2c3D4e5F6789012345678901234567890ABcD1",
  },
  {
    id: "2",
    timestamp: Date.now() - 2_100_000,
    fromChain: "qfc",
    toChain: "bsc",
    token: "QFC",
    amount: "1000.00",
    status: "Confirmed",
    txHash: "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0",
    sender: "0x8f2D4334C6Bc4dA12A3E5A0F9f7D3278a4f6D321",
    recipient: "0x8f2D4334C6Bc4dA12A3E5A0F9f7D3278a4f6D321",
  },
  {
    id: "3",
    timestamp: Date.now() - 600_000,
    fromChain: "bsc",
    toChain: "eth",
    token: "USDC",
    amount: "250.00",
    status: "Pending",
    txHash: "0x456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123",
    sender: "0x1B2c3D4e5F6789012345678901234567890ABcD1",
    recipient: "0x1B2c3D4e5F6789012345678901234567890ABcD1",
  },
  {
    id: "4",
    timestamp: Date.now() - 300_000,
    fromChain: "eth",
    toChain: "qfc",
    token: "TTK",
    amount: "10000.00",
    status: "Failed",
    txHash: "0x789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456",
    sender: "0x9A1C23d56e789012345678901234567890ABcDeF",
    recipient: "0x9A1C23d56e789012345678901234567890ABcDeF",
  },
];

function sameAddress(a?: string | null, b?: string | null) {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase();
}

export function getMockHistory(address?: string | null): BridgeTx[] {
  const items = [...MOCK_HISTORY].sort((a, b) => b.timestamp - a.timestamp);
  if (!address) return items;
  return items.filter((tx) => sameAddress(tx.sender, address) || sameAddress(tx.recipient, address));
}

export interface PoolData {
  chain: string;
  token: string;
  balance: number;
  minThreshold: number;
}

export interface RelayerStatusSnapshot {
  online: boolean;
  lastRelay: number;
  relaysToday: number;
  avgBridgeTimeMs: number;
  totalVolume: number;
  pendingCount: number;
}

export function getMockPoolSnapshot(): PoolData[] {
  return [
    { chain: "qfc", token: "QFC", balance: 148_250, minThreshold: 12_000 },
    { chain: "qfc", token: "USDT", balance: 92_300, minThreshold: 10_000 },
    { chain: "qfc", token: "USDC", balance: 8_950, minThreshold: 10_000 },
    { chain: "qfc", token: "TTK", balance: 12_400, minThreshold: 8_000 },
    { chain: "eth", token: "QFC", balance: 44_800, minThreshold: 12_000 },
    { chain: "eth", token: "USDT", balance: 23_500, minThreshold: 10_000 },
    { chain: "eth", token: "USDC", balance: 18_200, minThreshold: 10_000 },
    { chain: "eth", token: "TTK", balance: 6_750, minThreshold: 8_000 },
    { chain: "bsc", token: "QFC", balance: 52_900, minThreshold: 12_000 },
    { chain: "bsc", token: "USDT", balance: 10_800, minThreshold: 10_000 },
    { chain: "bsc", token: "USDC", balance: 11_100, minThreshold: 10_000 },
    { chain: "bsc", token: "TTK", balance: 19_800, minThreshold: 8_000 },
  ];
}

export function getMockRelayerStatus(): RelayerStatusSnapshot {
  return {
    online: true,
    lastRelay: Date.now() - 45_000,
    relaysToday: 142,
    avgBridgeTimeMs: 32_000,
    totalVolume: 2_456_789,
    pendingCount: 3,
  };
}
