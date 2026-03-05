'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';

interface SiweSession {
  authenticated: boolean;
  wallet: string | null;
}

export function useSiwe() {
  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [session, setSession] = useState<SiweSession>({ authenticated: false, wallet: null });
  const [loading, setLoading] = useState(false);

  // Check existing session on mount and when address changes
  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => setSession({
        authenticated: data.authenticated,
        wallet: data.wallet ?? null,
      }))
      .catch(() => setSession({ authenticated: false, wallet: null }));
  }, [address]);

  const signIn = useCallback(async () => {
    if (!address || !isConnected) return;
    setLoading(true);

    try {
      // 1. Get nonce
      const nonceRes = await fetch('/api/auth/nonce');
      const { nonce } = await nonceRes.json();

      // 2. Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Firma para autenticarte en VDAO',
        uri: window.location.origin,
        version: '1',
        chainId: chainId ?? 11155111,
        nonce,
      });

      const messageStr = message.prepareMessage();

      // 3. Sign with wallet
      const signature = await signMessageAsync({ message: messageStr });

      // 4. Verify on backend
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageStr, signature }),
      });

      if (verifyRes.ok) {
        const data = await verifyRes.json();
        setSession({ authenticated: true, wallet: data.wallet });
      }
    } catch (error) {
      console.error('SIWE sign-in error:', error);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, chainId, signMessageAsync]);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession({ authenticated: false, wallet: null });
  }, []);

  return {
    session,
    signIn,
    signOut,
    loading,
    isAuthenticated: session.authenticated,
  };
}
