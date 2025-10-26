// Deprecated wagmi-based helpers replaced with direct ethers.js usage.
// Keeping minimal exports to avoid import errors if any files still reference this module.
import { getSigner } from '@/lib/contract-helpers';

export async function getEthersSigner() {
  return await getSigner();
}

export const useEthersSigner = undefined as unknown as never;
