
import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Collapse, IconButton, Grid } from '@mui/material';
import { Palette, ChevronDown, ChevronUp } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';
import { groupByFrequency } from '@/lib/ui';

interface ColorExtractionCardProps {
  colors: AnalysisResponse['data']['ui']['colors'];
}

interface ColorGroup {
  name: string;
  colors: AnalysisResponse['data']['ui']['colors'];
}

interface FrequencyGroup {
  name: string;
  colors: AnalysisResponse['data']['ui']['colors'];
}

interface UsageGroup {
  name: string;
  groups: FrequencyGroup[];
}

const ColorExtractionCard: React.FC<ColorExtractionCardProps> = ({ colors }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Helper function to determine color harmony group
  const getColorHarmonyGroup = (hex: string): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 'Other';
    
    const { r, g, b } = rgb;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    // Grayscale
    if (diff < 15) return 'Grayscale';
    
    // Determine dominant color channel
    if (r === max && r > g + 20 && r > b + 20) return 'Warm Reds';
    if (g === max && g > r + 20 && g > b + 20) return 'Cool Greens';
    if (b === max && b > r + 20 && b > g + 20) return 'Cool Blues';
    if (r > 200 && g > 200 && b < 100) return 'Warm Yellows';
    if (r > 150 && g < 100 && b > 150) return 'Cool Purples';
    if (r > 150 && g > 100 && b < 100) return 'Warm Oranges';
    
    return 'Mixed Tones';
  };

  const hexToRgb = (hex: string): {r:number;g:number;b:number} | null => {
    const match = hex.replace('#','').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return null;
    let h = match[0];
    if (h.length === 3) h = h.split('').map(c=>c+c).join('');
    const num = parseInt(h, 16);
    return {r:(num>>16)&255, g:(num>>8)&255, b:num&255};
  };

  // Group colors by usage category with improved handling
  const groupByUsage = (): UsageGroup[] => {
    const usageGroups: Record<string, AnalysisResponse['data']['ui']['colors']> = {};
    
    colors.forEach(color => {
      // Use the usage property from the backend, with fallback logic
      let usage = color.usage || 'Other';
      
      // Map old generic terms to meaningful categories
      if (usage === 'Primary' || usage === 'Secondary') {
        // Try to infer usage based on color characteristics
        const rgb = hexToRgb(color.hex);
        if (rgb) {
          const { r, g, b } = rgb;
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          
          if (brightness > 240) {
            usage = 'Background';
          } else if (brightness < 50) {
            usage = 'Text';
          } else {
            usage = 'Theme';
          }
        } else {
          usage = 'Theme';
        }
      }
      
      if (!usageGroups[usage]) {
        usageGroups[usage] = [];
      }
      usageGroups[usage].push(color);
    });

    // Sort usage groups by importance
    const usageOrder = ['Background', 'Text', 'Theme', 'Accent', 'Border', 'Other'];
    const sortedGroups = usageOrder
      .filter(usage => usageGroups[usage])
      .map(usage => ({
        name: usage,
        groups: groupByFrequency(usageGroups[usage])
      }));

    // Add any remaining groups not in the predefined order
    Object.keys(usageGroups)
      .filter(usage => !usageOrder.includes(usage))
      .forEach(usage => {
        sortedGroups.push({
          name: usage,
          groups: groupByFrequency(usageGroups[usage])
        });
      });

    return sortedGroups;
  };

  // Group colors within a usage category by color harmony
  const groupByColorHarmony = (colors: AnalysisResponse['data']['ui']['colors']) => {
    const harmonyGroups: Record<string, AnalysisResponse['data']['ui']['colors']> = {};
    
    colors.forEach(color => {
      const harmonyGroup = getColorHarmonyGroup(color.hex);
      if (!harmonyGroups[harmonyGroup]) {
        harmonyGroups[harmonyGroup] = [];
      }
      harmonyGroups[harmonyGroup].push(color);
    });

    return Object.entries(harmonyGroups).map(([harmony, colors]) => ({
      name: harmony,
      colors: colors
    }));
  };

  const usageGroups = groupByUsage();

  // Initialize all sections as expanded
  React.useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    usageGroups.forEach(group => {
      initialExpanded[group.name] = true;
    });
    setExpandedSections(initialExpanded);
  }, [colors]);

  return (
    <Card sx={{ borderRadius: 2, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
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
                  {usageGroup.groups.map((freqGroup, freqIndex) => (
                    <Box key={freqIndex} sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 'bold', mb: 1 }}

                      >
                        {freqGroup.name}
                      </Typography>
                      {groupByColorHarmony(freqGroup.colors).map((harmonyGroup, harmonyIndex) => (
                        <Box key={harmonyIndex} sx={{ mb: 3 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 'medium',
                              color: 'text.secondary',
                              mb: 1,
                              fontSize: '0.85rem'
                            }}
                          >
                            {harmonyGroup.name}
                          </Typography>
                          <Grid container spacing={1} sx={{ mb: 2 }}>
                            {harmonyGroup.colors.map((color, colorIndex) => (
                              <Grid key={colorIndex} xs={4} sm={3} md={2}>
                                <Box
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
                                    }}
                                  >
                                    {color.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      display: 'block',
                                      fontSize: '0.7rem'
                                    }}
                                  >
                                    {color.hex}
                                  </Typography>
                                </Box>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ColorExtractionCard;
