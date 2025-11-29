-- URGENT FIX: Drop conflicting triggers and create corrected one
-- Run this in Supabase SQL Editor

-- Step 1: Drop both possible trigger names to ensure clean slate
DROP TRIGGER IF EXISTS trigger_save_project_version ON projects;
DROP TRIGGER IF EXISTS save_project_version_trigger ON projects;

-- Step 2: Create the corrected trigger
-- Only fires on UPDATE (not INSERT) to avoid NULL code issues
-- Only saves when code actually changes and is not NULL
CREATE TRIGGER save_project_version_trigger
  AFTER UPDATE OF generated_code ON projects
  FOR EACH ROW
  WHEN (NEW.generated_code IS NOT NULL AND NEW.generated_code IS DISTINCT FROM OLD.generated_code)
  EXECUTE FUNCTION save_project_version();

-- Verification: Check that only one trigger exists
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgrelid = 'projects'::regclass
AND tgname LIKE '%version%';

-- You should see only ONE trigger: save_project_version_trigger
