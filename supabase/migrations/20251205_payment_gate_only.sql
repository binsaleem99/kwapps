-- Payment Gate Only - Safe Migration (No Conflicts)
-- This is a minimal migration that only adds payment gate functionality

-- ============================================================================
-- 1. ADD PAYMENT STATUS ENUM (IF NOT EXISTS)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('payment_required', 'trial', 'active', 'cancelled', 'expired');
  END IF;
END $$;

-- ============================================================================
-- 2. ADD PAYMENT COLUMNS TO USERS TABLE (IF NOT EXISTS)
-- ============================================================================

DO $$
BEGIN
  -- Add payment_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE users ADD COLUMN payment_status payment_status DEFAULT 'payment_required';
  END IF;

  -- Add payment_verified_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'payment_verified_at'
  ) THEN
    ALTER TABLE users ADD COLUMN payment_verified_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================================================
-- 3. SET EXISTING USERS TO ACTIVE (GRANDFATHER CLAUSE)
-- ============================================================================

-- Update existing users who already have subscriptions to 'active'
UPDATE users u
SET payment_status = 'active',
    payment_verified_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM user_subscriptions us
  WHERE us.user_id = u.id AND us.status = 'active'
)
AND (u.payment_status IS NULL OR u.payment_status = 'payment_required');

-- Update existing users who have trials
UPDATE users u
SET payment_status = 'trial',
    payment_verified_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM user_subscriptions us
  WHERE us.user_id = u.id AND us.status = 'trial'
)
AND (u.payment_status IS NULL OR u.payment_status = 'payment_required');

-- ============================================================================
-- 4. UPDATE TRIGGER FOR NEW USERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    display_name,
    avatar_url,
    plan,
    payment_status,
    onboarding_completed,
    is_admin,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'free',
    'payment_required', -- Force payment for new users
    false,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, users.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- ============================================================================
-- 5. CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_payment_status ON users(payment_status);
CREATE INDEX IF NOT EXISTS idx_users_payment_verified_at ON users(payment_verified_at);

-- ============================================================================
-- DONE
-- ============================================================================

-- Verification query
SELECT
  COUNT(*) FILTER (WHERE payment_status = 'payment_required') as payment_required,
  COUNT(*) FILTER (WHERE payment_status = 'active') as active,
  COUNT(*) FILTER (WHERE payment_status = 'trial') as trial,
  COUNT(*) FILTER (WHERE payment_status = 'expired') as expired,
  COUNT(*) FILTER (WHERE payment_status = 'cancelled') as cancelled
FROM users;
