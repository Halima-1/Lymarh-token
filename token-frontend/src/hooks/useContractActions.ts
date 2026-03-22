import { useCallback, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { parseUnits, Contract } from 'ethers';
import { toast } from 'sonner';

export const useContractActions = (refresh: () => Promise<void>) => {
  const { provider, contract } = useWeb3();
  const [loadingAction, setLoadingAction] = useState(false);

  const performAction = useCallback(async (action: (contract: Contract) => Promise<any>, successMsg: string) => {
    if (!contract || !provider) return;
    
    try {
      setLoadingAction(true);
      const signer = await provider.getSigner();
      const signedContract = contract.connect(signer) as Contract;
      
      const tx = await action(signedContract);
      toast.info("Transaction submitted...");
      await tx.wait();
      toast.success(successMsg);
      await refresh();
    } catch (err: any) {
      toast.error(err.reason || err.message || "Transaction failed");
    } finally {
      setLoadingAction(false);
    }
  }, [contract, provider, refresh]);

  const transfer = useCallback((to: string, amount: string) => 
    performAction(c => c.transfer(to, parseUnits(amount, 18)), "Transfer successful!"), 
  [performAction]);

  const claimTokens = useCallback(() => 
    performAction(c => c.claimTokens(), "Tokens claimed successfully!"), 
  [performAction]);

  const mint = useCallback((to: string, amount: string) => 
    performAction(c => c.mint(to, parseUnits(amount, 18)), "Tokens minted successfully!"), 
  [performAction]);

  return { transfer, claimTokens, mint, loadingAction };
};