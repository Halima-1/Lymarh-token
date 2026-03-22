import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Heart } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section className="about-section" style={{ padding: '4rem 0', textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #13110d 0%, #0a0907 100%)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '2rem',
          padding: '3rem 2rem',
          maxWidth: '900px',
          margin: '0 auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}
      >
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          Why <span className="text-primary">Lymarh</span>?
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
          Lymarh Protocol is a fast, community-centric utility token on Lisk Sepolia, designed for efficiency and absolute transparency.
        </p>

        <div className="about-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ color: 'var(--primary)', background: 'var(--primary-glow)', padding: '0.75rem', borderRadius: '1rem' }}>
              <Zap size={24} />
            </div>
            <h4 style={{ margin: 0 }}>Instant Speed</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Sub-second finality.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ color: 'var(--secondary)', background: 'rgba(251, 191, 36, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
              <Shield size={24} />
            </div>
            <h4 style={{ margin: 0 }}>Full Security</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Verified on-chain.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ color: 'var(--primary)', background: 'var(--primary-glow)', padding: '0.75rem', borderRadius: '1rem' }}>
              <Heart size={24} />
            </div>
            <h4 style={{ margin: 0 }}>Free to Claim</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Community first.</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
