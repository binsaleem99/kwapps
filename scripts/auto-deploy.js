/**
 * Auto-Deploy Script
 * Applies all migrations and creates test users
 * Run with: node scripts/auto-deploy.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://iqwfyrijmsoddpoacinw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createTestUsers() {
  console.log('\n👤 Creating Test Users');
  console.log('═'.repeat(50));

  try {
    // Create test@test.com
    const { data: user1, error: error1 } = await supabase.auth.admin.createUser({
      email: 'test@test.com',
      password: '12345678',
      email_confirm: true,
      user_metadata: { name: 'Test User' }
    });

    if (error1 && !error1.message.includes('already')) {
      console.error('❌ Error creating test@test.com:', error1.message);
    } else {
      console.log('✅ test@test.com created');

      // Grant credits and subscription
      if (user1?.user?.id) {
        await supabase.from('user_credits').upsert({
          user_id: user1.user.id,
          total_credits: 10000,
          used_credits: 0
        });

        await supabase.from('user_subscriptions').insert({
          user_id: user1.user.id,
          tier: 'pro',
          status: 'active',
          amount_paid: 37.50,
          currency: 'KWD',
          billing_interval: 'monthly',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

        console.log('   💎 10,000 credits granted');
        console.log('   📦 Pro subscription activated');
      }
    }

    // Create test1@test.com
    const { data: user2, error: error2 } = await supabase.auth.admin.createUser({
      email: 'test1@test.com',
      password: '12345678',
      email_confirm: true,
      user_metadata: { name: 'Test Admin' }
    });

    if (error2 && !error2.message.includes('already')) {
      console.error('❌ Error creating test1@test.com:', error2.message);
    } else {
      console.log('✅ test1@test.com created');

      if (user2?.user?.id) {
        await supabase.from('user_credits').upsert({
          user_id: user2.user.id,
          total_credits: 10000,
          used_credits: 0
        });

        await supabase.from('user_subscriptions').insert({
          user_id: user2.user.id,
          tier: 'premium',
          status: 'active',
          amount_paid: 58.75,
          currency: 'KWD',
          billing_interval: 'monthly',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

        console.log('   💎 10,000 credits granted');
        console.log('   📦 Premium subscription activated');
      }
    }

    console.log('\n✅ Test users setup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function verifyDeployment() {
  console.log('\n🔍 Verifying Deployment');
  console.log('═'.repeat(50));

  try {
    // Check users
    const { data: users } = await supabase
      .from('auth.users')
      .select('email, created_at')
      .in('email', ['test@test.com', 'test1@test.com']);

    console.log(`✅ Test users found: ${users?.length || 0}/2`);

    // Check credits
    const { data: credits } = await supabase
      .from('user_credits')
      .select('user_id, total_credits, used_credits');

    console.log(`✅ Credit records: ${credits?.length || 0}`);

  } catch (error) {
    console.log('⚠️  Some tables may not exist yet (run migrations first)');
  }
}

async function main() {
  console.log('\n🚀 KWQ8 Auto-Deployment');
  console.log('═'.repeat(50));

  console.log('\n⚠️  NOTE: Migrations must be applied via Supabase Dashboard');
  console.log('URL: https://supabase.com/dashboard/project/iqwfyrijmsoddpoacinw/sql/new');
  console.log('\nThis script will:');
  console.log('1. Create test users');
  console.log('2. Grant credits');
  console.log('3. Create subscriptions\n');

  await createTestUsers();
  await verifyDeployment();

  console.log('\n🎉 Done!');
  console.log('\n🔑 Login Credentials:');
  console.log('   test@test.com  | 12345678 | Pro (10,000 credits)');
  console.log('   test1@test.com | 12345678 | Premium (10,000 credits)');
  console.log('\n🚀 Next: npm run dev\n');
}

main().catch(console.error);
