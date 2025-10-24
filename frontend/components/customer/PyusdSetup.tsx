'use client';

import { useWeb3 } from '@/contexts/Web3Context';
import { WalletConnect } from '@/components/WalletConnect';
import { CONTRACT_ADDRESSES } from '@/config/address';
import { PYUSD_ABI } from '@/lib/contracts';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { readContract, writeContract, waitForTransaction, parseUnits } from '@/lib/contract-helpers';

export default function PyusdSetup() {
  const { address, isConnected } = useWeb3();
  const [approving, setApproving] = useState(false);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [allowance, setAllowance] = useState<bigint | null>(null);
  const [approveHash, setApproveHash] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) return;
    const load = async () => {
      try {
        const [bal, allow] = await Promise.all([
          readContract(
            CONTRACT_ADDRESSES.pyusd,
            PYUSD_ABI,
            'balanceOf',
            [address]
          ) as Promise<bigint>,
          readContract(
            CONTRACT_ADDRESSES.pyusd,
            PYUSD_ABI,
            'allowance',
            [address, CONTRACT_ADDRESSES.ticketEscrow]
          ) as Promise<bigint>,
        ]);
        setBalance(bal);
        setAllowance(allow);
      } catch (e) {
        console.error('Error loading PYUSD data:', e);
      }
    };
    load();
  }, [isConnected, address]);

  const handleApprove = async () => {
    try {
      setApproving(true);
      const tx = await writeContract(
        CONTRACT_ADDRESSES.pyusd,
        PYUSD_ABI,
        'approve',
        [CONTRACT_ADDRESSES.ticketEscrow, parseUnits('1000', 6)]
      );
      setApproveHash(tx.hash);
      await waitForTransaction(tx.hash);
      alert('✅ PYUSD approved! You can now buy tickets instantly!');
      setApproving(false);
      // refresh allowance
      if (address) {
        const allow = await readContract(
          CONTRACT_ADDRESSES.pyusd,
          PYUSD_ABI,
          'allowance',
          [address, CONTRACT_ADDRESSES.ticketEscrow]
        );
        setAllowance(allow);
      }
    } catch (error: any) {
      console.error('Approval failed:', error);
      alert(`Approval failed: ${error?.message || 'Unknown error'}`);
      setApproving(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-6">Connect Your Wallet</h2>
          <WalletConnect />
        </div>
      </div>
    );
  }

  const formattedBalance = balance ? Number(balance) / 1e6 : 0;
  const formattedAllowance = allowance ? Number(allowance) / 1e6 : 0;
  const needsApproval = formattedAllowance < 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white">
      <nav className="p-6 flex justify-between items-center border-b border-white/10">
        <Link href="/customer">
          <h1 className="text-2xl font-bold cursor-pointer">🎬 OnChain Cinema</h1>
        </Link>
        <WalletConnect />
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <h2 className="text-4xl font-bold mb-8">💳 PYUSD Setup</h2>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-4">Your PYUSD Balance</h3>
            <p className="text-4xl font-bold text-green-400">{formattedBalance.toFixed(2)} PYUSD</p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4">Current Allowance</h3>
            <p className="text-2xl font-bold text-blue-400">{formattedAllowance.toFixed(2)} PYUSD</p>
            <p className="text-sm text-gray-400 mt-2">
              This is how much PYUSD you've approved for instant ticket purchases
            </p>
          </div>

          {needsApproval && (
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-6">
              <h4 className="text-xl font-bold mb-3">⚡ Enable Fast Checkout</h4>
              <p className="mb-4">
                Approve PYUSD once and buy tickets instantly without waiting for approvals!
              </p>
              <button
                onClick={handleApprove}
                disabled={approving}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-4 rounded-lg font-bold text-xl disabled:bg-gray-600 disabled:text-white"
              >
                {approving ? '⏳ Approving...' : 'Approve 1000 PYUSD'}
              </button>
            </div>
          )}

          {!needsApproval && (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-6">
              <h4 className="text-xl font-bold mb-3">✅ Fast Checkout Enabled!</h4>
              <p className="mb-4">
                You can now buy tickets instantly without approval delays.
              </p>
              <Link
                href="/customer"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-lg font-bold text-xl text-center"
              >
                Browse Movies →
              </Link>
            </div>
          )}

          {approveHash && (
            <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500 rounded-lg">
              <p className="text-sm">
                Transaction: <a
                  href={`https://sepolia.etherscan.io/tx/${approveHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-300"
                >
                  {approveHash.slice(0, 10)}...{approveHash.slice(-8)}
                </a>
              </p>
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 mt-6">
            <h4 className="font-bold mb-2">ℹ️ About PYUSD</h4>
            <p className="text-sm text-gray-300">
              PYUSD (PayPal USD) is a stablecoin used for payments in this app. 
              Get test PYUSD from the{' '}
              <a 
                href="https://faucet.circle.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline text-blue-300"
              >
                Circle Faucet
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
