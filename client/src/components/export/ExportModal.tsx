
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
  CircularProgress
} from '@mui/material';
import { Download } from '@mui/icons-material';
// PDF export now uses the text based generator in exportUtils
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
    content: boolean;
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
      content: true,
      performance: true,
      seo: true,
      technical: true,
      compliance: true,
    }
  });
  const [exporting, setExporting] = useState(false);

  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptions(prev => ({ ...prev, format: event.target.value as 'csv' | 'json' | 'pdf' }));
  };

  const handleSectionChange = (section: keyof ExportOptions['sections']) => {
    setOptions(prev => ({
      ...prev,
      sections: { ...prev.sections, [section]: !prev.sections[section] }
    }));
  };

  const handleExport = async () => {
    if (!data) return;

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
                    checked={options.sections.content}
                    onChange={() => handleSectionChange('content')}
                  />
                }
                label="Content Analysis"
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
              PDF export generates a text-based report with key metrics and image links.
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={exporting || !data}
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
