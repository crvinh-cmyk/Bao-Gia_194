import { useState, useEffect } from 'react';

/**
 * Returns price multiplier based on URL search query parameters.
 * - Root URL (no query params): returns 1.0 (Standard wholesale price)
 * - Partner/Freelance URL params (e.g. ?client=freelance or ?type=partner): returns 1.1 (+10% increased price)
 */
export function getPriceMultiplier(): number {
  if (typeof window === 'undefined') return 1.0;
  
  const searchParams = new URLSearchParams(window.location.search);
  const client = searchParams.get('client')?.toLowerCase();
  const type = searchParams.get('type')?.toLowerCase();
  const tier = searchParams.get('tier')?.toLowerCase();
  const role = searchParams.get('role')?.toLowerCase();

  if (
    (client && client !== 'wholesale' && client !== 'si') ||
    (type && type !== 'wholesale' && type !== 'si') ||
    (tier && tier !== 'wholesale' && tier !== 'si') ||
    (role && role !== 'wholesale' && role !== 'si') ||
    searchParams.has('freelance') ||
    searchParams.has('partner')
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
