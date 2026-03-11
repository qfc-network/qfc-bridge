"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { BrowserProvider } from "ethers";

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  provider: BrowserProvider | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  provider: null,
  chainId: null,
  connect: async () => {},
  disconnect: () => {},
  switchChain: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask to use the bridge.");
      return;
    }
    const p = new BrowserProvider(window.ethereum);
    const accounts = await p.send("eth_requestAccounts", []);
    const network = await p.getNetwork();
    setProvider(p);
    setAddress(accounts[0]);
    setChainId(Number(network.chainId));
    localStorage.setItem("wallet_connected", "true");
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setProvider(null);
    setChainId(null);
    localStorage.removeItem("wallet_connected");
  }, []);

  const switchChain = useCallback(async (targetChainId: number) => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      const p = new BrowserProvider(window.ethereum);
      const network = await p.getNetwork();
      setProvider(p);
      setChainId(Number(network.chainId));
    } catch {
      // Chain not added - user needs to add it manually
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;
    if (localStorage.getItem("wallet_connected") === "true") {
      connect();
    }
    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (!accounts || accounts.length === 0) disconnect();
      else setAddress(accounts[0]);
    };
    const handleChainChanged = (..._args: unknown[]) => {
      connect();
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [connect, disconnect]);

  return (
    <WalletContext.Provider value={{ address, isConnected: !!address, provider, chainId, connect, disconnect, switchChain }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
