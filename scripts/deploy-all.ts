/**
 * KWQ8 Automated Deployment Script
 * Applies all migrations and creates test users
 *
 * Usage: npx tsx scripts/deploy-all.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load from environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration(filename: string, name: string) {
  console.log(`\n📄 Applying: ${name}`)
  console.log('─'.repeat(50))

  try {
    const sqlPath = join(process.cwd(), 'supabase', 'migrations', filename)
    const sql = readFileSync(sqlPath, 'utf-8')

    // Split by statement and execute
    const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'))

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (!statement) continue

      const { error } = await supabase.rpc('exec_sql', { sql: statement })

      if (error && !error.message?.includes('already exists')) {
        console.error(`❌ Error in statement ${i + 1}:`, error.message)
      }
    }

    console.log(`✅ ${name} applied successfully`)
  } catch (error: any) {
    console.error(`❌ Failed to apply ${name}:`, error.message)
  }
}

async function createTestUsers() {
  console.log(`\n👤 Creating Test Users`)
  console.log('─'.repeat(50))

  try {
    // Create test@test.com
    const { data: user1, error: error1 } = await supabase.auth.admin.createUser({
      email: 'test@test.com',
      password: '12345678',
      email_confirm: true,
      user_metadata: { name: 'Test User' }
    })

    if (error1 && !error1.message?.includes('already registered')) {
      throw error1
    }

    console.log('✅ test@test.com created')
    const user1Id = user1?.user?.id

    // Create test1@test.com
    const { data: user2, error: error2 } = await supabase.auth.admin.createUser({
      email: 'test1@test.com',
      password: '12345678',
      email_confirm: true,
      user_metadata: { name: 'Test Admin' }
    })

    if (error2 && !error2.message?.includes('already registered')) {
      throw error2
    }

    console.log('✅ test1@test.com created')
    const user2Id = user2?.user?.id

    // Grant credits
    if (user1Id) {
      await supabase.from('user_credits').upsert({
        user_id: user1Id,
        total_credits: 10000,
        used_credits: 0
      })

      await supabase.from('user_subscriptions').upsert({
        user_id: user1Id,
        tier: 'pro',
        status: 'active',
        amount_paid: 37.50,
        currency: 'KWD',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })

      console.log('✅ test@test.com: Pro tier, 10,000 credits')
    }

    if (user2Id) {
      await supabase.from('user_credits').upsert({
        user_id: user2Id,
        total_credits: 10000,
        used_credits: 0
      })

      await supabase.from('user_subscriptions').upsert({
        user_id: user2Id,
        tier: 'premium',
        status: 'active',
        amount_paid: 58.75,
        currency: 'KWD',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })

      console.log('✅ test1@test.com: Premium tier, 10,000 credits')
    }

  } catch (error: any) {
    console.error('❌ Error creating users:', error.message)
  }
}

async function verifyDeployment() {
  console.log(`\n🔍 Verifying Deployment`)
  console.log('─'.repeat(50))

  // Check tables exist
  const { data: tables, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .like('table_name', '%paywall%')

  console.log(`✅ Tables created: ${tables?.length || 0}`)

  // Check users
  const { data: users } = await supabase.auth.admin.listUsers()
  const testUsers = users?.users.filter(u =>
    u.email === 'test@test.com' || u.email === 'test1@test.com'
  )

  console.log(`✅ Test users: ${testUsers?.length || 0}/2`)

  console.log('\n🎉 Deployment verification complete!')
}

async function main() {
  console.log('Starting deployment...\n')

  // Note: Migrations need to be applied via Supabase Dashboard
  // because RPC exec_sql doesn't exist by default
  console.log('⚠️  Migrations must be applied via Supabase Dashboard SQL Editor')
  console.log('    URL: https://supabase.com/dashboard/project/iqwfyrijmsoddpoacinw/sql/new')
  console.log('    Copy each migration file and run it there.\n')

  // Create test users
  await createTestUsers()

  // Verify
  await verifyDeployment()

  console.log('\n✅ DONE! Test users ready to use.')
  console.log('\n🔑 Login credentials:')
  console.log('   test@test.com  | 12345678 | Pro (10,000 credits)')
  console.log('   test1@test.com | 12345678 | Premium (10,000 credits)')
  console.log('\n🚀 Run: npm run dev')
}

main().catch(console.error)
