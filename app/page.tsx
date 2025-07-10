'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="container py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              P
            </div>
            <span className="text-xl font-bold text-gradient">Private Rideshare</span>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container section">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="h1 mb-6">
            Privacy-First <span className="text-gradient">Rideshare</span> Platform
          </h1>
          <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto">
            Experience decentralized ridesharing with fully encrypted location data
            and fare information. Built on Ethereum with cutting-edge privacy technology.
          </p>

          {isConnected ? (
            <div className="flex gap-4 justify-center">
              <Link href="/passenger" className="btn btn-primary btn-lg">
                Request Ride
              </Link>
              <Link href="/driver" className="btn btn-secondary btn-lg">
                Become Driver
              </Link>
            </div>
          ) : (
            <div className="glass-card inline-block">
              <p className="text-muted mb-4">Connect your wallet to get started</p>
              <ConnectButton />
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container section">
        <div className="grid-auto">
          <div className="stat-card">
            <div className="stat-label">Total Rides</div>
            <div className="stat-value">12,459</div>
            <div className="stat-change positive">
              ↑ 23% from last month
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Active Drivers</div>
            <div className="stat-value">1,847</div>
            <div className="stat-change positive">
              ↑ 12% from last month
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Privacy Score</div>
            <div className="stat-value">100%</div>
            <div className="stat-change positive">
              ✓ Fully Encrypted
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container section">
        <h2 className="h2 text-center mb-12">Why Choose Private Rideshare?</h2>
        <div className="grid-auto">
          <div className="glass-card">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="h3 mb-3">Fully Encrypted</h3>
            <p className="body-text">
              All location data and fare information are encrypted using FHE technology.
              Your privacy is guaranteed on-chain.
            </p>
          </div>

          <div className="glass-card">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="h3 mb-3">Instant Matching</h3>
            <p className="body-text">
              Smart contract algorithms match riders with drivers in real-time
              without exposing sensitive location data.
            </p>
          </div>

          <div className="glass-card">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="h3 mb-3">Fair Pricing</h3>
            <p className="body-text">
              Transparent fare calculation with encrypted bid matching ensures
              both riders and drivers get the best deal.
            </p>
          </div>
        </div>
      </section>

      {/* Contract Info */}
      <section className="container section">
        <div className="glass-panel max-w-2xl mx-auto text-center p-8">
          <h3 className="h3 mb-4">Contract Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted">Network:</span>
              <span className="badge badge-info">Sepolia Testnet</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">Contract:</span>
              <code className="text-sm bg-tertiary px-3 py-1 rounded-lg">
                0x5986FF19B524534F159af67f421ca081c6F5Acff
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">Frontend Port:</span>
              <span className="badge badge-success">1311</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-8 text-center text-muted border-t border-white/10">
        <p>Built with Next.js, TypeScript, Wagmi, and RainbowKit</p>
        <p className="text-small mt-2">Privacy-preserving rideshare on Ethereum</p>
      </footer>
    </main>
  );
}
