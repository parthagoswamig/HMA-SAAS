import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SupabaseAuthService } from '../src/auth/services/supabase-auth.service';
import * as dotenv from 'dotenv';

async function testSupabaseAuth() {
  // Load environment variables
  dotenv.config();
  
  // Create a test application context
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Get services
  const configService = app.get(ConfigService);
  const supabaseAuth = app.get(SupabaseAuthService);
  
  // Test configuration
  const testEmail = 'test@example.com';
  const testPassword = 'Test@123456';
  
  try {
    console.log('Starting Supabase Auth Test...');
    console.log('----------------------------------------');
    
    // 1. Test sign up
    console.log('1. Testing user sign up...');
    const signUpData = await supabaseAuth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          role: 'user',
        },
      },
    });
    
    console.log('✅ Sign up successful:', {
      userId: signUpData.data?.user?.id,
      email: signUpData.data?.user?.email,
      role: signUpData.data?.user?.user_metadata?.role,
    });
    
    // 2. Test sign in
    console.log('\n2. Testing user sign in...');
    const signInData = await supabaseAuth.signInWithEmail({
      email: testEmail,
      password: testPassword,
    });
    
    const accessToken = signInData.data?.session?.access_token;
    const refreshToken = signInData.data?.session?.refresh_token;
    
    console.log('✅ Sign in successful:', {
      userId: signInData.data?.user?.id,
      accessToken: accessToken ? '***' + accessToken.slice(-8) : 'none',
      refreshToken: refreshToken ? '***' + refreshToken.slice(-8) : 'none',
    });
    
    // 3. Test protected endpoint
    console.log('\n3. Testing protected endpoint...');
    const baseUrl = configService.get('APP_URL') || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/auth/test/protected`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const protectedData = await response.json();
    console.log('✅ Protected endpoint response:', {
      status: response.status,
      data: protectedData,
    });
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Test failed:', errorMessage);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const responseError = error as { response?: { data?: unknown } };
      console.error('Error details:', responseError.response?.data || 'No additional details');
    }
    process.exit(1);
  } finally {
    // Clean up: Delete test user
    try {
      console.log('\nCleaning up test user...');
      await supabaseAuth.signOut();
      console.log('✅ Cleanup completed');
    } catch (cleanupError: unknown) {
      const errorMessage = cleanupError instanceof Error ? cleanupError.message : 'Unknown error during cleanup';
      console.error('❌ Cleanup failed:', errorMessage);
    }
    
    await app.close();
    process.exit(0);
  }
}

testSupabaseAuth().catch(console.error);
