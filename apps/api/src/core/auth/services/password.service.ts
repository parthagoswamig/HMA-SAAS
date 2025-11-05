import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class PasswordService {
  private readonly saltRounds = 12;

  /**
   * Hash a plain text password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compare a plain text password with a hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a password reset token with expiry (1 hour)
   */
  generatePasswordResetToken(): {
    token: string;
    expires: Date;
  } {
    const token = this.generateToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    return { token, expires };
  }

  /**
   * Generate an email verification token with expiry (24 hours)
   */
  generateEmailVerificationToken(): {
    token: string;
    expires: Date;
  } {
    const token = this.generateToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    return { token, expires };
  }

  /**
   * Validate password strength
   * - At least 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special character
   */
  validatePasswordStrength(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if password reset token is expired
   */
  isTokenExpired(expires: Date): boolean {
    return new Date() > expires;
  }
}
