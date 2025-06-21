
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Box,
  Typography,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { cloneDashboard, captureTabImages, cleanupCapture } from '../../utils/pdfCapture';
import { assemblePDF } from '../../utils/pdfCapture';
import type { AnalysisResponse } from '@/types/analysis';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  data: AnalysisResponse | null;
}

interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  sections: {
    overview: boolean;
    ui: boolean;
    performance: boolean;
    seo: boolean;
    technical: boolean;
    compliance: boolean;
  };
}

const ExportModal: React.FC<ExportModalProps> = ({ open, onClose, data }) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'json',
    sections: {
      overview: true,
      ui: true,
      performance: true,
      seo: true,
      technical: true,
      compliance: true,
    }
  });
  const [exporting, setExporting] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<number>(0);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [totalTabs, setTotalTabs] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>('');

  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptions(prev => ({ ...prev, format: event.target.value as 'csv' | 'json' | 'pdf' }));
  };

  const handleSectionChange = (section: keyof ExportOptions['sections']) => {
    setOptions(prev => ({
      ...prev,
      sections: { ...prev.sections, [section]: !prev.sections[section] }
    }));
  };

  const handleExportPdf = async () => {
    if (!data) return;

    setIsExportingPdf(true);
    setPdfProgress(0);
    setCurrentStep('Preparing dashboard...');

    try {
      // Add dashboard-root ID to the main content if it doesn't exist
      let dashboardRoot = document.querySelector('#dashboard-root');
      if (!dashboardRoot) {
        const mainContent = document.querySelector('main') || document.querySelector('[data-dashboard]');
        if (mainContent) {
          mainContent.id = 'dashboard-root';
          dashboardRoot = mainContent;
        }
      }

      setCurrentStep('Cloning dashboard...');
      const container = await cloneDashboard();
      
      // Map sections to actual tab identifiers
      const sectionMap: Record<keyof ExportOptions['sections'], string> = {
        overview: 'overview',
        ui: 'ui', 
        performance: 'performance',
        seo: 'seo',
        technical: 'tech',
        compliance: 'compliance'
      };
      
      const selectedSections = (Object.keys(options.sections) as Array<keyof ExportOptions['sections']>)
        .filter(key => options.sections[key]);
      
      const tabIds = selectedSections.map(key => sectionMap[key]);
      setTotalTabs(tabIds.length);

      if (tabIds.length === 0) {
        throw new Error('No sections selected for export');
      }

      setCurrentStep('Capturing screenshots...');
      const resolution: 'standard' | 'high' = 'standard';
      const images: string[] = [];
      
      for (let i = 0; i < tabIds.length; i++) {
        const tabId = tabIds[i];
        setCurrentStep(`Capturing ${tabId} tab...`);
        
        try {
          const tabImages = await captureTabImages(container, [tabId], { 
            scale: resolution === 'high' ? 2 : 1 
          });
          
          if (tabImages.length > 0) {
            images.push(tabImages[0]);
          }
          
          setPdfProgress(i + 1);
        } catch (error) {
          console.error(`Failed to capture ${tabId}:`, error);
          // Continue with other tabs even if one fails
        }
        
        // Small delay between captures
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      if (images.length === 0) {
        throw new Error('No images were captured. Please try again.');
      }

      setCurrentStep('Assembling PDF...');
      const pdf = await assemblePDF(images, { resolution });
      
      setCurrentStep('Downloading...');
      await cleanupCapture(container);
      
      const fileName = `dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      setCurrentStep('Complete!');
    } catch (error) {
      console.error('PDF export failed:', error);
      setCurrentStep(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Clean up on error
      const container = document.querySelector('#pdf-capture-container');
      if (container) {
        await cleanupCapture(container as HTMLElement);
      }
    } finally {
      setTimeout(() => {
        setIsExportingPdf(false);
        setPdfProgress(0);
        setCurrentStep('');
        onClose();
      }, 1500);
    }
  };

  const handleExport = async () => {
    if (!data) return;

    if (options.format === 'pdf') {
      await handleExportPdf();
      return;
    }

    setExporting(true);
    try {
      const { exportAnalysis } = await import('../../lib/exportUtils');
      await exportAnalysis(data, options);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Analysis Report</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend">Export Format</FormLabel>
            <RadioGroup
              value={options.format}
              onChange={handleFormatChange}
              row
            >
              <FormControlLabel value="json" control={<Radio />} label="JSON" />
              <FormControlLabel value="csv" control={<Radio />} label="CSV" />
              <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
            </RadioGroup>
          </FormControl>

          <FormControl component="fieldset">
            <FormLabel component="legend">Include Sections</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.sections.overview}
                    onChange={() => handleSectionChange('overview')}
                  />
                }
                label="Overview"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.sections.ui}
                    onChange={() => handleSectionChange('ui')}
                  />
                }
                label="User Interface Analysis"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.sections.performance}
                    onChange={() => handleSectionChange('performance')}
                  />
                }
                label="Performance & Security"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.sections.seo}
                    onChange={() => handleSectionChange('seo')}
                  />
                }
                label="SEO Analysis"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.sections.technical}
                    onChange={() => handleSectionChange('technical')}
                  />
                }
                label="Technical Analysis"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.sections.compliance}
                    onChange={() => handleSectionChange('compliance')}
                  />
                }
                label="Compliance"
              />
            </FormGroup>
          </FormControl>

          {options.format === 'pdf' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              PDF export captures visual screenshots of each dashboard tab for professional reporting.
            </Typography>
          )}
          
          {isExportingPdf && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={totalTabs > 0 ? (pdfProgress / totalTabs) * 100 : 0} 
              />
              <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                {currentStep || `Capturing tab ${pdfProgress} of ${totalTabs}...`}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isExportingPdf}>Cancel</Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={exporting || !data || isExportingPdf}
          startIcon={exporting ? <CircularProgress size={20} /> : <Download />}
          sx={{
            background: 'linear-gradient(45deg, #FF6B35 30%, #FF8A65 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #FF8A65 30%, #FF6B35 90%)',
            },
          }}
        >
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportModal;
