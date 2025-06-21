
import React, { useEffect, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

let captureRoot: Root | null = null;

/**
 * Create a fully functional React clone of the dashboard that can handle tab switching
 */
export async function cloneDashboard(): Promise<HTMLElement> {
  // Find the source dashboard
  const dashboardEl = document.querySelector('#dashboard-root') as HTMLElement | null;
  if (!dashboardEl) {
    throw new Error('Dashboard content not found. Make sure you are on the dashboard page.');
  }

  // Create container for the clone
  const container = document.createElement('div');
  container.id = 'pdf-capture-container';
  container.style.position = 'absolute';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '1200px';
  container.style.minHeight = '100vh';
  container.style.zIndex = '-1000';
  container.style.overflow = 'visible';
  
  // Copy theme styles from document
  const bodyStyles = window.getComputedStyle(document.body);
  const htmlStyles = window.getComputedStyle(document.documentElement);
  
  container.style.backgroundColor = bodyStyles.backgroundColor || htmlStyles.backgroundColor || '#ffffff';
  container.style.color = bodyStyles.color || htmlStyles.color || '#000000';
  container.style.fontFamily = bodyStyles.fontFamily || 'sans-serif';
  
  document.body.appendChild(container);

  // Component that recreates the dashboard with working tabs
  const DashboardClone = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isReady, setIsReady] = useState(false);
    
    useEffect(() => {
      if (containerRef.current) {
        // Clone the entire dashboard structure
        const sourceElement = dashboardEl.cloneNode(true) as HTMLElement;
        
        // Copy all computed styles for every element
        const copyAllStyles = (original: Element, cloned: Element) => {
          const originalEl = original as HTMLElement;
          const clonedEl = cloned as HTMLElement;
          
          if (originalEl && clonedEl && originalEl.nodeType === Node.ELEMENT_NODE) {
            const computedStyle = window.getComputedStyle(originalEl);
            
            // Copy all style properties
            for (let i = 0; i < computedStyle.length; i++) {
              const property = computedStyle[i];
              const value = computedStyle.getPropertyValue(property);
              if (value) {
                clonedEl.style.setProperty(property, value, 'important');
              }
            }
            
            // Special handling for background and text colors
            if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
              clonedEl.style.setProperty('background-color', computedStyle.backgroundColor, 'important');
            }
            if (computedStyle.color) {
              clonedEl.style.setProperty('color', computedStyle.color, 'important');
            }
          }
          
          // Recursively copy styles for all children
          for (let i = 0; i < Math.min(original.children.length, cloned.children.length); i++) {
            copyAllStyles(original.children[i], cloned.children[i]);
          }
        };
        
        // Apply styles to the cloned structure
        copyAllStyles(dashboardEl, sourceElement);
        
        // Insert all stylesheets
        const styleElements: HTMLStyleElement[] = [];
        
        // Copy inline styles
        const allStylesheets = Array.from(document.styleSheets);
        allStylesheets.forEach((sheet, index) => {
          try {
            const styleEl = document.createElement('style');
            styleEl.setAttribute('data-source', `stylesheet-${index}`);
            
            if (sheet.href) {
              // External stylesheet - try to fetch
              fetch(sheet.href)
                .then(response => response.text())
                .then(css => {
                  styleEl.textContent = css;
                })
                .catch(() => {
                  // Fallback for external sheets we can't access
                  console.warn('Could not load external stylesheet:', sheet.href);
                });
            } else {
              // Inline stylesheet
              const rules = Array.from(sheet.cssRules || []);
              styleEl.textContent = rules.map(rule => rule.cssText).join('\n');
            }
            
            styleElements.push(styleEl);
            containerRef.current?.appendChild(styleEl);
          } catch (e) {
            console.warn('Could not copy stylesheet:', e);
          }
        });
        
        // Add the cloned dashboard
        containerRef.current.appendChild(sourceElement);
        
        // Wait for styles to be applied
        setTimeout(() => setIsReady(true), 1000);
      }
    }, []);

    return (
      <div 
        ref={containerRef}
        style={{ 
          width: '1200px', 
          minHeight: '100vh',
          backgroundColor: bodyStyles.backgroundColor || '#ffffff',
          color: bodyStyles.color || '#000000',
          fontFamily: bodyStyles.fontFamily || 'sans-serif',
          overflow: 'visible'
        }} 
        data-clone-ready={isReady}
      />
    );
  };

  // Mount the clone
  captureRoot = createRoot(container);
  captureRoot.render(<DashboardClone />);

  // Wait for React to render and styles to apply
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return container;
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

/**
 * Clean up the capture environment
 */
export async function cleanupCapture(container: HTMLElement): Promise<void> {
  if (captureRoot) {
    captureRoot.unmount();
    captureRoot = null;
  }
  if (container.parentNode) {
    container.parentNode.removeChild(container);
  }
  await Promise.resolve();
}

/**
 * Capture images for specific tabs by properly activating them
 */
export async function captureTabImages(
  container: HTMLElement,
  tabIds: string[],
  options?: { scale?: number }
): Promise<string[]> {
  const images: string[] = [];
  
  // Wait for container to be ready
  await new Promise(resolve => {
    const checkReady = () => {
      const readyIndicator = container.querySelector('[data-clone-ready="true"]');
      if (readyIndicator) {
        resolve(void 0);
      } else {
        setTimeout(checkReady, 100);
      }
    };
    checkReady();
  });

  console.log(`Starting capture of ${tabIds.length} tabs`);
  
  for (let i = 0; i < tabIds.length; i++) {
    const tabId = tabIds[i];
    console.log(`Processing tab ${i + 1}/${tabIds.length}: ${tabId}`);
    
    // Find the tab trigger with multiple selector strategies
    let tabTrigger = container.querySelector(`[data-tab-id="${tabId}"]`) as HTMLElement;
    if (!tabTrigger) {
      tabTrigger = container.querySelector(`[value="${tabId}"]`) as HTMLElement;
    }
    if (!tabTrigger) {
      tabTrigger = container.querySelector(`[data-value="${tabId}"]`) as HTMLElement;
    }
    if (!tabTrigger) {
      // Search by text content
      const buttons = container.querySelectorAll('button, [role="tab"]');
      for (const btn of buttons) {
        if (btn.textContent?.toLowerCase().includes(tabId.toLowerCase())) {
          tabTrigger = btn as HTMLElement;
          break;
        }
      }
    }
    
    if (!tabTrigger) {
      console.warn(`Could not find tab trigger for: ${tabId}`);
      continue;
    }

    // Hide all tab panels first
    const allPanels = container.querySelectorAll('[data-tab-panel-id], [role="tabpanel"]');
    allPanels.forEach(panel => {
      (panel as HTMLElement).style.setProperty('display', 'none', 'important');
      panel.setAttribute('hidden', 'true');
    });

    // Deactivate all tabs
    const allTabs = container.querySelectorAll('[data-tab-id], [value], [role="tab"]');
    allTabs.forEach(tab => {
      tab.setAttribute('aria-selected', 'false');
      tab.classList.remove('active', 'selected');
      (tab as HTMLElement).classList.remove('data-[state=active]');
    });

    // Activate the current tab
    tabTrigger.setAttribute('aria-selected', 'true');
    tabTrigger.classList.add('active', 'selected');
    tabTrigger.click();

    // Find and show the corresponding panel
    let activePanel = container.querySelector(`[data-tab-panel-id="${tabId}"]`) as HTMLElement;
    if (!activePanel) {
      // Try finding by data-state attribute or similar patterns
      const panels = container.querySelectorAll('[role="tabpanel"]');
      for (const panel of panels) {
        const panelEl = panel as HTMLElement;
        if (panelEl.getAttribute('data-state') === 'active' || 
            !panelEl.hasAttribute('hidden') ||
            panelEl.style.display !== 'none') {
          activePanel = panelEl;
          break;
        }
      }
    }
    
    if (!activePanel) {
      // Fallback to main content area
      activePanel = container.querySelector('.MuiTabPanel-root, [class*="TabPanel"]') as HTMLElement;
    }

    if (!activePanel) {
      console.warn(`Could not find panel for tab: ${tabId}`);
      continue;
    }

    // Show and prepare the panel
    activePanel.style.setProperty('display', 'block', 'important');
    activePanel.style.setProperty('visibility', 'visible', 'important');
    activePanel.style.setProperty('opacity', '1', 'important');
    activePanel.removeAttribute('hidden');
    
    // Expand all collapsible content in this panel
    expandAllCollapsibles(activePanel);
    
    // Wait for content to render and expand
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Calculate full content dimensions
      const contentHeight = Math.max(
        activePanel.scrollHeight,
        activePanel.offsetHeight,
        1200 // minimum height
      );
      
      console.log(`Capturing ${tabId} - Height: ${contentHeight}px`);
      
      // Capture the panel
      const canvas = await html2canvas(activePanel, {
        scale: options?.scale || 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: 1200,
        height: contentHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200,
        windowHeight: contentHeight,
        removeContainer: false,
        foreignObjectRendering: true
      });
      
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      images.push(dataUrl);
      console.log(`Successfully captured ${tabId}`);
      
    } catch (error) {
      console.error(`Failed to capture ${tabId}:`, error);
      
      // Create error placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#333333';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Failed to capture ${tabId}`, canvas.width / 2, canvas.height / 2);
      }
      images.push(canvas.toDataURL('image/png'));
    }
    
    // Small delay between captures
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`Capture complete: ${images.length} images generated`);
  return images;
}

export async function assemblePDF(
  images: string[],
  options?: { resolution?: 'standard' | 'high' }
): Promise<jsPDF> {
  let pdf: jsPDF | null = null;

  for (const dataUrl of images) {
    await new Promise<void>(resolve => {
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const orientation: 'portrait' | 'landscape' = width >= height ? 'landscape' : 'portrait';

        if (!pdf) {
          pdf = new jsPDF({ orientation, unit: 'pt', format: [width, height] });
          pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
        } else {
          pdf.addPage([width, height], orientation);
          pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
        }
        resolve();
      };
      img.onerror = () => {
        console.error('Failed to load image for PDF');
        resolve();
      };
      img.src = dataUrl;
    });
  }

  return pdf as jsPDF;
}
