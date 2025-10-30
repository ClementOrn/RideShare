/**
 * Header Component
 * Navigation and wallet connection
 */

'use client';

import React from 'react';
import { formatAddress } from '@/lib/utils/format';

interface HeaderProps {
  address: string | null;
  network: { name: string; chainId: bigint } | null;
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
}

export function Header({
  address,
  network,
  isConnected,
  isConnecting,
  onConnect,
}: HeaderProps) {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-3 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Private Ride Share</h1>
              <p className="text-sm text-gray-600">FHE-Enabled Decentralized Platform</p>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="flex items-center gap-3">
            {network && (
              <div className="hidden md:block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {network.name === 'unknown' ? `Chain ${network.chainId}` : network.name}
              </div>
            )}

            {isConnected && address ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-mono font-medium text-gray-800">
                  {formatAddress(address)}
                </span>
              </div>
            ) : (
              <button
                onClick={onConnect}
                disabled={isConnecting}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
