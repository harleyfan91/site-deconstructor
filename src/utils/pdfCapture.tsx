
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

    // Ensure the panel is visible and expanded
    activePanel.style.display = 'block';
    activePanel.style.visibility = 'visible';
    activePanel.style.opacity = '1';
    
    // Expand all collapsible content
    expandAllCollapsibles(activePanel);
    
    // Wait for expansions to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Get the full content height
      const contentHeight = Math.max(
        activePanel.scrollHeight,
        activePanel.offsetHeight,
        800 // minimum height
      );
      
      console.log(`Capturing ${tabId} - Height: ${contentHeight}px`);
      
      // Capture the panel with full height
      const canvas = await html2canvas(activePanel, {
        scale: options?.scale || 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff', // Force white background for PDF
        width: activePanel.offsetWidth,
        height: contentHeight,
        scrollX: 0,
        scrollY: 0,
        removeContainer: false,
        foreignObjectRendering: true,
        logging: false
      });
      
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      images.push(dataUrl);
      console.log(`Successfully captured ${tabId}`);
      
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
    el.classList.add('MuiCollapse-entered');
    el.classList.remove('MuiCollapse-hidden');
  });

  // Force expand all accordion content
  const accordions = container.querySelectorAll<HTMLElement>('.MuiAccordion-root, [class*="accordion"], [class*="Accordion"]');
  accordions.forEach(accordion => {
    accordion.classList.add('Mui-expanded');
    
    // Expand summary
    const summary = accordion.querySelector<HTMLElement>('.MuiAccordionSummary-root, [class*="summary"], [class*="Summary"]');
    if (summary) {
      summary.setAttribute('aria-expanded', 'true');
      summary.classList.add('Mui-expanded');
    }
    
    // Show details
    const details = accordion.querySelector<HTMLElement>('.MuiAccordionDetails-root, .MuiCollapse-root, [class*="details"], [class*="Details"]');
    if (details) {
      details.style.setProperty('height', 'auto', 'important');
      details.style.setProperty('max-height', 'none', 'important');
      details.style.setProperty('visibility', 'visible', 'important');
      details.style.setProperty('opacity', '1', 'important');
      details.style.setProperty('display', 'block', 'important');
      details.classList.add('MuiCollapse-entered');
    }
  });

  // Show any hidden elements
  const hiddenElements = container.querySelectorAll<HTMLElement>('[style*="display: none"], [style*="display:none"], [hidden]');
  hiddenElements.forEach(el => {
    el.style.setProperty('display', 'block', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
    el.removeAttribute('hidden');
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

  let pdf: jsPDF | null = null;

  for (let i = 0; i < images.length; i++) {
    const dataUrl = images[i];
    console.log(`Processing image ${i + 1}/${images.length}`);
    
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const imgWidth = img.naturalWidth;
          const imgHeight = img.naturalHeight;
          
          // Standard A4 size with proper scaling
          const pdfWidth = 595.28; // A4 width in points
          const pdfHeight = 841.89; // A4 height in points
          
          // Calculate scaling to fit image on page
          const scaleX = pdfWidth / imgWidth;
          const scaleY = pdfHeight / imgHeight;
          const scale = Math.min(scaleX, scaleY);
          
          const scaledWidth = imgWidth * scale;
          const scaledHeight = imgHeight * scale;
          
          // Center the image on the page
          const x = (pdfWidth - scaledWidth) / 2;
          const y = (pdfHeight - scaledHeight) / 2;

          if (!pdf) {
            pdf = new jsPDF({ 
              orientation: 'portrait', 
              unit: 'pt', 
              format: 'a4' 
            });
            pdf.addImage(dataUrl, 'PNG', x, y, scaledWidth, scaledHeight);
          } else {
            pdf.addPage('a4', 'portrait');
            pdf.addImage(dataUrl, 'PNG', x, y, scaledWidth, scaledHeight);
          }
          
          console.log(`Added image ${i + 1} to PDF`);
          resolve();
        } catch (error) {
          console.error(`Error processing image ${i + 1}:`, error);
          reject(error);
        }
      };
      
      img.onerror = () => {
        console.error(`Failed to load image ${i + 1}`);
        reject(new Error(`Failed to load image ${i + 1}`));
      };
      
      img.src = dataUrl;
    });
  }

  if (!pdf) {
    throw new Error('Failed to create PDF');
  }

  console.log('PDF assembly complete');
  return pdf;
}

// Legacy functions for compatibility
export async function cloneDashboard(): Promise<HTMLElement> {
  // Return the main dashboard element directly
  const dashboardEl = document.querySelector('#dashboard-root') as HTMLElement;
  if (!dashboardEl) {
    throw new Error('Dashboard content not found');
  }
  return dashboardEl;
}

export async function cleanupCapture(container: HTMLElement): Promise<void> {
  // No cleanup needed for the simplified approach
  await Promise.resolve();
}
