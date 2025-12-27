#!/bin/bash

# ============================================
# KWQ8 Automated Deployment Script
# Applies migrations and creates test users
# ============================================

set -e  # Exit on error

echo "🚀 KWQ8 Deployment Script"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local not found!${NC}"
    echo "Create it from .env.production.example"
    exit 1
fi

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

echo -e "${BLUE}📊 Step 1: Applying Database Migrations${NC}"
echo "--------------------------------------------"

# Function to apply migration
apply_migration() {
    local file=$1
    local name=$2

    echo -e "${BLUE}Applying: $name${NC}"

    # Use Supabase REST API to execute SQL
    RESPONSE=$(curl -s -X POST \
        "https://iqwfyrijmsoddpoacinw.supabase.co/rest/v1/rpc/exec_sql" \
        -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"query\": $(jq -Rs . < "$file")}" 2>&1)

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $name applied successfully${NC}"
    else
        echo -e "${RED}❌ Failed to apply $name${NC}"
        echo "$RESPONSE"
    fi
}

# Apply migrations in order
apply_migration "supabase/migrations/20251227_paywall_system.sql" "Paywall System"
apply_migration "supabase/migrations/20251227_tap_payments_infrastructure.sql" "Tap Payments"
apply_migration "supabase/migrations/20251227_template_system.sql" "Template System"
apply_migration "supabase/migrations/20251227_admin_dashboard_system.sql" "Admin Dashboard"
apply_migration "supabase/migrations/20251227_visual_editor_system.sql" "Visual Editor"

echo ""
echo -e "${BLUE}👤 Step 2: Creating Test Users${NC}"
echo "--------------------------------------------"

# Create test users via Supabase Admin API
echo "Creating test@test.com..."
curl -X POST "https://iqwfyrijmsoddpoacinw.supabase.co/auth/v1/admin/users" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "12345678",
    "email_confirm": true,
    "user_metadata": {
      "name": "Test User"
    }
  }' 2>/dev/null | jq -r '.id' > /tmp/test_user_id.txt

echo -e "${GREEN}✅ test@test.com created${NC}"

echo "Creating test1@test.com..."
curl -X POST "https://iqwfyrijmsoddpoacinw.supabase.co/auth/v1/admin/users" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test1@test.com",
    "password": "12345678",
    "email_confirm": true,
    "user_metadata": {
      "name": "Test Admin"
    }
  }' 2>/dev/null | jq -r '.id' > /tmp/test_admin_id.txt

echo -e "${GREEN}✅ test1@test.com created${NC}"

echo ""
echo -e "${BLUE}💎 Step 3: Granting Credits${NC}"
echo "--------------------------------------------"

# Read user IDs
TEST_USER_ID=$(cat /tmp/test_user_id.txt)
TEST_ADMIN_ID=$(cat /tmp/test_admin_id.txt)

# Grant credits via SQL
psql "${SUPABASE_DB_URL}" <<EOF
-- Grant 10,000 credits to each
INSERT INTO user_credits (user_id, total_credits, used_credits)
VALUES
  ('${TEST_USER_ID}', 10000, 0),
  ('${TEST_ADMIN_ID}', 10000, 0)
ON CONFLICT (user_id) DO UPDATE
  SET total_credits = 10000, used_credits = 0;

-- Create subscriptions
INSERT INTO user_subscriptions (user_id, tier, status, amount_paid, current_period_start, current_period_end)
VALUES
  ('${TEST_USER_ID}', 'pro', 'active', 37.50, NOW(), NOW() + INTERVAL '30 days'),
  ('${TEST_ADMIN_ID}', 'premium', 'active', 58.75, NOW(), NOW() + INTERVAL '30 days')
ON CONFLICT DO NOTHING;
EOF

echo -e "${GREEN}✅ Credits granted${NC}"

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "=================================="
echo ""
echo "Test Users Created:"
echo "  📧 test@test.com  | 🔑 12345678 | 💎 10,000 credits | 📦 Pro"
echo "  📧 test1@test.com | 🔑 12345678 | 💎 10,000 credits | 📦 Premium"
echo ""
echo "Next: npm run dev"
echo "Then login with test@test.com"
echo ""
