-- Enable RLS on file table
ALTER TABLE "file" ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner (important for testing)
ALTER TABLE "file" FORCE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "file_select" ON "file";
DROP POLICY IF EXISTS "file_insert" ON "file";
DROP POLICY IF EXISTS "file_update" ON "file";
DROP POLICY IF EXISTS "file_delete" ON "file";

-- Create policies using authOrgOrUser pattern:
-- org_id matches request.org_id OR (no org in request AND no org in file AND user_id matches)

CREATE POLICY "file_select" ON "file"
  FOR SELECT
  USING (
    (nullif(current_setting('request.org_id', true), '') = organization_id)
    OR
    (nullif(current_setting('request.org_id', true), '') IS NULL AND organization_id IS NULL AND nullif(current_setting('request.user_id', true), '') = user_id)
  );

CREATE POLICY "file_insert" ON "file"
  FOR INSERT
  WITH CHECK (
    (nullif(current_setting('request.org_id', true), '') = organization_id)
    OR
    (nullif(current_setting('request.org_id', true), '') IS NULL AND organization_id IS NULL AND nullif(current_setting('request.user_id', true), '') = user_id)
  );

CREATE POLICY "file_update" ON "file"
  FOR UPDATE
  USING (
    (nullif(current_setting('request.org_id', true), '') = organization_id)
    OR
    (nullif(current_setting('request.org_id', true), '') IS NULL AND organization_id IS NULL AND nullif(current_setting('request.user_id', true), '') = user_id)
  );

CREATE POLICY "file_delete" ON "file"
  FOR DELETE
  USING (
    (nullif(current_setting('request.org_id', true), '') = organization_id)
    OR
    (nullif(current_setting('request.org_id', true), '') IS NULL AND organization_id IS NULL AND nullif(current_setting('request.user_id', true), '') = user_id)
  );
