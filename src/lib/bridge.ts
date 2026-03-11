import { BrowserProvider, Contract, parseUnits, formatUnits } from "ethers";
import { BRIDGE_LOCK_ABI, ERC20_ABI } from "./abi";
import { CHAINS } from "./chains";
import { TOKENS, type TokenConfig } from "./tokens";

const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const FEE_BPS = 10;
const BPS_DENOMINATOR = 10_000;

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
  status: "Pending" | "Completed" | "Failed";
  txHash: string;
  targetTxHash?: string;
}

export function getMockHistory(): BridgeTx[] {
  return [
    {
      id: "1",
      timestamp: Date.now() - 3600000,
      fromChain: "eth",
      toChain: "qfc",
      token: "USDT",
      amount: "500.00",
      status: "Completed",
      txHash: "0xabc123def456789012345678901234567890abcdef1234567890abcdef123456",
      targetTxHash: "0xdef789abc123456789012345678901234567890abcdef1234567890abcdef789",
    },
    {
      id: "2",
      timestamp: Date.now() - 1800000,
      fromChain: "qfc",
      toChain: "bsc",
      token: "QFC",
      amount: "1000.00",
      status: "Completed",
      txHash: "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0",
    },
    {
      id: "3",
      timestamp: Date.now() - 600000,
      fromChain: "bsc",
      toChain: "eth",
      token: "USDC",
      amount: "250.00",
      status: "Pending",
      txHash: "0x456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123",
    },
    {
      id: "4",
      timestamp: Date.now() - 300000,
      fromChain: "eth",
      toChain: "qfc",
      token: "TTK",
      amount: "10000.00",
      status: "Failed",
      txHash: "0x789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456",
    },
  ];
}
