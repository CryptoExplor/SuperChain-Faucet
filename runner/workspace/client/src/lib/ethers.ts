import { BrowserProvider, JsonRpcProvider, Wallet, formatEther, parseEther } from "ethers";

// Base Sepolia network configuration
export const BASE_SEPOLIA_CONFIG = {
  chainId: 84532,
  chainIdHex: "0x14a34",
  name: "Base Sepolia",
  rpcUrl: "https://sepolia.base.org",
  blockExplorer: "https://sepolia.basescan.org",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
};

export class EthersService {
  private provider: BrowserProvider | JsonRpcProvider | null = null;
  private signer: any = null;

  constructor() {
    if (typeof window !== "undefined" && window.ethereum) {
      this.provider = new BrowserProvider(window.ethereum);
    }
  }

  async getProvider(): Promise<BrowserProvider | JsonRpcProvider> {
    if (!this.provider) {
      if (typeof window !== "undefined" && window.ethereum) {
        this.provider = new BrowserProvider(window.ethereum);
      } else {
        // Fallback to Base Sepolia RPC
        this.provider = new JsonRpcProvider(BASE_SEPOLIA_CONFIG.rpcUrl);
      }
    }
    return this.provider;
  }

  async getSigner() {
    const provider = await this.getProvider();
    if (provider instanceof BrowserProvider) {
      this.signer = await provider.getSigner();
      return this.signer;
    }
    throw new Error("Cannot get signer from RPC provider");
  }

  async getAccount(): Promise<string | null> {
    try {
      const signer = await this.getSigner();
      return await signer.getAddress();
    } catch {
      return null;
    }
  }

  async getBalance(address: string): Promise<string> {
    const provider = await this.getProvider();
    const balance = await provider.getBalance(address);
    return formatEther(balance);
  }

  async requestAccounts(): Promise<string[]> {
    if (window.ethereum) {
      return await window.ethereum.request({ method: "eth_requestAccounts" });
    }
    throw new Error("MetaMask not found");
  }

  async switchNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask not found");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_SEPOLIA_CONFIG.chainIdHex }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: BASE_SEPOLIA_CONFIG.chainIdHex,
              chainName: BASE_SEPOLIA_CONFIG.name,
              nativeCurrency: BASE_SEPOLIA_CONFIG.nativeCurrency,
              rpcUrls: [BASE_SEPOLIA_CONFIG.rpcUrl],
              blockExplorerUrls: [BASE_SEPOLIA_CONFIG.blockExplorer],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  formatAddress(address: string): string {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  getExplorerUrl(txHash: string): string {
    return `${BASE_SEPOLIA_CONFIG.blockExplorer}/tx/${txHash}`;
  }

  parseEther(value: string): bigint {
    return parseEther(value);
  }

  formatEther(value: bigint): string {
    return formatEther(value);
  }
}

export const ethersService = new EthersService();
