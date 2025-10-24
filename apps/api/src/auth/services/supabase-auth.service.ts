import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, AuthResponse, User, Session } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  options?: {
    data?: {
      full_name?: string;
      role?: string;
      [key: string]: any;
    };
  };
}

export interface SignInData {
  email: string;
  password: string;
}

@Injectable()
export class SupabaseAuthService {
  private readonly logger = new Logger(SupabaseAuthService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      this.logger.error('Supabase configuration is missing. Please check your environment variables.');
      throw new Error('Supabase configuration is missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    this.logger.log('Supabase client initialized successfully');
  }

  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      this.logger.log(`Attempting to sign up user: ${data.email}`);
      
      const response = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: data.options,
      });

      if (response.error) {
        this.logger.error('Sign up error:', response.error.message);
        throw new Error(response.error.message);
      }

      this.logger.log(`User signed up successfully: ${response.data?.user?.id}`);
      return response;
    } catch (error) {
      this.logger.error('Sign up failed:', error);
      throw error;
    }
  }

  async signInWithEmail(data: SignInData): Promise<AuthResponse> {
    try {
      this.logger.log(`Attempting to sign in user: ${data.email}`);
      
      const response = await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (response.error) {
        this.logger.error('Sign in error:', response.error.message);
        throw new Error(response.error.message);
      }

      this.logger.log(`User signed in successfully: ${response.data?.user?.id}`);
      return response;
    } catch (error) {
      this.logger.error('Sign in failed:', error);
      throw error;
    }
  }

  async signOut(): Promise<{ error: any }> {
    try {
      this.logger.log('Signing out user');
      
      const response = await this.supabase.auth.signOut();
      
      if (response.error) {
        this.logger.error('Sign out error:', response.error.message);
      } else {
        this.logger.log('User signed out successfully');
      }
      
      return response;
    } catch (error) {
      this.logger.error('Sign out failed:', error);
      throw error;
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const response = await this.supabase.auth.getUser();
      
      if (response.error) {
        this.logger.error('Get user error:', response.error.message);
        return null;
      }

      return response.data.user;
    } catch (error) {
      this.logger.error('Get user failed:', error);
      return null;
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const response = await this.supabase.auth.getSession();
      
      if (response.error) {
        this.logger.error('Get session error:', response.error.message);
        return null;
      }

      return response.data.session;
    } catch (error) {
      this.logger.error('Get session failed:', error);
      return null;
    }
  }

  async refreshSession(refreshToken: string): Promise<AuthResponse> {
    try {
      this.logger.log('Refreshing session');
      
      const response = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (response.error) {
        this.logger.error('Refresh session error:', response.error.message);
        throw new Error(response.error.message);
      }

      this.logger.log('Session refreshed successfully');
      return response;
    } catch (error) {
      this.logger.error('Refresh session failed:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<{ error: any }> {
    try {
      this.logger.log(`Resetting password for user: ${email}`);
      
      const response = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${this.configService.get('APP_URL') || 'http://localhost:3000'}/reset-password`,
      });

      if (response.error) {
        this.logger.error('Reset password error:', response.error.message);
      } else {
        this.logger.log('Password reset email sent successfully');
      }

      return response;
    } catch (error) {
      this.logger.error('Reset password failed:', error);
      throw error;
    }
  }

  async updatePassword(newPassword: string): Promise<{ data: { user: User | null }; error: any }> {
    try {
      this.logger.log('Updating password');
      
      const response = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (response.error) {
        this.logger.error('Update password error:', response.error.message);
        throw new Error(response.error.message);
      }

      this.logger.log('Password updated successfully');
      return response;
    } catch (error) {
      this.logger.error('Update password failed:', error);
      throw error;
    }
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}
