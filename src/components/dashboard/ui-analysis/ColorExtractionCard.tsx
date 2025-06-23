
import React from 'react';
import { Box, Typography, Collapse, IconButton } from '@mui/material';
import { Palette, ChevronDown, ChevronUp } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';
import { useSessionState } from '@/hooks/useSessionState';

interface ColorExtractionCardProps {
  colors: AnalysisResponse['data']['ui']['colors'];
}

interface HarmonyGroup {
  name: string;
  colors: AnalysisResponse['data']['ui']['colors'];
}

interface UsageGroup {
  name: string;
  groups: HarmonyGroup[];
}

const ColorExtractionCard: React.FC<ColorExtractionCardProps> = ({ colors }) => {
  const [expandedSections, setExpandedSections] = useSessionState<Record<string, boolean>>(
    'ui-color-extraction-expanded',
    {}
  );

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Helper function to convert hex to HSL
  const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  // Group colors by color harmony within each usage category
  const groupByHarmony = (colors: AnalysisResponse['data']['ui']['colors']): HarmonyGroup[] => {
    if (colors.length === 0) return [];

    const neutrals: AnalysisResponse['data']['ui']['colors'] = [];
    const warm: AnalysisResponse['data']['ui']['colors'] = [];
    const cool: AnalysisResponse['data']['ui']['colors'] = [];
    const vibrant: AnalysisResponse['data']['ui']['colors'] = [];

    colors.forEach(color => {
      const hsl = hexToHsl(color.hex);
      
      // Neutral colors (low saturation)
      if (hsl.s < 20 || hsl.l > 90 || hsl.l < 10) {
        neutrals.push(color);
      }
      // Vibrant colors (high saturation)
      else if (hsl.s > 70) {
        vibrant.push(color);
      }
      // Warm colors (reds, oranges, yellows)
      else if ((hsl.h >= 0 && hsl.h <= 60) || (hsl.h >= 300 && hsl.h <= 360)) {
        warm.push(color);
      }
      // Cool colors (blues, greens, purples)
      else {
        cool.push(color);
      }
    });

    const groups: HarmonyGroup[] = [];
    if (neutrals.length) {
      groups.push({ name: 'Neutral Tones', colors: neutrals.sort((a, b) => b.count - a.count) });
    }
    if (vibrant.length) {
      groups.push({ name: 'Vibrant Colors', colors: vibrant.sort((a, b) => b.count - a.count) });
    }
    if (warm.length) {
      groups.push({ name: 'Warm Palette', colors: warm.sort((a, b) => b.count - a.count) });
    }
    if (cool.length) {
      groups.push({ name: 'Cool Palette', colors: cool.sort((a, b) => b.count - a.count) });
    }

    return groups;
  };

  // Group colors by usage category - now simplified
  const groupByUsage = (): UsageGroup[] => {
    const usageGroups: Record<string, AnalysisResponse['data']['ui']['colors']> = {};
    
    colors.forEach(color => {
      // Normalize usage to title case
      const usage = color.usage.charAt(0).toUpperCase() + color.usage.slice(1);
      
      if (!usageGroups[usage]) {
        usageGroups[usage] = [];
      }
      usageGroups[usage].push(color);
    });

    // Sort usage groups by importance
    const usageOrder = ['Background', 'Text', 'Theme', 'Accent'];
    const sortedGroups = usageOrder
      .filter(usage => usageGroups[usage])
      .map(usage => ({
        name: usage,
        groups: groupByHarmony(usageGroups[usage])
      }));

    return sortedGroups;
  };

  const usageGroups = groupByUsage();

  // Simplified auto-collapse logic
  React.useEffect(() => {
    const hadStoredState = Object.keys(expandedSections).length > 0;
    
    if (!hadStoredState && usageGroups.length > 0) {
      // Initialize all sections as expanded
      const initialState: Record<string, boolean> = {};
      usageGroups.forEach(group => {
        initialState[group.name] = true;
      });
      setExpandedSections(initialState);

      // Auto-collapse all except Background after delay
      const timer = setTimeout(() => {
        setExpandedSections(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(name => {
            if (name !== 'Background') {
              updated[name] = false;
            }
          });
          return updated;
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [usageGroups.length]);

  return (
    <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Palette size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Color Extraction
          </Typography>
        </Box>
        
        <Box>
          {usageGroups.map((usageGroup, usageIndex) => (
            <Box key={usageIndex} sx={{ mb: 2 }}>
              {/* Usage Category Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'rgba(255, 107, 53, 0.05)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 107, 53, 0.1)',
                  },
                }}
                onClick={() => toggleSection(usageGroup.name)}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
                  {usageGroup.name} ({usageGroup.groups.reduce((t,g)=>t+g.colors.length,0)})
                </Typography>
                <IconButton size="small">
                  {expandedSections[usageGroup.name] ? 
                    <ChevronUp size={20} /> : 
                    <ChevronDown size={20} />
                  }
                </IconButton>
              </Box>

              {/* Collapsible Content */}
              <Collapse in={expandedSections[usageGroup.name]}>
                <Box sx={{ mt: 2, ml: 2 }}>
                  {usageGroup.groups.map((harmonyGroup, harmonyIndex) => (
                    <Box key={harmonyIndex} sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 'bold', mb: 1 }}
                      >
                        {harmonyGroup.name}
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: 1, mb: 2 }}>
                        {harmonyGroup.colors.map((color, colorIndex) => (
                          <Box
                            key={colorIndex}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              bgcolor: 'background.paper',
                              border: '1px solid rgba(0,0,0,0.1)',
                              borderRadius: 1,
                              p: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                backgroundColor: color.hex,
                                borderRadius: 0.5,
                                mr: 1,
                                border: '1px solid rgba(0,0,0,0.1)',
                                flexShrink: 0,
                              }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 'bold',
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  fontSize: { xs: '0.65rem', sm: '0.75rem' }
                                }}
                              >
                                {color.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: 'block',
                                  fontSize: { xs: '0.6rem', sm: '0.7rem' }
                                }}
                              >
                                {color.hex}
                              </Typography>
                            </Box>
                          </Box>
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
};

export default ColorExtractionCard;
