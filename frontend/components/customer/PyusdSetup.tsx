'use client';

import { useWeb3 } from '@/contexts/Web3Context';
import { WalletConnect } from '@/components/WalletConnect';
import { CONTRACT_ADDRESSES } from '@/config/address';
import { PYUSD_ABI } from '@/lib/contracts';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { readContract, writeContract, waitForTransaction, parseUnits } from '@/lib/contract-helpers';
import { motion } from 'framer-motion';

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
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold mb-6 text-gradient">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">Connect to manage your PYUSD</p>
          <WalletConnect />
        </motion.div>
      </div>
    );
  }

  const formattedBalance = balance ? Number(balance) / 1e6 : 0;
  const formattedAllowance = allowance ? Number(allowance) / 1e6 : 0;
  const needsApproval = formattedAllowance < 10;

  return (
    <div className="min-h-screen">
      <nav className="p-6 flex justify-between items-center border-b border-white/10 bg-black/50 backdrop-blur-md">
        <Link href="/customer">
          <h1 className="text-2xl font-bold cursor-pointer text-gradient hover:scale-105 transition">🎬 MOVIEX</h1>
        </Link>
        <WalletConnect />
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl md:text-5xl font-bold mb-8 text-gradient"
        >
          💳 PYUSD Setup
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel p-8 space-y-6"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-500/30"
          >
            <h3 className="text-xl font-bold mb-3 text-gradient">Your PYUSD Balance</h3>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
              className="text-5xl font-bold text-gradient"
            >
              {formattedBalance.toFixed(2)} PYUSD
            </motion.p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-xl p-6 border border-blue-500/30"
          >
            <h3 className="text-xl font-bold mb-3 text-gradient">Current Allowance</h3>
            <p className="text-3xl font-bold text-gradient">{formattedAllowance.toFixed(2)} PYUSD</p>
            <p className="text-sm text-gray-400 mt-2">
              This is how much PYUSD you've approved for instant ticket purchases
            </p>
          </motion.div>

          {needsApproval && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/50 rounded-xl p-6"
            >
              <h4 className="text-2xl font-bold mb-3 text-gradient">⚡ Enable Fast Checkout</h4>
              <p className="mb-4 text-gray-300">
                Approve PYUSD once and buy tickets instantly without waiting for approvals!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleApprove}
                disabled={approving}
                className="w-full btn-accent py-4 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {approving ? '⏳ Approving...' : 'Approve 1000 PYUSD'}
              </motion.button>
            </motion.div>
          )}

          {!needsApproval && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/50 rounded-xl p-6"
            >
              <h4 className="text-2xl font-bold mb-3 text-gradient">✅ Fast Checkout Enabled!</h4>
              <p className="mb-4 text-gray-300">
                You can now buy tickets instantly without approval delays.
              </p>
              <Link href="/customer">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-accent py-4 rounded-lg font-bold text-xl text-center"
                >
                  Browse Movies →
                </motion.div>
              </Link>
            </motion.div>
          )}

          {approveHash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 panel border border-blue-500/30"
            >
              <p className="text-sm text-gray-300">
                Transaction:{' '}
                <a
                  href={`https://sepolia.etherscan.io/tx/${approveHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-accent"
                >
                  {approveHash.slice(0, 10)}...{approveHash.slice(-8)}
                </a>
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="panel p-4 border border-blue-500/30"
          >
            <h4 className="font-bold mb-2 text-gradient">ℹ️ About PYUSD</h4>
            <p className="text-sm text-gray-300">
              PYUSD (PayPal USD) is a stablecoin used for payments in this app.
              Get test PYUSD from the{' '}
              <a
                href="https://faucet.circle.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="link-accent"
              >
                Circle Faucet
              </a>
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
