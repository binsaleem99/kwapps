-- Enhanced Code Versioning System
-- Adds auto-increment version, active flag, and helper functions

-- Add active flag to track current version
ALTER TABLE generated_code
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add description for version notes
ALTER TABLE generated_code
ADD COLUMN IF NOT EXISTS description TEXT;

-- Create index for active versions
CREATE INDEX IF NOT EXISTS idx_generated_code_active
ON generated_code(project_id, is_active) WHERE is_active = true;

-- Create index for version ordering
CREATE INDEX IF NOT EXISTS idx_generated_code_version
ON generated_code(project_id, version DESC);

-- Function to get next version number for a project
CREATE OR REPLACE FUNCTION get_next_code_version(p_project_id UUID)
RETURNS INTEGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version), 0) + 1
  INTO next_version
  FROM generated_code
  WHERE project_id = p_project_id;

  RETURN next_version;
END;
$$ LANGUAGE plpgsql;

-- Function to save new code version (deactivates previous, creates new)
CREATE OR REPLACE FUNCTION save_code_version(
  p_project_id UUID,
  p_user_id UUID,
  p_code TEXT,
  p_description TEXT DEFAULT NULL,
  p_message_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_version INTEGER;
  new_id UUID;
BEGIN
  -- Deactivate all previous versions for this project
  UPDATE generated_code
  SET is_active = false
  WHERE project_id = p_project_id AND is_active = true;

  -- Get next version number
  new_version := get_next_code_version(p_project_id);

  -- Insert new version
  INSERT INTO generated_code (project_id, user_id, code, version, description, message_id, is_active)
  VALUES (p_project_id, p_user_id, p_code, new_version, p_description, p_message_id, true)
  RETURNING id INTO new_id;

  -- Also update the projects table for backward compatibility
  UPDATE projects
  SET generated_code = p_code, updated_at = NOW()
  WHERE id = p_project_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a specific version
CREATE OR REPLACE FUNCTION restore_code_version(
  p_version_id UUID,
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_project_id UUID;
  v_code TEXT;
  restored_id UUID;
BEGIN
  -- Get the version details
  SELECT project_id, code INTO v_project_id, v_code
  FROM generated_code
  WHERE id = p_version_id AND user_id = p_user_id;

  IF v_project_id IS NULL THEN
    RAISE EXCEPTION 'Version not found or access denied';
  END IF;

  -- Save as new version (this creates a new entry and deactivates others)
  restored_id := save_code_version(
    v_project_id,
    p_user_id,
    v_code,
    'Restored from version ' || p_version_id::TEXT
  );

  RETURN restored_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_next_code_version(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION save_code_version(UUID, UUID, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_code_version(UUID, UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION save_code_version IS 'Saves a new code version, deactivating previous versions';
COMMENT ON FUNCTION restore_code_version IS 'Restores a previous version by creating a new version with the same code';
