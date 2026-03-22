import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Search, History, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { ABI, CONTRACT_ADDRESS } from '../constants';

interface Claim {
  user: string;
  amount: string;
  time: number;
}

export const ClaimExplorer: React.FC = () => {
  const { provider } = useWeb3();
  const [searchAddr, setSearchAddr] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [recentClaims, setRecentClaims] = useState<Claim[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Search function
  const handleSearch = async () => {
    if (!ethers.isAddress(searchAddr)) {
      toast.error('Invalid Ethereum address');
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      
      // Query all ClaimProcessed events for this user
      const filter = contract.filters.ClaimProcessed(searchAddr);
      const events = await contract.queryFilter(filter);
      
      let totalClaimed = BigInt(0);
      events.forEach((event: any) => {
        totalClaimed += event.args[1];
      });

      setSearchResult(ethers.formatEther(totalClaimed));
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch claim history');
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch claim history (last 60 days)
  const fetchRecentClaims = async () => {
    if (!provider) return;
    setIsLoadingHistory(true);

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      
      // Approximate blocks for 60 days
      // Assuming 2s block time on Lisk Sepolia: 60 * 24 * 60 * 60 / 2 = 2,592,000 blocks
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 2592000);
      
      const filter = contract.filters.ClaimProcessed();
      const events = await contract.queryFilter(filter, fromBlock);
      
      const claims: Claim[] = await Promise.all(
        events.map(async (event: any) => {
          const block = await event.getBlock();
          return {
            user: event.args[0],
            amount: ethers.formatEther(event.args[1]),
            time: block.timestamp * 1000
          };
        })
      );

      setRecentClaims(claims.sort((a, b) => b.time - a.time).slice(0, 10));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (provider) {
      fetchRecentClaims();
    }
  }, [provider]);

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="explorer-grid">
      <div className="grid-layout">
        {/* Search Card */}
        <div className="card">
          <h3>
            <Search size={24} className="text-primary" />
            Claim Lookup
          </h3>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Check total LH tokens claimed by any wallet address.
          </p>
          
          <div className="input-group">
            <div className="input-wrapper">
              <input 
                type="text" 
                placeholder="Enter wallet address (0x...)" 
                value={searchAddr}
                onChange={(e) => setSearchAddr(e.target.value)}
              />
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={handleSearch} 
            disabled={isSearching || !searchAddr}
          >
            {isSearching ? <Loader2 className="animate-spin" size={20} /> : 'Search History'}
          </button>

          <AnimatePresence>
            {searchResult !== null && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="stat-item"
                style={{ marginTop: '1.5rem', textAlign: 'center' }}
              >
                <div className="stat-label">Total Claimed by {shortenAddress(searchAddr)}</div>
                <div className="stat-value text-primary">{searchResult} LH</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>
              <History size={24} className="text-secondary" />
              Recent Claims (60 Days)
            </h3>
            <button className="btn btn-outline" style={{ width: 'auto', padding: '0.4rem' }} onClick={fetchRecentClaims}>
              <Loader2 className={isLoadingHistory ? "animate-spin" : ""} size={16} />
            </button>
          </div>

          <div className="claim-list">
            {isLoadingHistory && recentClaims.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading history...</div>
            ) : recentClaims.length > 0 ? (
              recentClaims.map((claim, idx) => (
                <motion.div 
                  key={idx} 
                  className="claim-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <User size={16} className="text-secondary" />
                    <div>
                      <div className="claim-address">{shortenAddress(claim.user)}</div>
                      <div className="claim-date">{new Date(claim.time).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="claim-amount">+{claim.amount} LH</div>
                </motion.div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                No recent claims found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
