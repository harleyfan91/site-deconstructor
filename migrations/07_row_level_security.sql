-- Enable Row Level Security on all user-specific tables
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_tasks ENABLE ROW LEVEL SECURITY;

-- Policies for scans table
CREATE POLICY "scans_read" ON scans 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "scans_write" ON scans 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "scans_update" ON scans 
  FOR UPDATE 
  USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());

-- Policies for scan_status table
CREATE POLICY "scan_status_read" ON scan_status 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM scans 
      WHERE scans.id = scan_status.scan_id 
      AND scans.user_id = auth.uid()
    )
  );

CREATE POLICY "scan_status_write" ON scan_status 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scans 
      WHERE scans.id = scan_status.scan_id 
      AND scans.user_id = auth.uid()
    )
  );

CREATE POLICY "scan_status_update" ON scan_status 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM scans 
      WHERE scans.id = scan_status.scan_id 
      AND scans.user_id = auth.uid()
    )
  );

-- Policies for scan_tasks table
CREATE POLICY "scan_tasks_read" ON scan_tasks 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM scans 
      WHERE scans.id = scan_tasks.scan_id 
      AND scans.user_id = auth.uid()
    )
  );

CREATE POLICY "scan_tasks_write" ON scan_tasks 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scans 
      WHERE scans.id = scan_tasks.scan_id 
      AND scans.user_id = auth.uid()
    )
  );

CREATE POLICY "scan_tasks_update" ON scan_tasks 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM scans 
      WHERE scans.id = scan_tasks.scan_id 
      AND scans.user_id = auth.uid()
    )
  );

-- analysis_cache remains public read-only (no RLS needed)
-- Users can read cached analysis data but not modify it