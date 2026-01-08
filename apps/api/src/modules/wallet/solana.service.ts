import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

@Injectable()
export class SolanaService {
  private connection: Connection;
  private programId: PublicKey;

  constructor(private config: ConfigService) {
    const rpcUrl = this.config.get('SOLANA_RPC_URL') || 'https://api.devnet.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
    
    const programIdStr = this.config.get('PROGRAM_ID_PERSONA');
    this.programId = programIdStr ? new PublicKey(programIdStr) : Keypair.generate().publicKey;
  }

  async getBalance(publicKey: string): Promise<number> {
    try {
      const pubkey = new PublicKey(publicKey);
      const balance = await this.connection.getBalance(pubkey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      return 0;
    }
  }

  async getPersonaWalletPDA(mintAddress: string): Promise<[PublicKey, number]> {
    const mintPubkey = new PublicKey(mintAddress);
    return PublicKey.findProgramAddressSync(
      [Buffer.from('persona-wallet'), mintPubkey.toBuffer()],
      this.programId
    );
  }

  async depositToPersonaWallet(
    walletPda: string,
    amount: number,
    payerPublicKey: string
  ): Promise<{ signature: string; success: boolean }> {
    try {
      // Mock implementation - replace with actual Anchor program call
      const signature = `mock_deposit_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      
      // In production, this would be:
      // const tx = await program.methods.depositEarnings(new anchor.BN(amount * LAMPORTS_PER_SOL))
      //   .accounts({ personaWallet: walletPda, payer: payerPublicKey })
      //   .rpc();
      
      return { signature, success: true };
    } catch (error) {
      return { signature: '', success: false };
    }
  }

  async withdrawFromPersonaWallet(
    walletPda: string,
    amount: number,
    ownerPublicKey: string,
    destinationPublicKey: string
  ): Promise<{ signature: string; success: boolean }> {
    try {
      // Mock implementation
      const signature = `mock_withdraw_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      
      // In production:
      // const tx = await program.methods.withdrawEarnings(new anchor.BN(amount * LAMPORTS_PER_SOL))
      //   .accounts({ 
      //     personaWallet: walletPda,
      //     owner: ownerPublicKey,
      //     destination: destinationPublicKey
      //   })
      //   .rpc();
      
      return { signature, success: true };
    } catch (error) {
      return { signature: '', success: false };
    }
  }

  async getRecentBlockhash(): Promise<string> {
    const { blockhash } = await this.connection.getLatestBlockhash();
    return blockhash;
  }

  async getSolPrice(): Promise<number> {
    try {
      // In production, fetch from Pyth Network or Coingecko
      // For now, return mock price
      return 150.0;
    } catch (error) {
      return 150.0; // Fallback
    }
  }
}
