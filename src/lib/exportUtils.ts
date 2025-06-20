
import jsPDF from 'jspdf';
import { analysesToCsv, analysesToJSON } from './export';
import type { AnalysisResponse } from '@/types/analysis';

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

export const exportAnalysis = async (data: AnalysisResponse, options: ExportOptions): Promise<void> => {
  const timestamp = new Date().toISOString().split('T')[0];
  const domain = new URL(data.url).hostname;
  const baseFileName = `${domain}-analysis-${timestamp}`;

  // Filter data based on selected sections
  const filteredData = filterDataBySections(data, options.sections);

  switch (options.format) {
    case 'csv':
      downloadFile(
        analysesToCsv([filteredData]),
        `${baseFileName}.csv`,
        'text/csv'
      );
      break;
    case 'json':
      downloadFile(
        analysesToJSON([filteredData]),
        `${baseFileName}.json`,
        'application/json'
      );
      break;
    case 'pdf':
      await exportToPDF(filteredData, baseFileName);
      break;
  }
};

const filterDataBySections = (data: AnalysisResponse, sections: ExportOptions['sections']): AnalysisResponse => {
  const filtered = { ...data };
  
  if (!sections.overview) {
    delete filtered.data.overview;
  }
  if (!sections.ui) {
    delete filtered.data.ui;
  }
  if (!sections.performance) {
    delete filtered.data.performance;
  }
  if (!sections.seo) {
    delete filtered.data.seo;
  }
  if (!sections.technical) {
    delete filtered.data.technical;
  }
  
  return filtered;
};

const downloadFile = (content: string, fileName: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const exportToPDF = async (data: AnalysisResponse, baseFileName: string): Promise<void> => {
  const pdf = new jsPDF();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false): void => {
    pdf.setFontSize(fontSize);
    if (isBold) {
      pdf.setFont(undefined, 'bold');
    } else {
      pdf.setFont(undefined, 'normal');
    }
    
    const lines = pdf.splitTextToSize(text, 170);
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * (fontSize * 0.4) + 5;
    
    // Add new page if needed
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  const addSection = (title: string, content: any): void => {
    addText(title, 14, true);
    yPosition += 5;
    
    if (typeof content === 'object') {
      addText(JSON.stringify(content, null, 2), 9);
    } else {
      addText(String(content), 10);
    }
    yPosition += 10;
  };

  // Title
  addText('Website Analysis Report', 20, true);
  addText(`URL: ${data.url}`, 12);
  addText(`Generated: ${new Date(data.timestamp).toLocaleString()}`, 10);
  yPosition += 10;

  // Overview Section
  if (data.data.overview) {
    addSection('Overview', {
      'Overall Score': data.data.overview.overallScore,
      'Page Load Time': data.data.overview.pageLoadTime,
      'SEO Score': data.data.overview.seoScore,
      'User Experience Score': data.data.overview.userExperienceScore
    });
  }

  // Core Web Vitals
  if (data.coreWebVitals) {
    addSection('Core Web Vitals', {
      'LCP (Largest Contentful Paint)': `${data.coreWebVitals.lcp}s`,
      'FID (First Input Delay)': `${data.coreWebVitals.fid}ms`,
      'CLS (Cumulative Layout Shift)': data.coreWebVitals.cls
    });
  }

  // Performance Section
  if (data.data.performance) {
    addSection('Performance Analysis', {
      'Performance Score': data.data.performance.performanceScore,
      'Mobile Responsive': data.data.performance.mobileResponsive ? 'Yes' : 'No',
      'Recommendations Count': data.data.performance.recommendations?.length || 0
    });
  }

  // SEO Section
  if (data.data.seo) {
    addSection('SEO Analysis', {
      'SEO Score': data.data.seo.score,
      'Meta Tags': Object.keys(data.data.seo.metaTags || {}).length,
      'Checks Passed': data.data.seo.checks?.filter(c => c.status === 'good').length || 0,
      'Issues Found': data.data.seo.checks?.filter(c => c.status === 'error').length || 0
    });
  }

  // Technical Section
  if (data.data.technical) {
    addSection('Technical Analysis', {
      'Health Grade': data.data.technical.healthGrade,
      'Security Score': data.data.technical.securityScore,
      'Technologies Detected': data.data.technical.techStack?.length || 0,
      'Critical Issues': data.data.technical.issues?.filter(i => i.severity === 'high').length || 0
    });
  }

  // Security Headers
  if (data.securityHeaders) {
    addSection('Security Headers', data.securityHeaders);
  }

  // Save the PDF
  pdf.save(`${baseFileName}.pdf`);
};
