import { Web3Provider, useWeb3 } from './context/Web3Context';
import { ActionCards } from './components/ActionCards';
import { Coins, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import './App.css';

const AppContent: React.FC = () => {
  const { account, connectWallet, loading } = useWeb3();

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="app-container">
      <div className="mesh-gradient" />
      <Toaster position="top-right" richColors theme="dark" />
      
      <header>
        <div className="logo">
          <Coins size={32} strokeWidth={2.5} />
          <span>Lymarh Protocol</span>
        </div>
        
        {account ? (
          <div className="wallet-badge">
            <div className="indicator" />
            <span>{shortenAddress(account)}</span>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={connectWallet} disabled={loading} style={{ width: 'auto', padding: '0.5rem 1.5rem' }}>
            <Wallet size={18} />
            Connect Wallet
          </button>
        )}
      </header>

      <main>
        <motion.section 
          className="hero-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>The Next-Gen Utility Token</h1>
          <p>Lymarh (LH) powers the decentralized future of Lisk. Secure, fast, and community-driven.</p>
          
          {!account && (
            <motion.div 
              style={{ marginTop: '2rem' }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
            >
              <button className="btn btn-primary" onClick={connectWallet} style={{ width: 'auto', padding: '1rem 3rem', fontSize: '1.25rem' }}>
                Start Your Journey
              </button>
            </motion.div>
          )}
        </motion.section>

        <ActionCards />
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
