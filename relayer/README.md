# QFC Bridge Relayer

Off-chain daemon for the QFC Bridge testnet stack.

## Responsibilities

1. Listen for bridge lock events on configured chains
2. Queue pending releases in SQLite
3. Build a relay-proof payload abstraction
4. Submit unlock transactions on destination chains
5. Expose status APIs for the frontend / ops pages

## Endpoints

- `GET /health` → liveness
- `GET /` → aggregate status
- `GET /history` → recent queued / completed relays

## Run locally

```bash
cp .env.example .env
npm ci
npm run dev
```
