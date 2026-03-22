import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { toast } from 'sonner';
import { CONTRACT_ADDRESS, ABI } from '../constants';

interface Web3ContextType {
  account: string | null;
  provider: BrowserProvider | null;
  contract: Contract | null;
  loading: boolean;
  connectWallet: () => Promise<void>;
  isLiskSepolia: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const LISK_SEPOLIA_CHAIN_ID = '0x106a';

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLiskSepolia, setIsLiskSepolia] = useState(false);

  const checkNetwork = useCallback(async (p: BrowserProvider) => {
    const network = await p.getNetwork();
    const correct = network.chainId === BigInt(4202);
    setIsLiskSepolia(correct);
    return correct;
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Metamask not found!");
      return;
    }

    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const browserProvider = new BrowserProvider(window.ethereum);
      
      const isCorrect = await checkNetwork(browserProvider);
      if (!isCorrect) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: LISK_SEPOLIA_CHAIN_ID }],
          });
        } catch (err: any) {
          if (err.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: LISK_SEPOLIA_CHAIN_ID,
                chainName: 'Lisk Sepolia',
                rpcUrls: ['https://rpc.sepolia-api.lisk.com'],
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                blockExplorerUrls: ['https://sepolia-blockscout.lisk.com'],
              }],
            });
          }
        }
      }

      setAccount(accounts[0]);
      setProvider(browserProvider);
      setContract(new Contract(CONTRACT_ADDRESS, ABI, browserProvider));
      toast.success("Connected to MetaMask");
    } catch (error: any) {
      toast.error(error.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: any) => {
        setAccount(accounts[0] || null);
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  return (
    <Web3Context.Provider value={{ account, provider, contract, loading, connectWallet, isLiskSepolia }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error("useWeb3 must be used within Web3Provider");
  return context;
};
