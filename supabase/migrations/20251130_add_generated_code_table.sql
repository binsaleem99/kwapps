-- Create generated_code table for storing extracted code blocks
-- Based on Lovable's architecture: separate code from chat messages

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_generated_code_project_id ON generated_code(project_id);
CREATE INDEX IF NOT EXISTS idx_generated_code_user_id ON generated_code(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_code_created_at ON generated_code(created_at DESC);

-- Enable Row Level Security
ALTER TABLE generated_code ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own generated code
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

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_generated_code_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generated_code_updated_at
  BEFORE UPDATE ON generated_code
  FOR EACH ROW
  EXECUTE FUNCTION update_generated_code_updated_at();

-- Add comment
COMMENT ON TABLE generated_code IS 'Stores extracted code blocks from AI responses, separate from chat messages';
