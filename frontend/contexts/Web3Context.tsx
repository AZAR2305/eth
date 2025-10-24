'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  address: string | null;
  isConnected: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToSepolia: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  isConnected: false,
  provider: null,
  signer: null,
  connect: async () => {},
  disconnect: () => {},
  switchToSepolia: async () => {},
});

export const useWeb3 = () => useContext(Web3Context);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkConnection();

    // Listen for account changes
    const eth = getInjectedEthereum();
    if (typeof window !== 'undefined' && eth) {
      eth.on?.('accountsChanged', handleAccountsChanged);
      eth.on?.('chainChanged', () => window.location.reload());
    }

    return () => {
      const eth = getInjectedEthereum();
      if (typeof window !== 'undefined' && eth?.removeListener) {
        eth.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAddress(accounts[0]);
      setIsConnected(true);
      setupProvider();
    } else {
      disconnect();
    }
  };

  const checkConnection = async () => {
    if (typeof window !== 'undefined') {
      try {
        const eth = getInjectedEthereum();
        if (!eth) return;
        const accounts = await eth.request({
          method: 'eth_accounts'
        });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          setupProvider();
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const setupProvider = () => {
    if (typeof window !== 'undefined') {
      const eth = getInjectedEthereum();
      if (!eth) return;
      const web3Provider = new ethers.BrowserProvider(eth);
      setProvider(web3Provider);
      web3Provider.getSigner().then(setSigner).catch(() => {});
    }
  };

  const connect = async () => {
    if (typeof window === 'undefined') {
      alert('Wallets are only available in the browser environment');
      return;
    }

    try {
      const eth = getInjectedEthereum();
      if (!eth) {
        // Try to guide users where MetaMask is installed but not exposing window.ethereum
        alert('No injected wallet detected. If MetaMask is installed, enable site access in the extension settings and reload.');
        return;
      }
      const accounts = await eth.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        setupProvider();
        
        // Switch to Sepolia if not already
        await switchToSepolia();
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      alert('Failed to connect wallet: ' + (error.message || 'Unknown error'));
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
  };

  const switchToSepolia = async () => {
    if (typeof window === 'undefined') return;

    try {
      const eth = getInjectedEthereum();
      if (!eth) return;
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
      });
    } catch (error: any) {
      // Chain not added, try to add it
      if (error.code === 4902) {
        try {
          const eth = getInjectedEthereum();
          if (!eth) return;
          await eth.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://ethereum-sepolia.publicnode.com'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]
          });
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError);
        }
      }
    }
  };

  // Prefer MetaMask if multiple providers are injected
  function getInjectedEthereum(): any | null {
    if (typeof window === 'undefined') return null;
    const w = window as any;
    const eth = w.ethereum;
    if (!eth) return null;
    if (eth.providers?.length) {
      // Find MetaMask provider if present
      const metamask = eth.providers.find((p: any) => p.isMetaMask);
      return metamask || eth.providers[0];
    }
    return eth;
  }

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <Web3Context.Provider
      value={{
        address,
        isConnected,
        provider,
        signer,
        connect,
        disconnect,
        switchToSepolia,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}
