# Bridge Deployment Checklist

This repository consumes deployed bridge contract addresses; the contracts themselves live in `qfc-contracts`.

## Deployed Contracts

All three chains are now deployed:

### QFC Testnet (Chain ID: 9000)

| Contract | Address |
|----------|---------|
| BridgeRelayerManager | `0xc216c986fc2e27e18ad8260ee4e64beab394563d` |
| BridgeLock | `0x47ea0e0cdc65cc1f4f7b21f922219139f23e1a27` |
| BridgeMint | `0x2fb46fab5153b2f1047f033e1f8a79c483a9a048` |

### ETH Sepolia (Chain ID: 11155111)

| Contract | Address |
|----------|---------|
| BridgeRelayerManager | — |
| BridgeLock | `0x8E6d4cD14EB6eEFeB040a6ecE53d11dC9ef8137C` |
| BridgeMint | `0xD3F854ea9f1f3B5E720bEE07aF91729572b35558` |
| WQFC Token | `0xeFA4d4559B541A3e94Ae44E5123709E2FF2b7107` |

### BSC Testnet (Chain ID: 97)

| Contract | Address |
|----------|---------|
| BridgeRelayerManager | `0xD2B316820c75cFD7FD47B0B37aB8d00996e72B1E` |
| BridgeLock | `0x8E6d4cD14EB6eEFeB040a6ecE53d11dC9ef8137C` |
| BridgeMint | `0xD3F854ea9f1f3B5E720bEE07aF91729572b35558` |
| wETH | `0x19c8CE4a49a50737FC1D64E6Bf2b226b74DA8c02` |
| wUSDC | `0x8f58D3D4dcbe6BC40EC99394907Cb9dc3dEAC8bB` |
| wBTC | `0xA4f0d3c1E0DCf543083676Cda02210D579c41D53` |

## Testnet Faucets

Get free testnet tokens for deploying and testing the bridge:

| Chain | Faucet | Token |
|-------|--------|-------|
| QFC Testnet | https://faucet.testnet.qfc.network | 100 QFC (24h cooldown) |
| ETH Sepolia | https://cloud.google.com/application/web3/faucet/ethereum/sepolia | 0.05 ETH/day |
| ETH Sepolia | https://www.alchemy.com/faucets/ethereum-sepolia | 0.1 ETH/day (requires Alchemy account) |
| ETH Sepolia | https://faucets.chain.link/sepolia | 0.1 ETH (requires Chainlink account) |
| BSC Testnet | https://www.bnbchain.org/en/testnet-faucet | 0.1 BNB/day (requires 0.002 BNB on mainnet) |

## Frontend env

```env
NEXT_PUBLIC_BRIDGE_QFC=0x47ea0e0cdc65cc1f4f7b21f922219139f23e1a27
NEXT_PUBLIC_BRIDGE_ETH=0x8E6d4cD14EB6eEFeB040a6ecE53d11dC9ef8137C
NEXT_PUBLIC_BRIDGE_BSC=0x8E6d4cD14EB6eEFeB040a6ecE53d11dC9ef8137C
NEXT_PUBLIC_QFC_RPC=https://rpc.testnet.qfc.network
NEXT_PUBLIC_ETH_RPC=https://rpc.sepolia.org
NEXT_PUBLIC_BSC_RPC=https://data-seed-prebsc-1-s1.binance.org:8545
NEXT_PUBLIC_RELAYER_STATUS_URL=http://localhost:3295
```

## Relayer env

```env
QFC_RPC_URL=https://rpc.testnet.qfc.network
ETH_RPC_URL=https://rpc.sepolia.org
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
RELAYER_PRIVATE_KEY=
BRIDGE_ADDRESS_QFC=0x47ea0e0cdc65cc1f4f7b21f922219139f23e1a27
BRIDGE_ADDRESS_ETH=0x8E6d4cD14EB6eEFeB040a6ecE53d11dC9ef8137C
BRIDGE_ADDRESS_BSC=0x8E6d4cD14EB6eEFeB040a6ecE53d11dC9ef8137C
POLL_INTERVAL_MS=10000
PORT=3295
```

## Notes

- All contracts deployed. Frontend + relayer can be started by copying `.env.example` to `.env.local` (frontend) or `.env` (relayer).
- Relayer private key must be set to the relayer wallet that was registered in BridgeRelayerManager on each chain.
- Deployer address: `0x46e95879eD225038760617c33362da692412a8AC`
