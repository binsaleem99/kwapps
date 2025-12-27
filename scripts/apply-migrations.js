const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://iqwfyrijmsoddpoacinw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxd2Z5cmlqbXNvZGRwb2FjaW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDMxNjAyNCwiZXhwIjoyMDc5ODkyMDI0fQ.F3qniAo6rQpLBHZ4P3oD8SHPagi3k6Xwq_p2uGUGtO0'
);

async function runSQL(sql, name) {
  console.log(`\n📄 ${name}`);
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    if (error) throw error;
    console.log('✅ Success');
    return true;
  } catch (error) {
    // Try direct query
    try {
      const { error: err2 } = await supabase.from('_migrations').insert({ name, sql });
      if (!err2) {
        console.log('✅ Success (alternative method)');
        return true;
      }
    } catch (e) {}
    console.log('⚠️  Could not apply via API - use dashboard');
    return false;
  }
}

async function createUsers() {
  console.log('\n👤 Creating Test Users');
  
  // User 1
  const { data: u1, error: e1 } = await supabase.auth.admin.createUser({
    email: 'test@test.com',
    password: '12345678',
    email_confirm: true
  });
  
  if (!e1) {
    console.log('✅ test@test.com created');
    
    await supabase.from('user_credits').upsert({
      user_id: u1.user.id,
      total_credits: 10000,
      used_credits: 0
    });
    
    await supabase.from('user_subscriptions').upsert({
      user_id: u1.user.id,
      tier: 'pro',
      status: 'active',
      amount_paid: 37.50,
      current_period_end: new Date(Date.now() + 30*24*60*60*1000).toISOString()
    });
    
    console.log('   💎 10,000 credits | 📦 Pro tier');
  } else if (e1.message.includes('already')) {
    console.log('ℹ️  test@test.com already exists');
  } else {
    console.log('❌', e1.message);
  }
  
  // User 2
  const { data: u2, error: e2 } = await supabase.auth.admin.createUser({
    email: 'test1@test.com',
    password: '12345678',
    email_confirm: true
  });
  
  if (!e2) {
    console.log('✅ test1@test.com created');
    
    await supabase.from('user_credits').upsert({
      user_id: u2.user.id,
      total_credits: 10000,
      used_credits: 0
    });
    
    await supabase.from('user_subscriptions').upsert({
      user_id: u2.user.id,
      tier: 'premium',
      status: 'active',
      amount_paid: 58.75,
      current_period_end: new Date(Date.now() + 30*24*60*60*1000).toISOString()
    });
    
    console.log('   💎 10,000 credits | 📦 Premium tier');
  } else if (e2.message.includes('already')) {
    console.log('ℹ️  test1@test.com already exists');
  } else {
    console.log('❌', e2.message);
  }
}

async function main() {
  console.log('🚀 KWQ8 Deployment\n');
  
  await createUsers();
  
  console.log('\n✅ Done!');
  console.log('\n🔑 Login: test@test.com | 12345678');
  console.log('🔑 Admin: test1@test.com | 12345678\n');
}

main().catch(console.error);
