import React, { useRef } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useTokenInfo } from '../hooks/useTokenInfo';
import { useContractActions } from '../hooks/useContractActions';
import {
  PlusCircle,
  Activity,
  ShieldCheck,
  Gift,
  ArrowRightLeft,
  Timer,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const ActionCards: React.FC = () => {
  const { account } = useWeb3();
  const info = useTokenInfo();
  const { transfer, claimTokens, mint, loadingAction } = useContractActions(info.refresh);

  // Refs
  const transferToRef = useRef<HTMLInputElement>(null);
  const transferAmountRef = useRef<HTMLInputElement>(null);
  const mintToRef = useRef<HTMLInputElement>(null);
  const mintAmountRef = useRef<HTMLInputElement>(null);

  // Countdown logic
  const [timeLeft, setTimeLeft] = React.useState<string>('');
  const [isReady, setIsReady] = React.useState<boolean>(true);

  React.useEffect(() => {
    const timer = setInterval(() => {
      const nextTime = (Number(info.lastClaimTime) + Number(info.waitDuration)) * 1000;
      const diff = nextTime - Date.now();

      if (diff <= 0 || Number(info.lastClaimTime) === 0) {
        setTimeLeft('');
        setIsReady(true);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Format as HH:MM:SS
        const h = String(hours).padStart(2, '0');
        const m = String(minutes).padStart(2, '0');
        const s = String(seconds).padStart(2, '0');
        
        setTimeLeft(`${h}:${m}:${s}`);
        setIsReady(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [info.lastClaimTime, info.waitDuration]);

  const handleClaimClick = async () => {
    if (!isReady) {
      toast.warning(`Please wait! You can claim again in ${timeLeft}`, {
        description: "The faucet has a 2-day cooldown period.",
        icon: <Info size={16} />
      });
      return;
    }
    await claimTokens();
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const to = transferToRef.current?.value;
    const amount = transferAmountRef.current?.value;
    if (to && amount) {
      await transfer(to, amount);
      if (transferToRef.current) transferToRef.current.value = '';
      if (transferAmountRef.current) transferAmountRef.current.value = '';
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    const to = mintToRef.current?.value;
    const amount = mintAmountRef.current?.value;
    if (to && amount) {
      await mint(to, amount);
      if (mintToRef.current) mintToRef.current.value = '';
      if (mintAmountRef.current) mintAmountRef.current.value = '';
    }
  };

  if (!account) return null;

  return (
    <div className="grid-layout">
      {/* Token Info Card */}
      <section className="card">
        <h3>Information</h3>
        <div className="stats-grid">
          <div className="stat-item"><div className="stat-label">Token</div><div className="stat-value">{info.name} ({info.symbol})</div></div>
          <div className="stat-item" style={{ gridColumn: 'span 2' }}>
            <div className="stat-label">My Balance</div>
            <div className="stat-value" style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>{Number(info.balance).toLocaleString()} {info.symbol}</div>
          </div>
          <div className="stat-item"><div className="stat-label">Supply</div><div className="stat-value">{Number(info.totalSupply).toLocaleString()}</div></div>
          <div className="stat-item"><div className="stat-label">Circulating</div><div className="stat-value">{Number(Number(info.totalSupply) - Number(info.remainingSupply)).toLocaleString()}</div></div>
        </div>
      </section>

      {/* Faucet Card */}
      <section className="card">
        <h3><Gift size={20} /> Token Faucet</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Get 1,000 free {info.symbol} tokens every 2 days.
        </p>
        <button
          className={`btn ${isReady ? 'btn-primary' : 'btn-outline'}`}
          onClick={handleClaimClick}
          disabled={loadingAction}
        >
          {loadingAction ? (
            <div className="loading-spinner" />
          ) : isReady ? (
            <Gift size={18} />
          ) : (
            <Timer size={18} />
          )}
          {isReady ? `Claim 1,000 ${info.symbol}` : `Next Claim in ${timeLeft}`}
        </button>
      </section>

      {/* Transfer Card */}
      <section className="card">
        <h3><ArrowRightLeft size={20} /> Transfer</h3>
        <form onSubmit={handleTransfer}>
          <div className="input-group">
            <label>Recipient Address</label>
            <input type="text" ref={transferToRef} placeholder="0x..." required />
          </div>
          <div className="input-group">
            <label>Amount</label>
            <input type="number" step="any" ref={transferAmountRef} placeholder="0.0" required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loadingAction}>
            {loadingAction ? <div className="loading-spinner" /> : <Activity size={18} />}
            Send Tokens
          </button>
        </form>
      </section>

      {/* Admin Card */}
      {info.isOwner && (
        <motion.section className="card" initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={{ border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <h3 style={{ color: 'var(--success)' }}><ShieldCheck size={20} /> Admin Minting</h3>
          <form onSubmit={handleMint}>
            <div className="input-group">
              <label>Target Address</label>
              <input type="text" ref={mintToRef} placeholder="0x..." required />
            </div>
            <div className="input-group">
              <label>Amount</label>
              <input type="number" step="any" ref={mintAmountRef} placeholder="0.0" required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loadingAction} style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
              {loadingAction ? <div className="loading-spinner" /> : <PlusCircle size={18} />}
              Authorize Mint
            </button>
          </form>
        </motion.section>
      )}
    </div>
  );
};
