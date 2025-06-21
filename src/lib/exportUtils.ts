
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
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Color palette matching the dashboard
  const colors = {
    primary: '#FF6B35',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    text: '#333333',
    lightGray: '#F5F5F5',
    darkGray: '#666666'
  };

  // Helper functions
  const addNewPageIfNeeded = (requiredSpace: number = 30) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  const addTitle = (text: string, fontSize: number = 16, color: string = colors.primary) => {
    addNewPageIfNeeded(30);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(color);
    pdf.text(text, margin, yPosition);
    yPosition += fontSize + 10;
  };

  const addSubtitle = (text: string, fontSize: number = 12) => {
    addNewPageIfNeeded(20);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(colors.text);
    pdf.text(text, margin, yPosition);
    yPosition += fontSize + 5;
  };

  const addText = (text: string, fontSize: number = 10, color: string = colors.text, indent: number = 0) => {
    addNewPageIfNeeded(15);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(color);
    const lines = pdf.splitTextToSize(text, pageWidth - (margin * 2) - indent);
    pdf.text(lines, margin + indent, yPosition);
    yPosition += (lines.length * fontSize * 0.4) + 5;
  };

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const match = hex.replace('#', '').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return null;
    let h = match[0];
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const num = parseInt(h, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  };

  const groupColorsForExport = (
    palette: AnalysisResponse['data']['ui']['colors']
  ): { name: string; colors: string[] }[] => {
    const groups: Record<string, string[]> = {};
    palette.forEach(color => {
      let usage = color.usage || 'Theme';
      if (usage === 'Primary' || usage === 'Secondary') {
        const rgb = hexToRgb(color.hex);
        if (rgb) {
          const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
          if (brightness > 240) usage = 'Background';
          else if (brightness < 50) usage = 'Text';
          else usage = 'Theme';
        } else {
          usage = 'Theme';
        }
      }
      if (!['Background', 'Text', 'Theme'].includes(usage)) usage = 'Theme';
      if (!groups[usage]) groups[usage] = [];
      groups[usage].push(color.hex);
    });
    const order = ['Background', 'Text', 'Theme'];
    return order
      .map(name => ({ name, colors: groups[name] || [] }))
      .filter(g => g.colors.length > 0);
  };

  const addColorTable = (hexes: string[]) => {
    const columns = 3;
    const cellWidth = (pageWidth - margin * 2) / columns;
    const cellHeight = 15;
    let col = 0;
    hexes.forEach(hex => {
      addNewPageIfNeeded(cellHeight);
      const x = margin + col * cellWidth;
      const y = yPosition;
      pdf.setFillColor(hex);
      pdf.rect(x, y, 10, 10, 'F');
      pdf.setDrawColor(0);
      pdf.rect(x, y, 10, 10);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(colors.text);
      pdf.text(hex, x + 12, y + 7);
      col++;
      if (col === columns) {
        col = 0;
        yPosition += cellHeight;
      }
    });
    if (col !== 0) yPosition += cellHeight;
  };

  const addMetricCard = (title: string, value: string, color: string, description?: string) => {
    addNewPageIfNeeded(40);
    
    // Card background
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPosition - 5, pageWidth - (margin * 2), 35, 'F');
    
    // Title
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(colors.text);
    pdf.text(title, margin + 5, yPosition + 5);
    
    // Value
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(color);
    pdf.text(value, margin + 5, yPosition + 15);
    
    // Description
    if (description) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(colors.darkGray);
      const descLines = pdf.splitTextToSize(description, pageWidth - (margin * 2) - 10);
      pdf.text(descLines, margin + 5, yPosition + 25);
    }
    
    yPosition += 45;
  };

  const addSection = (title: string, content?: any) => {
    addNewPageIfNeeded(50);
    
    // Section header with line
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(colors.primary);
    pdf.text(title, margin, yPosition);
    
    // Underline
    pdf.setDrawColor(colors.primary);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
    
    yPosition += 15;
  };

  // Header
  pdf.setFillColor(255, 107, 53);
  pdf.rect(0, 0, pageWidth, 50, 'F');
  
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('Website Analysis Report', margin, 25);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 40);
  
  yPosition = 70;

  // URL and timestamp
  addText(`Website: ${data.url}`, 12, colors.primary);
  addText(`Analysis Date: ${new Date(data.timestamp).toLocaleString()}`, 10, colors.darkGray);
  yPosition += 10;

  // Overview Section
  if (data.data.overview) {
    addSection('Overview');
    
    const overview = data.data.overview;
    addMetricCard(
      'Overall Score', 
      `${overview.overallScore}/100`,
      overview.overallScore >= 80 ? colors.success : overview.overallScore >= 60 ? colors.warning : colors.primary,
      'Comprehensive website performance rating'
    );
    
    addMetricCard(
      'SEO Score', 
      `${overview.seoScore}/100`,
      overview.seoScore >= 80 ? colors.success : overview.seoScore >= 60 ? colors.warning : colors.primary,
      'Search engine optimization effectiveness'
    );
    
    addMetricCard(
      'Page Load Time', 
      overview.pageLoadTime,
      colors.info,
      'Time taken for the page to fully load'
    );
    
    addMetricCard(
      'User Experience Score', 
      `${overview.userExperienceScore}/100`,
      overview.userExperienceScore >= 80 ? colors.success : colors.info,
      'Overall user experience rating'
    );
  }

  // Core Web Vitals
  if (data.coreWebVitals) {
    addSection('Core Web Vitals');
    
    addMetricCard(
      'Largest Contentful Paint (LCP)', 
      `${data.coreWebVitals.lcp}s`,
      data.coreWebVitals.lcp <= 2.5 ? colors.success : colors.warning,
      'Loading performance - measures when the largest content element becomes visible'
    );
    
    addMetricCard(
      'First Input Delay (FID)', 
      `${data.coreWebVitals.fid}ms`,
      data.coreWebVitals.fid <= 100 ? colors.success : colors.warning,
      'Interactivity - measures delay between first user interaction and browser response'
    );
    
    addMetricCard(
      'Cumulative Layout Shift (CLS)', 
      data.coreWebVitals.cls.toString(),
      data.coreWebVitals.cls <= 0.1 ? colors.success : colors.warning,
      'Visual stability - measures unexpected layout shifts during page load'
    );
  }

  // Performance Section
  if (data.data.performance) {
    addSection('Performance Analysis');
    
    const perf = data.data.performance;
    addMetricCard(
      'Performance Score', 
      `${perf.performanceScore}/100`,
      perf.performanceScore >= 80 ? colors.success : colors.warning,
      'Overall performance rating'
    );
    
    addMetricCard(
      'Mobile Responsive', 
      perf.mobileResponsive ? 'Yes' : 'No',
      perf.mobileResponsive ? colors.success : colors.primary,
      'Website adapts to mobile devices'
    );
    
    if (perf.recommendations && perf.recommendations.length > 0) {
      addSubtitle('Performance Recommendations:');
      perf.recommendations.forEach((rec, index) => {
        addText(`${index + 1}. ${rec.title || rec.description}`, 10, colors.text, 10);
      });
    }
  }

  // SEO Section
  if (data.data.seo) {
    addSection('SEO Analysis');
    
    const seo = data.data.seo;
    addMetricCard(
      'SEO Score', 
      `${seo.score}/100`,
      seo.score >= 80 ? colors.success : colors.warning,
      'Search engine optimization effectiveness'
    );
    
    if (seo.metaTags) {
      addSubtitle('Meta Tags:');
      Object.entries(seo.metaTags).forEach(([key, value]) => {
        addText(`${key}: ${value}`, 9, colors.text, 10);
      });
    }
    
    if (seo.checks && seo.checks.length > 0) {
      addSubtitle('SEO Checks:');
      const passed = seo.checks.filter(c => c.status === 'good').length;
      const failed = seo.checks.filter(c => c.status === 'error').length;
      
      addText(`✓ Passed: ${passed}`, 10, colors.success, 10);
      addText(`✗ Failed: ${failed}`, 10, colors.primary, 10);
      
      seo.checks.forEach(check => {
        const icon = check.status === 'good' ? '✓' : '✗';
        const color = check.status === 'good' ? colors.success : colors.primary;
        addText(`${icon} ${check.description}`, 9, color, 15);
      });
    }
  }

  // Technical Section
  if (data.data.technical) {
    addSection('Technical Analysis');
    
    const tech = data.data.technical;
    addMetricCard(
      'Health Grade', 
      tech.healthGrade,
      tech.healthGrade === 'A' ? colors.success : tech.healthGrade === 'B' ? colors.info : colors.warning,
      'Overall technical health assessment'
    );
    
    addMetricCard(
      'Security Score', 
      `${tech.securityScore}/100`,
      tech.securityScore >= 80 ? colors.success : colors.warning,
      'Website security assessment'
    );
    
    if (tech.techStack && tech.techStack.length > 0) {
      addSubtitle('Technologies Detected:');
      tech.techStack.forEach(tech => {
        addText(`• ${tech.technology} (${tech.category})`, 10, colors.text, 10);
      });
    }
    
    if (tech.issues && tech.issues.length > 0) {
      addSubtitle('Technical Issues:');
      tech.issues.forEach(issue => {
        const color = issue.severity === 'high' ? colors.primary : 
                     issue.severity === 'medium' ? colors.warning : colors.darkGray;
        addText(`• ${issue.description} (${issue.severity})`, 10, color, 10);
      });
    }
  }

  // UI Analysis Section
  if (data.data.ui) {
    addSection('User Interface Analysis');
    
    const ui = data.data.ui;
    
    if (ui.colors && ui.colors.length > 0) {
      addSubtitle('Color Palette:');
      const usageGroups = groupColorsForExport(ui.colors);
      usageGroups.forEach(group => {
        addText(group.name + ':', 10, colors.text, 10);
        addColorTable(group.colors);
      });
    }
    
    if (ui.fonts && ui.fonts.length > 0) {
      addSubtitle('Fonts Used:');
      ui.fonts.forEach(font => {
        addText(`• ${font.name} - ${font.category} (${font.usage})`, 10, colors.text, 10);
      });
    }
    
    if (ui.imageAnalysis) {
      addSubtitle('Image Analysis:');
      addText(`Total Images: ${ui.imageAnalysis.totalImages}`, 10, colors.text, 10);

      addText(`Estimated Photos: ${ui.imageAnalysis.estimatedPhotos}`, 10, colors.text, 10);
      if (ui.imageAnalysis.photoUrls && ui.imageAnalysis.photoUrls.length > 0) {
        ui.imageAnalysis.photoUrls.forEach(url => {
          addText(`• ${url}`, 9, colors.text, 15);
        });
      }

      addText(`Estimated Icons: ${ui.imageAnalysis.estimatedIcons}`, 10, colors.text, 10);
      if (ui.imageAnalysis.iconUrls && ui.imageAnalysis.iconUrls.length > 0) {
        ui.imageAnalysis.iconUrls.forEach(url => {
          addText(`• ${url}`, 9, colors.text, 15);
        });
      }
    }
  }

  // Security Headers
  if (data.securityHeaders) {
    addSection('Security Headers');
    Object.entries(data.securityHeaders).forEach(([header, status]) => {
      const color = status === 'present' ? colors.success : colors.primary;
      const icon = status === 'present' ? '✓' : '✗';
      addText(`${icon} ${header}: ${status}`, 10, color, 10);
    });
  }

  // Footer
  addNewPageIfNeeded(30);
  yPosition = pageHeight - 40;
  pdf.setFontSize(8);
  pdf.setTextColor(colors.darkGray);
  pdf.text(`Report generated on ${new Date().toLocaleString()}`, margin, yPosition);
  
  // Get current page number manually since getNumberOfPages doesn't exist
  const currentPage = (pdf as any).internal.pages.length - 1;
  pdf.text(`Page ${currentPage}`, pageWidth - margin - 20, yPosition);

  // Save the PDF
  pdf.save(`${baseFileName}.pdf`);
};
