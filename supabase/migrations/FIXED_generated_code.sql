-- ============================================
-- FIXED: Generated Code Table
-- Drops existing policies before recreating
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own generated code" ON generated_code;
DROP POLICY IF EXISTS "Users can insert their own generated code" ON generated_code;
DROP POLICY IF EXISTS "Users can update their own generated code" ON generated_code;
DROP POLICY IF EXISTS "Users can delete their own generated code" ON generated_code;

-- Create table if not exists
CREATE TABLE IF NOT EXISTS generated_code (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Code content
  code TEXT NOT NULL,
  language TEXT DEFAULT 'tsx',

  -- Metadata
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  version INTEGER DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes (IF NOT EXISTS for safety)
CREATE INDEX IF NOT EXISTS idx_generated_code_project_id ON generated_code(project_id);
CREATE INDEX IF NOT EXISTS idx_generated_code_user_id ON generated_code(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_code_created_at ON generated_code(created_at DESC);

-- Enable Row Level Security
ALTER TABLE generated_code ENABLE ROW LEVEL SECURITY;

-- Recreate RLS Policies
CREATE POLICY "Users can view their own generated code"
  ON generated_code
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated code"
  ON generated_code
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated code"
  ON generated_code
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated code"
  ON generated_code
  FOR DELETE
  USING (auth.uid() = user_id);

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS generated_code_updated_at ON generated_code;

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_generated_code_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER generated_code_updated_at
  BEFORE UPDATE ON generated_code
  FOR EACH ROW
  EXECUTE FUNCTION update_generated_code_updated_at();

-- Add comment
COMMENT ON TABLE generated_code IS 'Stores extracted code blocks from AI responses, separate from chat messages';
