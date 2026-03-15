# Bridge Deployment Checklist

This repository consumes deployed bridge contract addresses; the contracts themselves live in `qfc-contracts`.

## Issue #6 scope

Deploy `CrossChainBridge.sol` to:
- ETH Sepolia
- BSC Testnet

## Testnet Faucets

Get free testnet tokens for deploying and testing the bridge:

| Chain | Faucet | Token |
|-------|--------|-------|
| QFC Testnet | https://faucet.testnet.qfc.network | 100 QFC (24h cooldown) |
| ETH Sepolia | https://cloud.google.com/application/web3/faucet/ethereum/sepolia | 0.05 ETH/day |
| ETH Sepolia | https://www.alchemy.com/faucets/ethereum-sepolia | 0.1 ETH/day (requires Alchemy account) |
| ETH Sepolia | https://faucets.chain.link/sepolia | 0.1 ETH (requires Chainlink account) |
| BSC Testnet | https://www.bnbchain.org/en/testnet-faucet | 0.1 BNB/day |

## What must happen in `qfc-contracts`

1. Add `sepolia` and `bscTestnet` network configs to `hardhat.config.ts`
2. Fund the deployer wallet with:
   - Sepolia ETH
   - BSC Testnet BNB
3. Run the bridge deployment script on both chains
4. Record the deployed addresses
5. Paste the resulting addresses into this repo's UI + relayer env files

## Expected frontend env

```env
NEXT_PUBLIC_BRIDGE_QFC=0x...
NEXT_PUBLIC_BRIDGE_ETH=0x...
NEXT_PUBLIC_BRIDGE_BSC=0x...
NEXT_PUBLIC_QFC_RPC=https://rpc.testnet.qfc.network
NEXT_PUBLIC_ETH_RPC=https://rpc.sepolia.org
NEXT_PUBLIC_BSC_RPC=https://data-seed-prebsc-1-s1.binance.org:8545
NEXT_PUBLIC_RELAYER_STATUS_URL=http://localhost:3295
```

## Expected relayer env

```env
QFC_RPC_URL=https://rpc.testnet.qfc.network
ETH_RPC_URL=https://rpc.sepolia.org
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
RELAYER_PRIVATE_KEY=
BRIDGE_ADDRESS_QFC=0x...
BRIDGE_ADDRESS_ETH=0x...
BRIDGE_ADDRESS_BSC=0x...
POLL_INTERVAL_MS=10000
PORT=3295
```

## Notes

- This repo is now ready to consume deployed addresses, but the actual on-chain deployment still requires access to the deployer key and funded testnet wallets.
- Once addresses are available, the frontend + relayer can be started without further code changes.
