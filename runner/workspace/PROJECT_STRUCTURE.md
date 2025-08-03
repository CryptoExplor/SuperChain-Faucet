# Web3 Faucet Project Structure

**Developer**: [@CryptoExplor](https://github.com/CryptoExplor)  
**Year**: 2025  
**Status**: Production Ready

## Core Files Structure

```
web3-faucet/
├── client/src/
│   ├── pages/
│   │   ├── faucet.tsx              # Main faucet interface
│   │   └── not-found.tsx           # 404 page
│   ├── hooks/
│   │   ├── use-wallet.ts           # MetaMask wallet integration
│   │   ├── use-toast.ts            # Toast notifications
│   │   └── use-mobile.tsx          # Responsive design hook
│   ├── lib/
│   │   ├── ethers.ts               # Ethereum utilities
│   │   ├── queryClient.ts          # TanStack Query setup
│   │   └── utils.ts                # General utilities
│   ├── components/ui/              # Shadcn/ui components (50+ files)
│   ├── App.tsx                     # Main React app
│   ├── main.tsx                    # React entry point
│   └── index.css                   # Global styles
├── server/
│   ├── routes.ts                   # API endpoints (Gitcoin, rate limit, claim)
│   ├── storage.ts                  # Data storage interface
│   ├── index.ts                    # Express server setup
│   └── vite.ts                     # Vite development server
├── shared/
│   └── schema.ts                   # Database schema (Drizzle ORM)
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── tailwind.config.ts              # Tailwind CSS config
├── vite.config.ts                  # Vite bundler config
├── drizzle.config.ts               # Database config
└── replit.md                       # Project documentation
```

## Key Features Implemented

### Frontend (React + TypeScript)
- MetaMask wallet connection
- Gitcoin Passport score verification
- Rate limiting countdown display
- Transaction status tracking
- Responsive UI with Shadcn/ui components

### Backend (Express + TypeScript)
- Gitcoin Passport API integration (v1/v2 fallback)
- 168-hour (7-day) rate limiting with Redis
- ETH token distribution to Base Sepolia
- Transaction confirmation and logging

### Database & Storage
- Drizzle ORM with PostgreSQL
- Upstash Redis for rate limiting
- User and faucet claims tracking

### Security & Verification
- Wallet-based authentication
- Gitcoin Passport anti-sybil protection
- Environment variable secrets management
- Rate limiting per wallet address

## Environment Variables Required
- `GITCOIN_API_KEY`: Gitcoin Passport API key
- `GITCOIN_SCORER_ID`: Gitcoin scorer ID
- `FAUCET_PRIVATE_KEY`: Wallet private key for sending ETH
- `BASE_SEPOLIA_RPC_URL`: Base Sepolia RPC endpoint
- `UPSTASH_REDIS_REST_URL`: Redis URL
- `UPSTASH_REDIS_REST_TOKEN`: Redis token

## Deployment Ready
✓ All TypeScript errors resolved  
✓ Successfully tested with live transactions  
✓ Production environment variables configured  
✓ Ready for Replit deployment