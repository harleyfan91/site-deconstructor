/**
 * Real color extraction component that fetches live data from Playwright backend.
 * Now supports 11 semantic color buckets for comprehensive analysis.
 */
import React, { useState, useEffect } from 'react';
import { Box, Typography, Collapse, IconButton, CircularProgress, Alert, Dialog, DialogContent, SxProps, Theme } from '@mui/material';
import { Palette, ChevronDown, ChevronUp } from 'lucide-react';
import { useSessionState } from '@/hooks/useSessionState';

const SECTION_ORDER = [
  'background', 'text', 'border', 'icons',
  'accent', 'decoration', 'shadow', 'gradient',
  'svg', 'link', 'highlight', 'other',
] as const;

const ITEM_SIZE = 32;

function getSquareStyles(isExpanded: boolean): SxProps<Theme> {
  const base = {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 0.5,
    cursor: 'pointer',
    transition: 'transform 160ms ease',
  };
  return isExpanded
    ? { ...base, transform: 'scale(3.5, 2.2)', transformOrigin: 'top left', zIndex: (theme: Theme) => theme.zIndex.modal + 1 }
    : base;
}

interface HarmonyGroup {
  name: string;
  colors: Array<{ hex: string; name: string }>;
}

interface UsageGroup {
  name: string;
  groups: HarmonyGroup[];
}

interface ColorResult {
  hex: string;
  name: string;
  property: string;
  occurrences: number;
}

interface ColorExtractionCardProps {
  url?: string;
}

interface ColorDetail {
  hex: string;
  name: string;
}

export default function ColorExtractionCard({ url }: ColorExtractionCardProps) {
  const [usageGroups, setUsageGroups] = useState<UsageGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useSessionState<Record<string, boolean>>(
    'ui-color-extraction-expanded',
    {}
  );
  const [glowingSections, setGlowingSections] = useState<Record<string, boolean>>({});
  const [expandedHex, setExpandedHex] = useState<string | null>(null);


  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  useEffect(() => {
    let glowTimer: NodeJS.Timeout;
    let collapseTimer: NodeJS.Timeout;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch('/api/colors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url ?? window.location.href })
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const flat: ColorResult[] = await res.json();

        // Map flat response to grouped structure expected by the UI
        const groups: Record<string, { name: string; colors: { hex: string; name: string }[] }[]> = {};
        flat.forEach(({ hex, property, name }) => {
          const key = property; // Backend now returns bucket name directly
          groups[key] ??= [{ name: 'All', colors: [] }];
          
          // Avoid duplicates
          if (!groups[key][0].colors.some(c => c.hex === hex)) {
            groups[key][0].colors.push({ hex, name });
          }
        });

        // Filter to only include non-empty buckets in the specified order
        const sections = SECTION_ORDER.filter(bucket => groups[bucket] && groups[bucket][0].colors.length > 0);
        const arr = sections.map(name => ({ name, groups: groups[name] }));
        setUsageGroups(arr);

        // Initialize expanded sections for new data
        const initialState: Record<string, boolean> = {};
        arr.forEach(group => {
          initialState[group.name] = true;
        });
        setExpandedSections(initialState);

        // Apply glow effect after data loads
        glowTimer = setTimeout(() => {
          const glowState: Record<string, boolean> = {};
          arr.forEach(group => {
            if (group.name !== 'background') {
              glowState[group.name] = true;
            }
          });
          setGlowingSections(glowState);
        }, 1500);

        collapseTimer = setTimeout(() => {
          setExpandedSections(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(name => {
              if (name !== 'background') {
                updated[name] = false;
              }
            });
            return updated;
          });
          setGlowingSections({});
        }, 2500);

      } catch (err) {
        console.error('Color extraction error:', err);
        setError('Failed to extract colors from website');
        setUsageGroups([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      clearTimeout(glowTimer);
      clearTimeout(collapseTimer);
    };
  }, [url]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={32} sx={{ color: '#FF6B35', mr: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Extracting colors from website...
        </Typography>
      </Box>
    );
  }

  if (error || usageGroups.length === 0) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error || 'No colors could be extracted from this website'}
      </Alert>
    );
  }

  return (
    <Box onClick={() => setExpandedHex(null)}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Palette size={24} color="#FF6B35" style={{ marginRight: 8 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Color Extraction
        </Typography>
      </Box>
      
      <Box>
        {usageGroups.map((usageGroup, usageIndex) => (
          <Box key={usageIndex} sx={{ mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                p: 1,
                borderRadius: 1,
                bgcolor: 'rgba(255, 107, 53, 0.05)',
                animation: glowingSections[usageGroup.name] ? 'pulse 1s ease-in-out infinite' : 'none',
                '@keyframes pulse': {
                  '0%, 100%': { boxShadow: '0 0 5px rgba(255, 107, 53, 0.3)' },
                  '50%': { boxShadow: '0 0 15px rgba(255, 107, 53, 0.6)' }
                },
                '&:hover': { bgcolor: 'rgba(255, 107, 53, 0.1)' }
              }}
              onClick={() => toggleSection(usageGroup.name)}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
                {usageGroup.name} ({usageGroup.groups.reduce((t, g) => t + g.colors.length, 0)})
              </Typography>
              <IconButton size="small">
                {expandedSections[usageGroup.name] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </IconButton>
            </Box>
            
            <Collapse in={expandedSections[usageGroup.name]}>
              <Box sx={{ pt: 2 }}>
                {usageGroup.groups.map((harmonyGroup, harmonyIndex) => (
                  <Box key={harmonyIndex} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                      {harmonyGroup.name}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {harmonyGroup.colors.map((color, colorIndex) => (
                        <Box
                          key={colorIndex}
                          sx={{
                            ...getSquareStyles(color.hex === expandedHex),
                            backgroundColor: color.hex,
                            border: '1px solid rgba(0,0,0,0.1)',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }
                          }}
                          title={color.hex}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedHex(prev => (prev === color.hex ? null : color.hex));
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        ))}
      </Box>


    </Box>
  );
}
