# Overview

This is a Web3 faucet application built with React, TypeScript, and Express that allows users to claim testnet ETH on Base Sepolia network. The application integrates with Gitcoin Passport for verification and implements rate limiting to prevent abuse. Users can connect their wallets, verify their humanity through Gitcoin Passport scores, and claim testnet tokens with a 7-day cooldown period.

**Developer**: [@CryptoExplor](https://github.com/CryptoExplor)  
**GitHub**: https://github.com/CryptoExplor  
**Year**: 2025  
**Status**: Production Ready - Successfully tested with live transactions

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React SPA**: Built with Vite as the build tool and bundler
- **UI Framework**: Shadcn/ui components with Radix UI primitives and Tailwind CSS for styling
- **State Management**: TanStack Query for server state management and custom hooks for wallet interactions
- **Routing**: Wouter for lightweight client-side routing
- **Wallet Integration**: Ethers.js for Ethereum wallet connectivity and blockchain interactions

## Backend Architecture
- **Express.js Server**: RESTful API server with middleware for logging and error handling
- **Database ORM**: Drizzle ORM with PostgreSQL for data persistence
- **Session Storage**: In-memory storage with fallback to PostgreSQL via connect-pg-simple
- **Rate Limiting**: Redis-based rate limiting using Upstash Redis for claim cooldowns

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless driver
- **Cache Layer**: Upstash Redis for rate limiting and session management
- **Schema Management**: Drizzle Kit for database migrations and schema changes
- **Data Models**: Users table for authentication and faucet_claims table for tracking token distributions

## Authentication and Authorization
- **Wallet-based Authentication**: Users authenticate through MetaMask or compatible Web3 wallets
- **Gitcoin Passport Integration**: Humanity verification through passport scores to prevent Sybil attacks
- **Rate Limiting**: 7-day (168 hours) cooldown period between claims per wallet address

## External Service Integrations
- **Gitcoin Passport API**: Fetches user verification scores for anti-bot protection
- **Base Sepolia Network**: Target blockchain network for testnet token distribution
- **Upstash Redis**: Cloud Redis service for distributed rate limiting
- **Neon Database**: Serverless PostgreSQL hosting

## Key Design Patterns
- **Monorepo Structure**: Shared schema and types between client and server in `/shared` directory
- **Component-based UI**: Reusable UI components following Shadcn/ui design system
- **API-first Architecture**: Clean separation between frontend and backend with REST endpoints
- **Error Boundary Handling**: Comprehensive error handling with user-friendly toast notifications
- **Responsive Design**: Mobile-first approach with Tailwind CSS utilities

# External Dependencies

## Third-party Services
- **Gitcoin Passport API**: User verification and scoring system
- **Base Sepolia RPC**: Ethereum testnet network for token transactions
- **Upstash Redis**: Managed Redis service for rate limiting
- **Neon Database**: Serverless PostgreSQL database hosting

## Key NPM Packages
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: TypeScript ORM for database operations
- **ethers**: Ethereum library for wallet and blockchain interactions
- **@radix-ui/***: Accessible UI component primitives
- **@upstash/redis**: Redis client for rate limiting
- **wouter**: Lightweight React router
- **tailwindcss**: Utility-first CSS framework
- **vite**: Fast build tool and development server

## Development Tools
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds
- **Drizzle Kit**: Database migration and introspection tool
- **Vite Runtime Error Modal**: Development error overlay for better debugging