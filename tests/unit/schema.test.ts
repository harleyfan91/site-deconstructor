import { describe, it, expect } from 'vitest';
import { scans, scanStatus, scanTasks, analysisCache } from '../../shared/schema';

describe('Database Schema', () => {
  it('should have all required tables defined', () => {
    expect(scans).toBeDefined();
    expect(scanStatus).toBeDefined();
    expect(scanTasks).toBeDefined();
    expect(analysisCache).toBeDefined();
  });

  it('should have proper table names', () => {
    expect(scans._.name).toBe('scans');
    expect(scanStatus._.name).toBe('scan_status');
    expect(scanTasks._.name).toBe('scan_tasks');
    expect(analysisCache._.name).toBe('analysis_cache');
  });

  it('should have required columns in scans table', () => {
    const columns = Object.keys(scans._.columns);
    
    expect(columns).toContain('id');
    expect(columns).toContain('url');
    expect(columns).toContain('user_id');
    expect(columns).toContain('created_at');
  });

  it('should have required columns in scan_status table', () => {
    const columns = Object.keys(scanStatus._.columns);
    
    expect(columns).toContain('id');
    expect(columns).toContain('scan_id');
    expect(columns).toContain('status');
    expect(columns).toContain('progress');
    expect(columns).toContain('updated_at');
  });

  it('should have required columns in scan_tasks table', () => {
    const columns = Object.keys(scanTasks._.columns);
    
    expect(columns).toContain('id');
    expect(columns).toContain('scan_id');
    expect(columns).toContain('type');
    expect(columns).toContain('status');
    expect(columns).toContain('data');
  });

  it('should have required columns in analysis_cache table', () => {
    const columns = Object.keys(analysisCache._.columns);
    
    expect(columns).toContain('id');
    expect(columns).toContain('url_hash');
    expect(columns).toContain('original_url');
    expect(columns).toContain('audit_json');
    expect(columns).toContain('created_at');
  });
});