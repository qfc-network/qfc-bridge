# QFC Bridge

QFC Bridge is a testnet cross-chain bridge UI and relayer stack for moving assets between:

- QFC Testnet
- Ethereum Sepolia
- BSC Testnet

## What is included

### Frontend (`/`)
- Next.js 14 + TypeScript + Tailwind
- MetaMask wallet connect
- Source / target chain selection
- Token selection and fee preview
- Auto network switch to the selected source chain
- Source-chain balance display
- Bridge progress tracker

### History (`/history`)
- Source + target transaction links
- Pending / Confirmed / Completed / Failed badges
- Optional "My Transactions" filter
- Auto-refresh every 15 seconds

### Status (`/status`)
- Relayer online/offline state
- 24h relay count
- Average bridge time
- Total bridged volume
- Liquidity pool cards per chain/token
- Warning banner for low-liquidity pools

### Relayer (`/relayer`)
- Multi-chain event listener
- SQLite-backed pending queue
- Proof-building abstraction (`src/prover.ts`)
- HTTP status + history endpoints on port `3295`

## Environment

### Frontend

Copy `.env.example` to `.env.local` and update bridge addresses after deployment.

```bash
cp .env.example .env.local
npm ci
npm run dev
```

### Relayer

```bash
cd relayer
cp .env.example .env
npm ci
npm run dev
```

## Docker

- Frontend image: `Dockerfile`
- Relayer image: `relayer/Dockerfile`
- GitHub Actions image publish: `.github/workflows/docker.yml`
- Example testnet stack: `docker-compose.testnet.yml`

## Contract deployment notes

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the bridge deployment checklist and the env values expected by this repo.
