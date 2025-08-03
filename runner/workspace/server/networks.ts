import { db } from "./db";
import { networks, type Network, type InsertNetwork } from "@shared/schema";
import { eq } from "drizzle-orm";

// Comprehensive Superchain Network configurations - all using same private key
export const SUPPORTED_NETWORKS: InsertNetwork[] = [
  {
    name: "Base Sepolia",
    chainId: 84532,
    rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
    nativeCurrency: "ETH",
    explorerUrl: "https://sepolia.basescan.org",
    faucetAmount: "0.001",
    isActive: true,
    iconUrl: "/networks/base.svg",
  },
  {
    name: "Optimism Sepolia",
    chainId: 11155420,
    rpcUrl: process.env.OPTIMISM_SEPOLIA_RPC_URL || "https://sepolia.optimism.io",
    nativeCurrency: "ETH",
    explorerUrl: "https://sepolia-optimism.etherscan.io",
    faucetAmount: "0.001",
    isActive: true,
    iconUrl: "/networks/optimism.svg",
  },
  {
    name: "Arbitrum Sepolia",
    chainId: 421614,
    rpcUrl: process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
    nativeCurrency: "ETH",
    explorerUrl: "https://sepolia.arbiscan.io",
    faucetAmount: "0.001",
    isActive: true,
    iconUrl: "/networks/arbitrum.svg",
  },
  {
    name: "Mode Sepolia",
    chainId: 919,
    rpcUrl: process.env.MODE_SEPOLIA_RPC_URL || "https://sepolia.mode.network",
    nativeCurrency: "ETH",
    explorerUrl: "https://sepolia.explorer.mode.network",
    faucetAmount: "0.001",
    isActive: true,
    iconUrl: "/networks/mode.svg",
  },
  {
    name: "Zora Sepolia",
    chainId: 999999999,
    rpcUrl: process.env.ZORA_SEPOLIA_RPC_URL || "https://sepolia.rpc.zora.energy",
    nativeCurrency: "ETH",
    explorerUrl: "https://sepolia.explorer.zora.energy",
    faucetAmount: "0.001",
    isActive: true,
    iconUrl: "/networks/zora.svg",
  },
  {
    name: "Ink Sepolia",
    chainId: 763373,
    rpcUrl: process.env.INK_SEPOLIA_RPC_URL || "https://rpc-gel-sepolia.inkonchain.com",
    nativeCurrency: "ETH",
    explorerUrl: "https://explorer-sepolia.inkonchain.com",
    faucetAmount: "0.001",
    isActive: true,
    iconUrl: "/networks/ink.svg",
  },
  {
    name: "Unichain Sepolia",
    chainId: 1301,
    rpcUrl: process.env.UNICHAIN_SEPOLIA_RPC_URL || "https://sepolia.unichain.org",
    nativeCurrency: "ETH",
    explorerUrl: "https://sepolia.uniscan.xyz",
    faucetAmount: "0.001",
    isActive: true,
    iconUrl: "/networks/unichain.svg",
  },
  {
    name: "Blast Sepolia",
    chainId: 168587773,
    rpcUrl: process.env.BLAST_SEPOLIA_RPC_URL || "https://sepolia.blast.io",
    nativeCurrency: "ETH",
    explorerUrl: "https://testnet.blastscan.io",
    faucetAmount: "0.001",
    isActive: true,
    iconUrl: "/networks/blast.svg",
  },
  {
    name: "Frax Sepolia",
    chainId: 2522,
    rpcUrl: process.env.FRAX_SEPOLIA_RPC_URL || "https://rpc.testnet.frax.com",
    nativeCurrency: "frxETH",
    explorerUrl: "https://holesky.fraxscan.com",
    faucetAmount: "0.001",
    isActive: true,
    iconUrl: "/networks/frax.svg",
  },
  {
    name: "Cyber Sepolia",
    chainId: 111557560,
    rpcUrl: process.env.CYBER_SEPOLIA_RPC_URL || "https://cyber-testnet.alt.technology",
    nativeCurrency: "ETH",
    explorerUrl: "https://testnet.cyberscan.co",
    faucetAmount: "0.001",
    isActive: true,
    iconUrl: "/networks/cyber.svg",
  },
];

// Initialize networks in database
export async function initializeNetworks() {
  try {
    for (const networkConfig of SUPPORTED_NETWORKS) {
      const existing = await db
        .select()
        .from(networks)
        .where(eq(networks.chainId, networkConfig.chainId))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(networks).values(networkConfig);
        console.log(`✓ Initialized network: ${networkConfig.name}`);
      }
    }
  } catch (error) {
    console.error("Failed to initialize networks:", error);
  }
}

// Get all active networks
export async function getActiveNetworks(): Promise<Network[]> {
  return await db
    .select()
    .from(networks)
    .where(eq(networks.isActive, true));
}

// Get network by chain ID
export async function getNetworkByChainId(chainId: number): Promise<Network | null> {
  const result = await db
    .select()
    .from(networks)
    .where(eq(networks.chainId, chainId))
    .limit(1);
  
  return result[0] || null;
}

// Get network by ID
export async function getNetworkById(id: string): Promise<Network | null> {
  const result = await db
    .select()
    .from(networks)
    .where(eq(networks.id, id))
    .limit(1);
  
  return result[0] || null;
}

// All Superchain networks use the same private key for unified deployment
export function getNetworkPrivateKeyEnv(chainId: number): string {
  return "FAUCET_PRIVATE_KEY";
}