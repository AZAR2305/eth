import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, NETWORK } from '@/config/address';

// Get provider and signer
export const getProvider = () => {
  // Prefer MetaMask when available
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  // Fallback to public RPC for read-only
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || NETWORK?.rpcUrl;
  if (!rpcUrl) {
    throw new Error('No provider available: MetaMask missing and NEXT_PUBLIC_RPC_URL not set');
  }
  return new ethers.JsonRpcProvider(rpcUrl);
};

export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

// Read contract data
export const readContract = async (
  address: string,
  abi: any[] | readonly any[],
  functionName: string,
  args: any[] = []
) => {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(address, abi, provider);
    const result = await contract[functionName](...args);
    return result;
  } catch (error) {
    console.error(`Error reading ${functionName}:`, error);
    throw error;
  }
};

// Write contract data
export const writeContract = async (
  address: string,
  abi: any[] | readonly any[],
  functionName: string,
  args: any[] = [],
  value?: bigint
) => {
  try {
    const signer = await getSigner();
    const contract = new ethers.Contract(address, abi, signer);
    
    const tx = value 
      ? await contract[functionName](...args, { value })
      : await contract[functionName](...args);
    
    return tx;
  } catch (error) {
    console.error(`Error writing ${functionName}:`, error);
    throw error;
  }
};

// Wait for transaction
export const waitForTransaction = async (txHash: string) => {
  try {
    const provider = getProvider();
    const receipt = await provider.waitForTransaction(txHash);
    return receipt;
  } catch (error) {
    console.error('Error waiting for transaction:', error);
    throw error;
  }
};

// Format units (like formatUnits from viem)
export const formatUnits = (value: bigint, decimals: number = 18): string => {
  return ethers.formatUnits(value, decimals);
};

// Parse units (like parseUnits from viem)
export const parseUnits = (value: string, decimals: number = 18): bigint => {
  return ethers.parseUnits(value, decimals);
};

// Get current account
export const getCurrentAccount = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    return null;
  }
  
  try {
    const accounts = await (window as any).ethereum.request({
      method: 'eth_accounts'
    });
    return accounts[0] || null;
  } catch (error) {
    console.error('Error getting account:', error);
    return null;
  }
};

// Connect wallet
export const connectWallet = async (): Promise<string> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('MetaMask not found');
  }
  
  try {
    const accounts = await (window as any).ethereum.request({
      method: 'eth_requestAccounts'
    });
    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};
