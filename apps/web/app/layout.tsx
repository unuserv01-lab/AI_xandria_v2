import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import WalletProvider from '@/components/providers/WalletProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['600', '700', '800'],
  variable: '--font-poppins' 
});

export const metadata: Metadata = {
  title: 'AI_xandria - AI Persona NFT Platform',
  description: 'Create, battle, and trade AI-powered persona NFTs on Solana',
  keywords: 'AI, NFT, Solana, Persona, Blockchain, Battle',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <WalletProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1E293B',
                color: '#fff',
                border: '1px solid #9333EA',
              },
              success: {
                iconTheme: { primary: '#9333EA', secondary: '#fff' },
              },
            }}
          />
        </WalletProvider>
      </body>
    </html>
  );
}
