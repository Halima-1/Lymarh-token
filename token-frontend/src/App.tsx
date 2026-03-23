import { Web3Provider, useWeb3 } from './context/Web3Context';
import { ActionCards } from './components/ActionCards';
import { ClaimExplorer } from './components/ClaimExplorer';
import { AboutSection } from './components/AboutSection';
import { UserDirectory } from './components/UserDirectory';
import { useTokenInfo } from './hooks/useTokenInfo';
import { Coins, Wallet, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { useState, useEffect } from 'react';
import './App.css';

const AppContent: React.FC = () => {
  const { account, connectWallet, disconnectWallet, loading } = useWeb3();
  const info = useTokenInfo();
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  );

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-theme' : '';
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="app-container">
      <div className="mesh-gradient" />
      <Toaster position="top-right" richColors theme={theme} />

      <header>
        <div className="logo">
          <Coins size={32} strokeWidth={2.5} />
          <span>Lymarh Protocol</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn btn-outline" onClick={toggleTheme} style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {account ? (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
               <div className="wallet-badge" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                  <Coins size={14} className="text-primary" />
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{Number(info.balance).toLocaleString()} {info.symbol}</span>
               </div>
               <div className="wallet-badge" onClick={disconnectWallet} style={{ cursor: 'pointer' }} title="Click to disconnect">
                  <div className="indicator" />
                  <span>{shortenAddress(account)}</span>
               </div>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={connectWallet} disabled={loading} style={{ width: 'auto', padding: '0.5rem 1.5rem' }}>
              <Wallet size={18} />
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <main>
        <section className="hero-section">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ marginBottom: '1.5rem' }}
          >
            {/* <div className="hero-badge">Web3 Native Utility</div> */}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Claim. Hold. Transact.
            Welcome to Lymarh Token.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Lymarh (LH), A fast, secure, community-driven token built natively on Lisk Sepolia.
          </motion.p>

          <AnimatePresence>
            {!account && (
              <motion.div
                style={{ marginTop: '3rem' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <motion.button
                  className="btn btn-primary btn-hero"
                  onClick={connectWallet}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px var(--primary-glow)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Your Journey
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <AboutSection />

        <ActionCards />
        <ClaimExplorer />
        <UserDirectory />
      </main>

      <footer style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        <p>© 2026 Lymarh Protocol. Built on Lisk Sepolia.</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <Web3Provider>
    <AppContent />
  </Web3Provider>
);

export default App;
