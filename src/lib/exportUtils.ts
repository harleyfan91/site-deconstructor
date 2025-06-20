
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
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;

  // Colors matching the dashboard theme
  const primaryColor = '#FF6B35';
  const successColor = '#4CAF50';
  const warningColor = '#FF9800';
  const errorColor = '#F44336';
  const textColor = '#333333';
  const lightGray = '#F5F5F5';

  // Helper function to add a new page if needed
  const checkNewPage = (additionalHeight: number = 20): void => {
    if (yPosition + additionalHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  // Helper function to add styled text
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false, color: string = textColor): void => {
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color);
    if (isBold) {
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setFont('helvetica', 'normal');
    }
    
    const lines = pdf.splitTextToSize(text, pageWidth - (margin * 2));
    checkNewPage(lines.length * (fontSize * 0.4) + 5);
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * (fontSize * 0.4) + 5;
  };

  // Helper function to add a section header with background
  const addSectionHeader = (title: string): void => {
    checkNewPage(25);
    
    // Add colored background rectangle
    pdf.setFillColor(primaryColor);
    pdf.rect(margin, yPosition - 5, pageWidth - (margin * 2), 20, 'F');
    
    // Add white text on colored background
    pdf.setTextColor('#FFFFFF');
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin + 5, yPosition + 8);
    
    yPosition += 25;
    pdf.setTextColor(textColor); // Reset color
  };

  // Helper function to add metric cards
  const addMetricCard = (label: string, value: string, description: string, color: string = textColor): void => {
    checkNewPage(30);
    
    // Draw card background
    pdf.setFillColor(lightGray);
    pdf.rect(margin, yPosition, pageWidth - (margin * 2), 25, 'F');
    
    // Add metric label
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(textColor);
    pdf.text(label, margin + 5, yPosition + 8);
    
    // Add metric value
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(color);
    pdf.text(value, margin + 5, yPosition + 16);
    
    // Add description
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor('#666666');
    pdf.text(description, margin + 5, yPosition + 22);
    
    yPosition += 30;
  };

  // Helper function to add checklist items
  const addChecklistItem = (name: string, status: string, description: string): void => {
    checkNewPage(15);
    
    const statusColor = status === 'good' ? successColor : status === 'warning' ? warningColor : errorColor;
    const statusIcon = status === 'good' ? '✓' : status === 'warning' ? '⚠' : '✗';
    
    // Status icon
    pdf.setTextColor(statusColor);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(statusIcon, margin, yPosition);
    
    // Check name
    pdf.setTextColor(textColor);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(name, margin + 10, yPosition);
    
    // Description
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor('#666666');
    const descLines = pdf.splitTextToSize(description, pageWidth - margin - 15);
    pdf.text(descLines, margin + 10, yPosition + 8);
    
    yPosition += Math.max(15, descLines.length * 4 + 8);
  };

  // Main title and header
  pdf.setFillColor(primaryColor);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor('#FFFFFF');
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Website Analysis Report', margin, 25);
  
  yPosition = 50;
  
  // URL and timestamp
  addText(`URL: ${data.url}`, 12, true);
  addText(`Generated: ${new Date(data.timestamp).toLocaleString()}`, 10);
  yPosition += 10;

  // Overview Section
  if (data.data.overview) {
    addSectionHeader('Overview');
    
    const overview = data.data.overview;
    addMetricCard(
      'Overall Score',
      `${overview.overallScore}/100`,
      overview.overallScore >= 80 ? 'Excellent performance' : overview.overallScore >= 60 ? 'Good performance' : 'Needs improvement',
      overview.overallScore >= 80 ? successColor : overview.overallScore >= 60 ? warningColor : errorColor
    );
    
    addMetricCard('Page Load Time', overview.pageLoadTime, 'Page loading performance');
    addMetricCard(
      'SEO Score',
      `${overview.seoScore}/100`,
      overview.seoScore >= 80 ? 'Excellent SEO' : 'Could be improved',
      overview.seoScore >= 80 ? successColor : warningColor
    );
    
    addMetricCard(
      'User Experience',
      `${overview.userExperienceScore}/100`,
      overview.userExperienceScore >= 80 ? 'Excellent UX' : 'Good UX',
      overview.userExperienceScore >= 80 ? successColor : '#2196F3'
    );
  }

  // Core Web Vitals
  if (data.coreWebVitals) {
    addSectionHeader('Core Web Vitals');
    addText(`LCP (Largest Contentful Paint): ${data.coreWebVitals.lcp}s`, 10);
    addText(`FID (First Input Delay): ${data.coreWebVitals.fid}ms`, 10);
    addText(`CLS (Cumulative Layout Shift): ${data.coreWebVitals.cls}`, 10);
    yPosition += 10;
  }

  // Performance Section
  if (data.data.performance) {
    addSectionHeader('Performance Analysis');
    const performance = data.data.performance;
    
    addMetricCard(
      'Performance Score',
      `${performance.performanceScore}/100`,
      performance.performanceScore >= 90 ? 'Excellent' : performance.performanceScore >= 70 ? 'Good' : 'Needs improvement',
      performance.performanceScore >= 90 ? successColor : performance.performanceScore >= 70 ? warningColor : errorColor
    );
    
    addText(`Mobile Responsive: ${performance.mobileResponsive ? 'Yes' : 'No'}`, 10);
    yPosition += 5;
    
    if (performance.recommendations && performance.recommendations.length > 0) {
      addText('Key Recommendations:', 12, true);
      performance.recommendations.slice(0, 3).forEach(rec => {
        addText(`• ${rec.title}: ${rec.description}`, 9);
      });
    }
  }

  // SEO Section
  if (data.data.seo) {
    addSectionHeader('SEO Analysis');
    const seo = data.data.seo;
    
    addMetricCard(
      'SEO Score',
      `${seo.score}/100`,
      seo.score >= 80 ? 'Excellent SEO' : seo.score >= 60 ? 'Good SEO' : 'Needs improvement',
      seo.score >= 80 ? successColor : seo.score >= 60 ? warningColor : errorColor
    );
    
    if (seo.checks && seo.checks.length > 0) {
      addText('SEO Checklist:', 12, true);
      seo.checks.forEach(check => {
        addChecklistItem(check.name, check.status, check.description);
      });
    }
  }

  // Technical Section
  if (data.data.technical) {
    addSectionHeader('Technical Analysis');
    const technical = data.data.technical;
    
    addText(`Health Grade: ${technical.healthGrade}`, 10, true);
    addText(`Security Score: ${technical.securityScore}/100`, 10, true);
    yPosition += 5;
    
    if (technical.techStack && technical.techStack.length > 0) {
      addText('Technologies Detected:', 12, true);
      technical.techStack.slice(0, 10).forEach(tech => {
        addText(`• ${tech.category}: ${tech.technology}`, 9);
      });
    }
    
    if (technical.issues && technical.issues.length > 0) {
      yPosition += 10;
      addText('Critical Issues:', 12, true);
      technical.issues.filter(issue => issue.severity === 'high').slice(0, 5).forEach(issue => {
        addText(`• ${issue.type}: ${issue.description}`, 9);
      });
    }
  }

  // Security Headers
  if (data.securityHeaders) {
    addSectionHeader('Security Headers');
    Object.entries(data.securityHeaders).forEach(([key, value]) => {
      const status = value ? 'Present' : 'Missing';
      const statusColor = value ? successColor : errorColor;
      addText(`${key.toUpperCase()}: ${status}`, 10, false, statusColor);
    });
  }

  // Footer
  checkNewPage(20);
  pdf.setFillColor('#F5F5F5');
  pdf.rect(0, pageHeight - 25, pageWidth, 25, 'F');
  pdf.setTextColor('#666666');
  pdf.setFontSize(8);
  pdf.text('Generated by Website Analysis Tool', margin, pageHeight - 10);
  pdf.text(`Page ${pdf.internal.getNumberOfPages()}`, pageWidth - margin - 20, pageHeight - 10);

  // Save the PDF
  pdf.save(`${baseFileName}.pdf`);
};
