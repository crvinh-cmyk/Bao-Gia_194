import { useState, useEffect } from 'react';

/**
 * Returns price multiplier based on URL search query parameters.
 * - Root URL (no query params or standard query): returns 1.0 (Standard wholesale price)
 * - Discreet URL params (e.g. ?ref=partner, ?v=pro, ?m=sp, ?client=freelance, ?type=partner): returns 1.1 (+10% increased price)
 */
export function getPriceMultiplier(): number {
  if (typeof window === 'undefined') return 1.0;
  
  const searchParams = new URLSearchParams(window.location.search);
  
  // Neutral parameters
  const ref = searchParams.get('ref')?.toLowerCase();
  const v = searchParams.get('v')?.toLowerCase();
  const m = searchParams.get('m')?.toLowerCase();
  const p = searchParams.get('p')?.toLowerCase();
  const mode = searchParams.get('mode')?.toLowerCase();
  const client = searchParams.get('client')?.toLowerCase();
  const type = searchParams.get('type')?.toLowerCase();
  const tier = searchParams.get('tier')?.toLowerCase();
  const role = searchParams.get('role')?.toLowerCase();

  const isIgnored = (val: string | undefined) => 
    !val || val === 'wholesale' || val === 'si' || val === 'std' || val === 'standard' || val === 'default' || val === '0';

  if (
    !isIgnored(ref) ||
    !isIgnored(v) ||
    !isIgnored(m) ||
    !isIgnored(p) ||
    !isIgnored(mode) ||
    !isIgnored(client) ||
    !isIgnored(type) ||
    !isIgnored(tier) ||
    !isIgnored(role) ||
    searchParams.has('partner') ||
    searchParams.has('freelance') ||
    searchParams.has('pro') ||
    searchParams.has('sp')
  ) {
    return 1.1;
  }

  return 1.0;
}

/**
 * React Hook that monitors price multiplier from URL search parameters.
 */
export function usePriceMultiplier(): number {
  const [multiplier, setMultiplier] = useState<number>(getPriceMultiplier());

  useEffect(() => {
    const handleLocationChange = () => {
      setMultiplier(getPriceMultiplier());
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return multiplier;
}

/**
 * Applies price multiplier and rounds result to nearest thousand (làm tròn đến hàng nghìn gần nhất).
 */
export function applyMultiplier(
  price: number | null | undefined,
  multiplier: number
): number | null {
  if (price === null || price === undefined) return null;
  if (multiplier === 1.0) return price;
  return Math.round((price * multiplier) / 1000) * 1000;
}
