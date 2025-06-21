
import React from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Capture the current visible dashboard content for each tab
 */
export async function captureTabImages(
  tabIds: string[],
  options?: { scale?: number }
): Promise<string[]> {
  const images: string[] = [];
  
  console.log(`Starting capture of ${tabIds.length} tabs`);
  
  for (let i = 0; i < tabIds.length; i++) {
    const tabId = tabIds[i];
    console.log(`Processing tab ${i + 1}/${tabIds.length}: ${tabId}`);
    
    // Find and click the tab to activate it
    const tabTrigger = document.querySelector(`[data-tab-id="${tabId}"]`) as HTMLElement;
    if (!tabTrigger) {
      console.warn(`Could not find tab trigger for: ${tabId}`);
      continue;
    }

    // Click the tab to activate it
    tabTrigger.click();
    
    // Wait for tab to activate and content to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find the active tab panel
    const activePanel = document.querySelector(`[data-tab-panel-id="${tabId}"]`) as HTMLElement;
    if (!activePanel) {
      console.warn(`Could not find panel for tab: ${tabId}`);
      continue;
    }

    // Ensure the panel is visible
    activePanel.style.display = 'block';
    activePanel.style.visibility = 'visible';
    activePanel.style.opacity = '1';
    
    // Expand all collapsible content
    expandAllCollapsibles(activePanel);
    
    // Wait for expansions to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      console.log(`Capturing ${tabId}...`);
      
      // Capture with simpler settings to avoid scaling issues
      const canvas = await html2canvas(activePanel, {
        scale: 1, // Use scale 1 to avoid issues
        useCORS: true,
        allowTaint: true,
        backgroundColor: null, // Let it use natural background
        logging: false,
        removeContainer: false,
        foreignObjectRendering: false // Try without this to improve compatibility
      });
      
      const dataUrl = canvas.toDataURL('image/png', 0.95);
      images.push(dataUrl);
      console.log(`Successfully captured ${tabId} - Canvas size: ${canvas.width}x${canvas.height}`);
      
    } catch (error) {
      console.error(`Failed to capture ${tabId}:`, error);
      
      // Create error placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#333333';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Failed to capture ${tabId}`, canvas.width / 2, canvas.height / 2);
      }
      images.push(canvas.toDataURL('image/png'));
    }
    
    // Small delay between captures
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`Capture complete: ${images.length} images generated`);
  return images;
}

/**
 * Expand all collapsible content in the container
 */
export function expandAllCollapsibles(container: HTMLElement): void {
  // Force expand all MUI Collapse components
  const collapses = container.querySelectorAll<HTMLElement>('.MuiCollapse-root, [class*="Collapse"], [class*="collapse"]');
  collapses.forEach(el => {
    el.style.setProperty('height', 'auto', 'important');
    el.style.setProperty('max-height', 'none', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('overflow', 'visible', 'important');
    el.style.setProperty('display', 'block', 'important');
  });

  // Force expand all accordion content
  const accordions = container.querySelectorAll<HTMLElement>('.MuiAccordion-root, [class*="accordion"], [class*="Accordion"]');
  accordions.forEach(accordion => {
    accordion.classList.add('Mui-expanded');
    
    const details = accordion.querySelector<HTMLElement>('.MuiAccordionDetails-root, .MuiCollapse-root, [class*="details"], [class*="Details"]');
    if (details) {
      details.style.setProperty('height', 'auto', 'important');
      details.style.setProperty('max-height', 'none', 'important');
      details.style.setProperty('visibility', 'visible', 'important');
      details.style.setProperty('opacity', '1', 'important');
      details.style.setProperty('display', 'block', 'important');
    }
  });
}

export async function assemblePDF(
  images: string[],
  options?: { resolution?: 'standard' | 'high' }
): Promise<jsPDF> {
  console.log(`Assembling PDF with ${images.length} images`);
  
  if (images.length === 0) {
    throw new Error('No images provided for PDF assembly');
  }

  // Create PDF with A4 format
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // A4 dimensions in mm
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const contentWidth = pageWidth - (margin * 2);
  const contentHeight = pageHeight - (margin * 2);

  for (let i = 0; i < images.length; i++) {
    const dataUrl = images[i];
    console.log(`Processing image ${i + 1}/${images.length}`);
    
    try {
      // If not the first page, add a new page
      if (i > 0) {
        pdf.addPage();
      }

      // Add image to PDF with proper scaling
      // The image will be scaled to fit within the content area while maintaining aspect ratio
      pdf.addImage(
        dataUrl,
        'PNG',
        margin, // x position
        margin, // y position  
        contentWidth, // width
        0, // height (auto-calculated to maintain aspect ratio)
        undefined, // alias
        'FAST' // compression
      );
      
      console.log(`Added image ${i + 1} to PDF`);
    } catch (error) {
      console.error(`Error adding image ${i + 1} to PDF:`, error);
      
      // Add error page instead
      if (i > 0) {
        pdf.addPage();
      }
      pdf.setFontSize(16);
      pdf.text(`Error loading content for page ${i + 1}`, pageWidth / 2, pageHeight / 2, { align: 'center' });
    }
  }

  console.log('PDF assembly complete');
  return pdf;
}

// Legacy functions for compatibility
export async function cloneDashboard(): Promise<HTMLElement> {
  const dashboardEl = document.querySelector('#dashboard-root') as HTMLElement;
  if (!dashboardEl) {
    throw new Error('Dashboard content not found');
  }
  return dashboardEl;
}

export async function cleanupCapture(container: HTMLElement): Promise<void> {
  await Promise.resolve();
}
