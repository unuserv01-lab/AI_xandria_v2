'use client';

import { motion } from 'framer-motion';
import { Sparkles, Home, PlusCircle, Swords, ShoppingBag, User, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/create', label: 'Create', icon: PlusCircle },
  { href: '/battle', label: 'Battle', icon: Swords },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function Header() {
  const pathname = usePathname();
  const { connected } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mouse tracking for glow effect
  const handleMouseMove = (e: React.MouseEvent) => {
    const cards = document.querySelectorAll('.glow-track');
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
      (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
    });
  };

  return (
    <header 
      className="sticky top-0 z-40 border-b border-gray-800/50"
      onMouseMove={handleMouseMove}
      style={{
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="relative w-8 h-8 rounded-lg overflow-hidden glow-track"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-primary/30 to-cyan-accent/30" />
              <div className="absolute inset-[1px] rounded-lg bg-bg-dark/80 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-primary" />
              </div>
            </motion.div>
            <span className="text-xl font-display font-bold bg-gradient-to-r from-purple-primary via-purple-mid to-cyan-accent bg-clip-text text-transparent">
              AI_xandria
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white'
                    } glow-track`}
                  >
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-primary/10 to-cyan-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Icon className="w-4 h-4 relative z-10" />
                    <span className="font-medium relative z-10">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Wallet Button */}
          <div className="hidden md:block glow-track">
            <WalletMultiButton 
              className="!relative !px-4 !py-2 !rounded-lg !transition-all !duration-300 hover:!scale-105"
              style={{
                background: 'rgba(147, 51, 234, 0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(147, 51, 234, 0.3)',
              }}
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-800/30 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 space-y-2 border-t border-gray-800/50 mt-2"
            style={{
              background: 'rgba(10, 10, 15, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-primary/20 to-cyan-accent/20 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-2 px-4">
              <WalletMultiButton 
                className="w-full !justify-center !px-4 !py-3 !rounded-lg !transition-all"
                style={{
                  background: 'rgba(147, 51, 234, 0.15)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}
