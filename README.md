# Sui TypeScript Project

A TypeScript project demonstrating basic interactions with the Sui blockchain, including wallet management, faucet requests, and token transfers.

## Features

- Wallet creation and management
- Automated faucet requests for test SUI tokens
- SUI token transfers between wallets
- Balance checking and conversion between SUI and MIST
- Network configuration for different environments (devnet, testnet)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Basic understanding of TypeScript and blockchain concepts

## Installation

1. Clone the repository:

```bash
git clone https://github.com/psyhedeliq/sui-blockchain
cd sui-typescript-project
```

2. Install dependencies:

```bash
npm install
```

## Configuration

The project uses Sui's devnet by default. To change networks, modify the `NETWORK` constant in:

```typescript
src/config.ts
```

## Usage

Run the project:

```bash
npx ts-node src/main.ts
```

The program will:

- Create or load existing wallets
- Request funds from the faucet (10 SUI per request)
- Transfer SUI between wallets (default 9 SUI)
- Display transaction results and balances

## Important Notes

- Keypair files are stored in the `src/keypairs` directory and are gitignored for security
- Each faucet request provides 10 SUI and costs 0.01 SUI
- Maximum transfer amount is limited by available balance (consider faucet amount minus gas fees)

## Security

- Never commit keypair files to version control
- Keep your private keys secure
- Use only test networks (devnet/testnet) for development
