import { useState, useEffect } from "react";
import { BrowserProvider, type Eip1193Provider } from "ethers";

const BASE_SEPOLIA_CHAIN_ID = "0x14a34"; // 84532 in hex

interface WalletState {
  account: string | null;
  isConnecting: boolean;
  provider: BrowserProvider | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    account: null,
    isConnecting: false,
    provider: null,
  });

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          setState(prev => ({
            ...prev,
            account: accounts[0].address,
            provider,
          }));
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setState(prev => ({
          ...prev,
          account: accounts.length > 0 ? accounts[0] : null,
        }));
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      
      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    setState(prev => ({ ...prev, isConnecting: true }));

    try {
      const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      setState(prev => ({
        ...prev,
        account: accounts[0],
        provider,
        isConnecting: false,
      }));

      return accounts[0];
    } catch (error: any) {
      setState(prev => ({ ...prev, isConnecting: false }));
      throw error;
    }
  };

  const switchToBaseSepolia = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    try {
      // Try to switch to Base Sepolia
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // If the chain doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: BASE_SEPOLIA_CHAIN_ID,
              chainName: "Base Sepolia",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://sepolia.base.org"],
              blockExplorerUrls: ["https://sepolia.basescan.org"],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  };

  return {
    account: state.account,
    isConnecting: state.isConnecting,
    provider: state.provider,
    connect,
    switchToBaseSepolia,
  };
}

// Extend window object for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}
