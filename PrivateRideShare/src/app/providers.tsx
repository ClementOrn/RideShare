/**
 * Providers Component
 * Wraps the app with necessary context providers
 */

'use client';

import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}
