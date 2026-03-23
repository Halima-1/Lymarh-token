import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Contract, ethers } from 'ethers';
import { toast } from 'sonner';
import { CONTRACT_ADDRESS, ABI } from '../constants';

interface Web3ContextType {
  account: string | null;
  provider: BrowserProvider | null;
  contract: Contract | null;
  loading: boolean;
  connectWallet: () => Promise<void>;
  isLiskSepolia: boolean;
  tokenInfo: {
    name: string;
    symbol: string;
    totalSupply: string;
    remainingSupply: string;
    balance: string;
    owner: string;
    lastClaimTime: string;
    waitDuration: string;
    isOwner: boolean;
    canClaim: boolean;
  };
  refreshInfo: () => Promise<void>;
  disconnectWallet: () => void;
}

const INITIAL_TOKEN_DATA = {
  name: '',
  symbol: '',
  totalSupply: '0',
  remainingSupply: '0',
  balance: '0',
  owner: '',
  lastClaimTime: '0',
  waitDuration: '0',
  isOwner: false,
  canClaim: true
};

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const LISK_SEPOLIA_CHAIN_ID = '0x106a';

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLiskSepolia, setIsLiskSepolia] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(INITIAL_TOKEN_DATA);

  const fetchTokenData = useCallback(async (p: BrowserProvider, acc: string | null) => {
    if (!acc) {
      setTokenInfo(INITIAL_TOKEN_DATA);
      return;
    }

    try {
      const c = new Contract(CONTRACT_ADDRESS, ABI, p);
      const [name, symbol, totalSupply, remainingSupply, balance, owner, lastClaimTime, waitDuration] = await Promise.all([
        c.name(),
        c.symbol(),
        c.totalSupply(),
        c.remainingSupply(),
        c.balanceOf(acc),
        c.owner(),
        c.lastRequestTime(acc),
        c.WAIT_DURATION()
      ]);

      const isAccountOwner = acc.toLowerCase() === owner.toLowerCase();
      const nextTime = (Number(lastClaimTime) + Number(waitDuration)) * 1000;
      const canUserClaim = Number(lastClaimTime) === 0 || Date.now() > nextTime;

      setTokenInfo({
        name,
        symbol,
        totalSupply: ethers.formatUnits(totalSupply, 18),
        remainingSupply: ethers.formatUnits(remainingSupply, 18),
        balance: ethers.formatUnits(balance, 18),
        owner,
        lastClaimTime: lastClaimTime.toString(),
        waitDuration: waitDuration.toString(),
        isOwner: isAccountOwner,
        canClaim: canUserClaim
      });
    } catch (err) {
      console.error("Token info fetch error:", err);
    }
  }, []);

  const refreshInfo = useCallback(async () => {
    if (provider && account) {
      await fetchTokenData(provider, account);
    }
  }, [provider, account, fetchTokenData]);

  useEffect(() => {
    if (provider && account) {
      fetchTokenData(provider, account);
      const id = setInterval(() => fetchTokenData(provider, account), 15000);
      return () => clearInterval(id);
    }
  }, [provider, account, fetchTokenData]);

  const checkNetwork = useCallback(async (p: BrowserProvider) => {
    const network = await p.getNetwork();
    const correct = network.chainId === BigInt(4202);
    setIsLiskSepolia(correct);
    return correct;
  }, []);

  const handleConnect = async (isAutoConnect = false) => {
    if (!window.ethereum) {
      // Check if user is on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Deep link to open this page inside MetaMask's browser
        const dappUrl = window.location.href.split("//")[1];
        window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
        return;
      }

      if (!isAutoConnect) toast.error("MetaMask browser extension not found!");
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
      localStorage.setItem('isWalletConnected', 'true');
      if (!isAutoConnect) toast.success("Connected to MetaMask");
    } catch (error: any) {
      if (!isAutoConnect) toast.error(error.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setContract(null);
    localStorage.removeItem('isWalletConnected');
    toast.info("Wallet disconnected");
  }, []);

  const connectWallet = () => handleConnect(false);

  useEffect(() => {
    const isConnected = localStorage.getItem('isWalletConnected');
    if (isConnected === 'true' && window.ethereum) {
      handleConnect(true);
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: any) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, [disconnectWallet]);

  return (
    <Web3Context.Provider value={{ account, provider, contract, loading, connectWallet, disconnectWallet, isLiskSepolia, tokenInfo, refreshInfo }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error("useWeb3 must be used within Web3Provider");
  return context;
};
