/**
 * DUMMY placeholder – real colour extraction removed.
 * Populates two fake colours so the UI layout and animations remain intact.
 */
import React from 'react';
import { Box, Typography, Collapse, IconButton } from '@mui/material';
import { Palette, ChevronDown, ChevronUp } from 'lucide-react';
import { useSessionState } from '@/hooks/useSessionState';

interface HarmonyGroup {
  name: string;
  colors: Array<{ hex: string }>;
}

interface UsageGroup {
  name: string;
  groups: HarmonyGroup[];
}

const PLACEHOLDER_USAGE_GROUPS: UsageGroup[] = [
  {
    name: 'DUMMYbackground',
    groups: [
      {
        name: 'Placeholder',
        colors: [{ hex: '#FFFFFF' }]
      }
    ]
  },
  {
    name: 'DUMMYtext',
    groups: [
      {
        name: 'Placeholder',
        colors: [{ hex: '#000000' }]
      }
    ]
  }
];

export default function ColorExtractionCardDUMMY() {
  const [expandedSections, setExpandedSections] = useSessionState<Record<string, boolean>>(
    'ui-color-extraction-expanded',
    {}
  );
  const [glowingSections, setGlowingSections] = React.useState<Record<string, boolean>>({});

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  React.useEffect(() => {
    const hadStoredState = Object.keys(expandedSections).length > 0;

    if (!hadStoredState) {
      const initialState: Record<string, boolean> = {};
      PLACEHOLDER_USAGE_GROUPS.forEach(group => {
        initialState[group.name] = true;
      });
      setExpandedSections(initialState);

      const glowTimer = setTimeout(() => {
        const glowState: Record<string, boolean> = {};
        PLACEHOLDER_USAGE_GROUPS.forEach(group => {
          if (group.name !== 'DUMMYbackground') {
            glowState[group.name] = true;
          }
        });
        setGlowingSections(glowState);
      }, 1500);

      const collapseTimer = setTimeout(() => {
        setExpandedSections(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(name => {
            if (name !== 'DUMMYbackground') {
              updated[name] = false;
            }
          });
          return updated;
        });
        setGlowingSections({});
      }, 2500);

      return () => {
        clearTimeout(glowTimer);
        clearTimeout(collapseTimer);
      };
    }
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Palette size={24} color="#FF6B35" style={{ marginRight: 8 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Colour Extraction
        </Typography>
      </Box>
      <Box>
        {PLACEHOLDER_USAGE_GROUPS.map((usageGroup, usageIndex) => (
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
              <Box sx={{ mt: 2, ml: 2 }}>
                {usageGroup.groups.map((harmonyGroup, harmonyIndex) => (
                  <Box key={harmonyIndex} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
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
                            p: 1
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
                              flexShrink: 0
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
}
