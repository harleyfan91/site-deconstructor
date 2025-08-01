/**
 * Real color extraction component that fetches live data from Playwright backend.
 * Now supports 11 semantic color buckets for comprehensive analysis.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Collapse, IconButton, Alert, Dialog, DialogContent, SxProps, Theme, Popover, FormControlLabel, Checkbox, FormGroup, useTheme } from '@mui/material';
import { Palette, ChevronDown, ChevronUp, Settings } from 'lucide-react';

const SECTION_ORDER = [
  'background', 'text', 'border', 'icons',
  'accent', 'decoration', 'shadow', 'gradient',
  'svg', 'link', 'highlight', 'other',
] as const;

const PRIORITY_CATEGORIES = new Set(['background', 'text', 'accent', 'border', 'icons']);

const ITEM_SIZE = 32;

function getOptimalTransformOrigin(element: HTMLElement): string {
  const rect = element.getBoundingClientRect();
  const containerRect = element.closest('[data-color-container]')?.getBoundingClientRect();
  
  if (!containerRect) return 'top left';
  
  const elementCenterX = rect.left + rect.width / 2;
  const containerCenterX = containerRect.left + containerRect.width / 2;
  const containerWidth = containerRect.width;
  
  // Calculate position as percentage from left edge
  const positionPercent = (elementCenterX - containerRect.left) / containerWidth;
  
  // Left third: expand right and down (top left origin)
  if (positionPercent < 0.33) {
    return 'top left';
  }
  // Right third: expand left and down (top right origin)
  else if (positionPercent > 0.67) {
    return 'top right';
  }
  // Middle third: expand outward from center
  else {
    return 'top center';
  }
}

function getSquareStyles(isExpanded: boolean, element?: HTMLElement | null): SxProps<Theme> {
  const base = {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 0.5,
    cursor: 'pointer',
    transition: 'transform 160ms ease',
  };
  
  if (!isExpanded) return base;
  
  const transformOrigin = element ? getOptimalTransformOrigin(element) : 'top left';
  
  return { 
    ...base, 
    transform: 'scale(3.5, 2.3)', 
    transformOrigin, 
    zIndex: (theme: Theme) => theme.zIndex.modal + 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textShadow: '0 1px 2px rgba(0,0,0,0.8)'
  };
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
  colors: Array<{
    hex: string;
    name: string;
    property: string;
    occurrences: number;
  }>;
}

interface ColorDetail {
  hex: string;
  name: string;
}

export default function ColorExtractionCard({ colors }: ColorExtractionCardProps) {
  const theme = useTheme();
  const [usageGroups, setUsageGroups] = useState<UsageGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [glowingSections, setGlowingSections] = useState<Record<string, boolean>>({});
  const [expandedHex, setExpandedHex] = useState<string | null>(null);
  const [expandedElement, setExpandedElement] = useState<HTMLElement | null>(null);
  
  // Filter state and popover controls
  const [categoryFilters, setCategoryFilters] = useState<Record<string, boolean>>(
    Object.fromEntries(SECTION_ORDER.map(cat => [cat, PRIORITY_CATEGORIES.has(cat)]))
  );
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [cogGlowing, setCogGlowing] = useState(false);


  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const toggleCategoryFilter = (category: string) => {
    setCategoryFilters(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const processColorData = (flat: ColorResult[], enableTimers: boolean = false) => {
    setLoading(true);
    
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

    // Apply glow effect after data loads (only if enableTimers is true)
    if (enableTimers) {
      const glowTimer = setTimeout(() => {
        const glowState: Record<string, boolean> = {};
        arr.forEach(group => {
          if (group.name !== 'background') {
            glowState[group.name] = true;
          }
        });
        setGlowingSections(glowState);
        setCogGlowing(true);
      }, 1500);

      const collapseTimer = setTimeout(() => {
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
        setCogGlowing(false);
      }, 2500);
      
      // Return cleanup function for the timers
      return () => {
        clearTimeout(glowTimer);
        clearTimeout(collapseTimer);
      };
    }

    setLoading(false);
    return () => {}; // Empty cleanup function
  };

  useEffect(() => {
    if (colors && colors.length > 0) {
      const flat: ColorResult[] = colors;
      const cleanup = processColorData(flat, true);
      return cleanup;
    } else {
      // No colors provided
      setUsageGroups([]);
      setLoading(false);
    }
  }, [colors]);

  // Removed early returns - header will always be rendered

  return (
    <Box onClick={() => {
      setExpandedHex(null);
      setExpandedElement(null);
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Palette size={24} style={{ marginRight: 8, color: theme.palette.primary.main }} />
          <Typography variant="h6">
            Color Extraction
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={handleFilterClick}
          sx={{
            color: 'primary.main',
            animation: cogGlowing ? 'pulse 1s ease-in-out infinite' : 'none',
            '@keyframes pulse': {
              '0%, 100%': { boxShadow: `0 0 5px ${theme.palette.primary.main}33` },
              '50%': { boxShadow: `0 0 15px ${theme.palette.primary.main}99` }
            },
            '&:hover': { 
              backgroundColor: 'primary.light',
              transform: 'scale(1.1)'
            }
          }}
        >
          <Settings size={18} />
        </IconButton>
      </Box>
      
      <Box>
        {error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : usageGroups.length === 0 ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            No colors could be extracted from this website
          </Alert>
        ) : (
          <>
            {usageGroups.filter(usageGroup => categoryFilters[usageGroup.name]).map((usageGroup, usageIndex) => (
              <Box key={usageIndex} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    p: 1,
                    borderRadius: 1,
                    bgcolor: `${theme.palette.primary.main}0D`, // rgba(255, 107, 53, 0.05) equivalent
                    animation: glowingSections[usageGroup.name] ? 'pulse 1s ease-in-out infinite' : 'none',
                    '@keyframes pulse': {
                      '0%, 100%': { boxShadow: `0 0 5px ${theme.palette.primary.main}4D` },
                      '50%': { boxShadow: `0 0 15px ${theme.palette.primary.main}99` }
                    },
                    '&:hover': { bgcolor: `${theme.palette.primary.main}1A` } // rgba(255, 107, 53, 0.1) equivalent
                  }}
                  onClick={() => toggleSection(usageGroup.name)}
                >
                  <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
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
                        <Typography variant="subtitle2" sx={{ mb: 1 }} color="text.secondary">
                          {harmonyGroup.name}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }} data-color-container>
                          {harmonyGroup.colors.map((color, colorIndex) => (
                            <Box
                              key={colorIndex}
                              sx={{
                                ...getSquareStyles(color.hex === expandedHex, expandedElement),
                                backgroundColor: color.hex,
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }
                          }}
                          title={color.hex}
                          onClick={(e) => {
                            e.stopPropagation();
                            const element = e.currentTarget as HTMLElement;
                            
                            if (expandedHex === color.hex) {
                              // Collapse
                              setExpandedHex(null);
                              setExpandedElement(null);
                            } else {
                              // Expand
                              setExpandedHex(color.hex);
                              setExpandedElement(element);
                            }
                          }}
                        >
                          {color.hex === expandedHex && (
                            <Box sx={{ 
                              opacity: 1,
                              transition: 'opacity 200ms ease-in-out 100ms',
                              textAlign: 'center',
                              transform: 'scale(0.286, 0.435)', // Inverse of the box scale to make text normal size
                              transformOrigin: 'center'
                            }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 'bold',
                                fontSize: '14px',
                                lineHeight: 1.2,
                                mb: 0.5
                              }}>
                                {color.hex.toUpperCase()}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                fontSize: '12px',
                                lineHeight: 1.2,
                                opacity: 0.9
                              }}>
                                {color.name}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        ))}
          </>
        )}
      </Box>

      {/* Filter Dropdown Popover */}
      <Popover
        open={Boolean(filterAnchor)}
        anchorEl={filterAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#FF6B35' }}>
            Show Categories
          </Typography>
          <FormGroup>
            {SECTION_ORDER.map((category) => (
              <FormControlLabel
                key={category}
                control={
                  <Checkbox
                    checked={categoryFilters[category]}
                    onChange={() => toggleCategoryFilter(category)}
                    size="small"
                    sx={{
                      color: '#FF6B35',
                      '&.Mui-checked': {
                        color: '#FF6B35',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {category}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </Box>
      </Popover>

    </Box>
  );
}
