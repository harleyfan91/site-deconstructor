
import React from 'react';
import { Box, Typography, Collapse, IconButton, Popover, FormGroup, FormControlLabel, Checkbox, Chip, Tooltip } from '@mui/material';
import { Palette, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import namer from 'color-namer';
import type { AnalysisResponse } from '@/types/analysis';
import { useSessionState } from '@/hooks/useSessionState';

interface ColorExtractionCardProps {
  colors: Array<{name: string, hex: string, usage: string, count: number}>;
}

interface HarmonyGroup {
  name: string;
  colors: Array<{name: string, hex: string, usage: string, count: number}>;
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
  const [glowingSections, setGlowingSections] = React.useState<Record<string, boolean>>({});
  const [categoryAnchorEl, setCategoryAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [categories, setCategories] = React.useState<Array<{name: string, enabled: boolean}>>([]);
  const [loadingCategories, setLoadingCategories] = React.useState(false);

  // Fetch available color categories
  React.useEffect(() => {
    fetchColorCategories();
  }, []);

  const fetchColorCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch('/api/color-categories');
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Failed to fetch color categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const toggleCategory = async (categoryName: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/color-categories/${categoryName}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      
      if (response.ok) {
        setCategories(prev => 
          prev.map(cat => 
            cat.name === categoryName ? { ...cat, enabled } : cat
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle category:', error);
    }
  };

  const handleCategoryClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCategoryAnchorEl(event.currentTarget);
  };

  const handleCategoryClose = () => {
    setCategoryAnchorEl(null);
  };

  const categoryPopoverOpen = Boolean(categoryAnchorEl);

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Helper function to get color name using color-namer
  const getColorName = (hex: string): string => {
    try {
      const result = namer(hex);
      return result.pantone[0]?.name || result.basic[0]?.name || '';
    } catch (error) {
      return '';
    }
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
  const groupByHarmony = (colors: Array<{name: string, hex: string, usage: string, count: number}>): HarmonyGroup[] => {
    if (colors.length === 0) return [];

    const neutrals: Array<{name: string, hex: string, usage: string, count: number}> = [];
    const warm: Array<{name: string, hex: string, usage: string, count: number}> = [];
    const cool: Array<{name: string, hex: string, usage: string, count: number}> = [];
    const vibrant: Array<{name: string, hex: string, usage: string, count: number}> = [];

    colors.forEach((color: any) => {
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
      groups.push({ name: 'Neutral Tones', colors: neutrals.sort((a: any, b: any) => b.count - a.count) });
    }
    if (vibrant.length) {
      groups.push({ name: 'Vibrant Colors', colors: vibrant.sort((a: any, b: any) => b.count - a.count) });
    }
    if (warm.length) {
      groups.push({ name: 'Warm Palette', colors: warm.sort((a: any, b: any) => b.count - a.count) });
    }
    if (cool.length) {
      groups.push({ name: 'Cool Palette', colors: cool.sort((a: any, b: any) => b.count - a.count) });
    }

    return groups;
  };

  // Group colors by usage category - now simplified
  const groupByUsage = (): UsageGroup[] => {
    const usageGroups: Record<string, Array<{name: string, hex: string, usage: string, count: number}>> = {};
    
    colors.forEach((color: any) => {
      // Normalize usage to title case
      const usage = color.usage.charAt(0).toUpperCase() + color.usage.slice(1);
      
      if (!usageGroups[usage]) {
        usageGroups[usage] = [];
      }
      usageGroups[usage].push(color as any);
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

  // Enhanced auto-collapse logic with glow animation
  React.useEffect(() => {
    const hadStoredState = Object.keys(expandedSections).length > 0;
    
    if (!hadStoredState && usageGroups.length > 0) {
      // Initialize all sections as expanded
      const initialState: Record<string, boolean> = {};
      usageGroups.forEach(group => {
        initialState[group.name] = true;
      });
      setExpandedSections(initialState);

      // Start glow animation 1 second before collapse
      const glowTimer = setTimeout(() => {
        const glowState: Record<string, boolean> = {};
        usageGroups.forEach(group => {
          if (group.name !== 'Background') {
            glowState[group.name] = true;
          }
        });
        setGlowingSections(glowState);
      }, 1500); // Start glowing at 1.5s (collapse happens at 2.5s)

      // Auto-collapse all except Background after delay
      const collapseTimer = setTimeout(() => {
        setExpandedSections(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(name => {
            if (name !== 'Background') {
              updated[name] = false;
            }
          });
          return updated;
        });
        // Stop glowing after collapse
        setGlowingSections({});
      }, 2500);

      return () => {
        clearTimeout(glowTimer);
        clearTimeout(collapseTimer);
      };
    }
  }, [usageGroups.length]);

  return (
    <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Palette size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
            Color Extraction
          </Typography>
          
          {/* Color Category Settings Button */}
          <Tooltip title="Configure color categories" arrow>
            <IconButton
              size="small"
              onClick={handleCategoryClick}
              disabled={loadingCategories}
              sx={{
                width: 28,
                height: 28,
                color: 'text.secondary',
                '&:hover': {
                  color: '#FF6B35',
                  bgcolor: 'rgba(255, 107, 53, 0.08)',
                },
              }}
            >
              <Settings size={16} />
            </IconButton>
          </Tooltip>
          
          {/* Color Categories Popover */}
          <Popover
            open={categoryPopoverOpen}
            anchorEl={categoryAnchorEl}
            onClose={handleCategoryClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                p: 2,
                minWidth: 220,
                maxWidth: 280,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Color Categories
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {categories.filter(cat => cat.enabled).map(cat => (
                <Chip
                  key={cat.name}
                  label={cat.name}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '0.75rem',
                    height: 24,
                    color: '#FF6B35',
                    borderColor: 'rgba(255, 107, 53, 0.3)',
                  }}
                />
              ))}
            </Box>
            <FormGroup>
              {categories.map((category) => (
                <FormControlLabel
                  key={category.name}
                  control={
                    <Checkbox
                      checked={category.enabled}
                      onChange={(e) => toggleCategory(category.name, e.target.checked)}
                      size="small"
                      sx={{
                        color: 'text.secondary',
                        '&.Mui-checked': {
                          color: '#FF6B35',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {category.name}
                    </Typography>
                  }
                  sx={{ mb: 0.5 }}
                />
              ))}
            </FormGroup>
          </Popover>
        </Box>
        
        <Box>
          {usageGroups.map((usageGroup, usageIndex) => (
            <Box key={usageIndex} sx={{ mb: 2 }}>
              {/* Usage Category Header with glow animation */}
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
                    '0%, 100%': {
                      boxShadow: '0 0 5px rgba(255, 107, 53, 0.3)',
                    },
                    '50%': {
                      boxShadow: '0 0 15px rgba(255, 107, 53, 0.6)',
                    },
                  },
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
                        {harmonyGroup.colors.map((color: any, colorIndex: number) => {
                          const colorName = getColorName(color.hex);
                          return (
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
                                  {color.hex}
                                </Typography>
                                {colorName && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      display: 'block',
                                      fontSize: { xs: '0.6rem', sm: '0.7rem' }
                                    }}
                                  >
                                    {colorName}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          );
                        })}
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
