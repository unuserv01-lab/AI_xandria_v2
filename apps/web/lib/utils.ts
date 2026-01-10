import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format SOL amount
export function formatSOL(amount: number | string, decimals: number = 4): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(decimals);
}

// Format wallet address
export function formatAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Calculate win rate
export function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return (wins / total) * 100;
}

// Format date
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format date with time
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get tier color
export function getTierColor(tier: string): string {
  const colors = {
    COMMON: 'text-gray-400',
    RARE: 'text-blue-400',
    EPIC: 'text-purple-400',
    LEGENDARY: 'text-yellow-400',
  };
  return colors[tier as keyof typeof colors] || 'text-gray-400';
}

// Get tier gradient
export function getTierGradient(tier: string): string {
  const gradients = {
    COMMON: 'from-gray-600 to-gray-800',
    RARE: 'from-blue-500 to-cyan-500',
    EPIC: 'from-purple-500 to-pink-500',
    LEGENDARY: 'from-yellow-400 via-orange-500 to-red-500',
  };
  return gradients[tier as keyof typeof gradients] || 'from-gray-600 to-gray-800';
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
}

// Generate share URL
export function generateShareUrl(personaId: string, creatorAddress?: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const ref = creatorAddress?.slice(0, 8) || 'platform';
  return `${baseUrl}/persona/${personaId}?ref=${ref}`;
}
