
import React from 'react';
import { Box, Typography, Collapse, IconButton } from '@mui/material';
import { Palette, ChevronDown, ChevronUp } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';
import { useSessionState } from '@/hooks/useSessionState';

interface ColorExtractionCardProps {
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

  // Group colors by frequency within each group
  const groupByFrequency = (colors: AnalysisResponse['data']['ui']['colors']): FrequencyGroup[] => {
    const sorted = [...colors].sort((a, b) => b.count - a.count);

    let mostCount = 3;
    if (sorted.length < 3) mostCount = sorted.length;
    else if (sorted.length > 5) mostCount = 5;
    else mostCount = sorted.length;

    const mostUsed = sorted.slice(0, mostCount);
    const remaining = sorted.slice(mostCount);
    const supportingCount = Math.ceil(remaining.length / 2);
    const supporting = remaining.slice(0, supportingCount);
    const accent = remaining.slice(supportingCount);

    const groups: FrequencyGroup[] = [];
    if (mostUsed.length) groups.push({ name: 'Most Used', colors: mostUsed });
    if (supporting.length) groups.push({ name: 'Supporting Colors', colors: supporting });
    if (accent.length) groups.push({ name: 'Accent Colors', colors: accent });

    return groups;
  };

  // Group colors by usage category - preserve original backend usage values
  const groupByUsage = (): UsageGroup[] => {
    const usageGroups: Record<string, AnalysisResponse['data']['ui']['colors']> = {};
    
    colors.forEach(color => {
      // Use original usage value from backend, with minimal cleanup
      let usage = color.usage || 'Other';
      
      // Only normalize casing and basic cleanup, don't remap to different categories
      usage = usage.charAt(0).toUpperCase() + usage.slice(1).toLowerCase();
      
      // Handle plural forms
      if (usage.endsWith('s') && usage !== 'Buttons') {
        usage = usage.slice(0, -1);
      }
      
      if (!usageGroups[usage]) {
        usageGroups[usage] = [];
      }
      usageGroups[usage].push(color);
    });

    // Sort usage groups by importance, preserving original categories
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
      .sort()
      .forEach(usage => {
        sortedGroups.push({
          name: usage,
          groups: groupByFrequency(usageGroups[usage])
        });
      });

    return sortedGroups;
  };

  const usageGroups = groupByUsage();

  // Initialize sections and auto-collapse functionality
  React.useEffect(() => {
    const hadStoredState = Object.keys(expandedSections).length > 0;
    let hasNewSection = false;

    // Ensure any brand-new groups show up expanded
    setExpandedSections(prev => {
      const updated = { ...prev };
      usageGroups.forEach(group => {
        if (!(group.name in updated)) {
          updated[group.name] = true;
          hasNewSection = true;
        }
      });
      return updated;
    });

    // Only auto-collapse on very first load when new sections appeared
    let timer: NodeJS.Timeout | undefined;
    if (!hadStoredState && hasNewSection) {
      timer = setTimeout(() => {
        setExpandedSections(prev => {
          const updated: Record<string, boolean> = { ...prev };
          Object.keys(updated).forEach(name => {
            if (name !== 'Background') {
              updated[name] = false;
            }
          });
          return updated;
        });
      }, 2500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [colors]);

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
                  {usageGroup.groups.map((freqGroup, freqIndex) => (
                    <Box key={freqIndex} sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 'bold', mb: 1 }}
                      >
                        {freqGroup.name}
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: 1, mb: 2 }}>
                        {freqGroup.colors.map((color, colorIndex) => (
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
