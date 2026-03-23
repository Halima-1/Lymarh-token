import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { User, ShieldCheck, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { ABI, CONTRACT_ADDRESS } from '../constants';
import { useTokenInfo } from '../hooks/useTokenInfo';

export const UserDirectory: React.FC = () => {
  const { provider } = useWeb3();
  const { isOwner } = useTokenInfo();
  const [uniqueUsers, setUniqueUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    if (!provider || !isOwner) return;
    setIsLoading(true);

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      
      // Query ALL ClaimProcessed events to find unique addresses
      const filter = contract.filters.ClaimProcessed();
      const events = await contract.queryFilter(filter);
      
      // Extract unique user addresses
      const userSet = new Set<string>();
      events.forEach((event: any) => {
        userSet.add(event.args[0]);
      });

      setUniqueUsers(Array.from(userSet));
    } catch (error) {
      console.error("Error fetching unique users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOwner) {
      fetchUsers();
    }
  }, [isOwner, provider]);

  if (!isOwner) return null;

  const filteredUsers = uniqueUsers.filter(u => 
    u.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="user-directory" style={{ marginTop: '4rem' }}>
      <div className="card" style={{ border: '2px dashed var(--primary)', background: 'rgba(251, 191, 36, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck className="text-primary" size={28} />
              Owner Dashboard: User Directory
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Total unique wallets that have interacted with the faucet: <strong>{uniqueUsers.length}</strong>
            </p>
          </div>
          
          <div className="input-group" style={{ margin: 0, maxWidth: '300px' }}>
            <div className="input-wrapper">
              <Search size={18} style={{ opacity: 0.5 }} />
              <input 
                type="text" 
                placeholder="Search address..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '0.5rem' }}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Loader2 className="animate-spin text-primary" size={32} style={{ margin: '0 auto' }} />
            <p style={{ marginTop: '1rem' }}>Scanning blockchain for interactions...</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '1rem',
            maxHeight: '400px',
            overflowY: 'auto',
            paddingRight: '0.5rem'
          }}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, idx) => (
                <motion.div 
                  key={user}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  style={{ 
                    background: 'var(--bg-dark)', 
                    padding: '1rem', 
                    borderRadius: '1rem', 
                    border: '1px solid var(--border-card)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.8125rem'
                  }}
                >
                  <User size={16} className="text-secondary" />
                  <span style={{ fontFamily: 'monospace' }}>{user.slice(0, 6)}...{user.slice(-4)}</span>
                </motion.div>
              ))
            ) : (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', opacity: 0.5 }}>
                {searchTerm ? 'No matching addresses found.' : 'No users found yet.'}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
