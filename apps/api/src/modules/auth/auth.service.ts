import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as nacl from 'tweetnacl';
import * as bs58 from 'bs58';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async authenticateWallet(walletAddress: string, signature: string, message: string) {
    // Verify Solana wallet signature
    const isValid = this.verifySignature(walletAddress, signature, message);
    if (!isValid) throw new UnauthorizedException('Invalid signature');

    // Get or create user
    let user = await this.prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { walletAddress },
      });
    }

    // Generate JWT
    const token = this.jwt.sign({
      sub: user.id,
      wallet: user.walletAddress,
    });

    return {
      user,
      token,
    };
  }

  private verifySignature(walletAddress: string, signature: string, message: string): boolean {
    try {
      const publicKey = bs58.decode(walletAddress);
      const signatureBytes = bs58.decode(signature);
      const messageBytes = new TextEncoder().encode(message);

      return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey);
    } catch (error) {
      return false;
    }
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}
