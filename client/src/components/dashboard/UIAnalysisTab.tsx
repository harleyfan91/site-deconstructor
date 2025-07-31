import React from 'react';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
import type { AnalysisResponse } from '@/types/analysis';
import ColorExtractionCard from './ui-analysis/ColorExtractionCard';
import FontAnalysisCard from './ui-analysis/FontAnalysisCard';
import ImageAnalysisCard from './ui-analysis/ImageAnalysisCard';
import AccessibilityCard from './ui-analysis/AccessibilityCard';
import LegendContainer from './LegendContainer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { usePanelState } from '../../hooks/usePanelState';

interface UIAnalysisTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
  scanId?: string;
}

const UIAnalysisTab: React.FC<UIAnalysisTabProps> = ({ data, loading, error, scanId = 'default' }) => {
  const ui = data?.data;
  const { colors, fonts, images, imageAnalysis, contrastIssues = [], violations = [], accessibilityScore = 0 } = ui || {};
  const { state, toggle } = usePanelState(scanId);

  // Use data directly from unified overview endpoint
  // Show loading when actually loading and no complete data available

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  // Get expanded sections from panel state
  const expandedSections = Object.keys(state).filter(key => state[key]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ flexGrow: 1 }}>
          User Interface Analysis
        </Typography>
      </Box>

      <Accordion type="multiple" value={expandedSections}>
        {/* Color Extraction Section */}
        <AccordionItem value="colors">
          <Card sx={{ borderRadius: 2, width: '100%', mb: 2 }}>
            <AccordionTrigger 
              onClick={() => toggle('colors')}
              style={{ padding: '16px', cursor: 'pointer' }}
            >
              <Typography variant="h6">Color Extraction</Typography>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent sx={{ p: 2, pt: 0 }}>
                <ColorExtractionCard
                  colors={(colors || []).map(color => ({
                    hex: color.hex || '#000',
                    name: color.name || 'Unknown',
                    property: color.usage,
                    occurrences: color.count
                  }))}
                />
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Font Analysis Section */}
        <AccordionItem value="fonts">
          <Card sx={{ borderRadius: 2, width: '100%', mb: 2 }}>
            <AccordionTrigger 
              onClick={() => toggle('fonts')}
              style={{ padding: '16px', cursor: 'pointer' }}
            >
              <Typography variant="h6">Font Analysis</Typography>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent sx={{ p: 2, pt: 0 }}>
                <FontAnalysisCard
                  fonts={fonts ?? []}
                />
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Accessibility & Contrast Section */}
        <AccordionItem value="accessibility">
          <Card sx={{ borderRadius: 2, width: '100%', mb: 2 }}>
            <AccordionTrigger 
              onClick={() => toggle('accessibility')}
              style={{ padding: '16px', cursor: 'pointer' }}
            >
              <Typography variant="h6">Accessibility & Contrast</Typography>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent sx={{ p: 2, pt: 0 }}>
                  <AccessibilityCard
                    contrastIssues={contrastIssues?.map(issue => ({
                      element: (issue as any).element || 'unknown',
                      textColor: issue.textColor || (issue as any).foregroundColor || '#000',
                      backgroundColor: issue.backgroundColor || '#fff',
                      ratio: issue.ratio || 0,
                      expectedRatio: 4.5,
                      severity: 'warning' as const,
                      recommendation: 'Improve color contrast'
                    })) || []}
                    accessibilityScore={accessibilityScore}
                    violations={(violations || []).map(v => ({
                      id: v.id,
                      impact: (v.impact as any) || 'minor',
                      description: v.description || '',
                      help: (v as any).help || '',
                      nodes: (v as any).nodes || []
                    }))}
                  />
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Image Analysis Section */}
        <AccordionItem value="images">
          <Card sx={{ borderRadius: 2, width: '100%', mb: 2 }}>
            <AccordionTrigger 
              onClick={() => toggle('images')}
              style={{ padding: '16px', cursor: 'pointer' }}
            >
              <Typography variant="h6">Image Analysis</Typography>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent sx={{ p: 2, pt: 0 }}>
                <ImageAnalysisCard
                  images={images ?? []}
                  imageAnalysis={imageAnalysis}
                />
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default UIAnalysisTab;