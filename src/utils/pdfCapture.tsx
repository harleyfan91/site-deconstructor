
import React, { useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

let captureRoot: Root | null = null;

/**
 * Clone the current dashboard DOM tree into an off-screen container.
 * The container is appended to document.body and rendered via React.
 */
export async function cloneDashboard(): Promise<HTMLElement> {
  const dashboardEl = document.querySelector('#dashboard-root') as HTMLElement | null;
  if (!dashboardEl) {
    // Fallback to main content area if dashboard-root doesn't exist
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
    if (!mainContent) {
      throw new Error('Dashboard content not found');
    }
  }

  const container = document.createElement('div');
  container.id = 'pdf-capture-container';
  container.style.position = 'absolute';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '1200px';
  container.style.minHeight = '100vh';
  container.style.zIndex = '-1000';
  
  // Copy the current theme from the body
  const bodyStyles = window.getComputedStyle(document.body);
  container.style.backgroundColor = bodyStyles.backgroundColor || '#ffffff';
  container.style.color = bodyStyles.color || '#000000';
  
  document.body.appendChild(container);

  const DashboardClone = () => {
    const ref = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      if (ref.current) {
        // Find the dashboard content - try multiple selectors
        const sourceEl = document.querySelector('#dashboard-root') || 
                         document.querySelector('[data-dashboard]') ||
                         document.querySelector('main') ||
                         document.querySelector('.dashboard-content') ||
                         document.body;
        
        if (sourceEl) {
          const clone = sourceEl.cloneNode(true) as HTMLElement;
          
          // Copy all stylesheets to ensure styling is preserved
          const allStylesheets = Array.from(document.styleSheets);
          allStylesheets.forEach(sheet => {
            try {
              const styleEl = document.createElement('style');
              const rules = Array.from(sheet.cssRules || []);
              styleEl.textContent = rules.map(rule => rule.cssText).join('\n');
              ref.current?.appendChild(styleEl);
            } catch (e) {
              // Skip external stylesheets we can't access
              console.warn('Could not copy stylesheet:', e);
            }
          });
          
          // Ensure all computed styles are preserved on all elements
          const copyComputedStyles = (original: Element, cloned: Element) => {
            const originalEl = original as HTMLElement;
            const clonedEl = cloned as HTMLElement;
            
            if (originalEl && clonedEl) {
              const computedStyle = window.getComputedStyle(originalEl);
              
              // Copy critical style properties
              const importantProps = [
                'backgroundColor', 'color', 'fontFamily', 'fontSize', 'fontWeight',
                'margin', 'padding', 'border', 'borderRadius', 'boxShadow',
                'display', 'position', 'width', 'height', 'minHeight', 'maxHeight',
                'overflow', 'opacity', 'visibility', 'zIndex'
              ];
              
              importantProps.forEach(prop => {
                const value = computedStyle.getPropertyValue(prop);
                if (value) {
                  clonedEl.style.setProperty(prop, value, 'important');
                }
              });
            }
            
            // Recursively copy styles for all children
            for (let i = 0; i < original.children.length; i++) {
              if (cloned.children[i]) {
                copyComputedStyles(original.children[i], cloned.children[i]);
              }
            }
          };
          
          copyComputedStyles(sourceEl, clone);
          ref.current.appendChild(clone);
        }
      }
    }, []);

    return (
      <div 
        ref={ref} 
        style={{ 
          width: '1200px', 
          minHeight: '100vh',
          backgroundColor: window.getComputedStyle(document.body).backgroundColor || '#ffffff',
          color: window.getComputedStyle(document.body).color || '#000000'
        }} 
      />
    );
  };

  captureRoot = createRoot(container);
  captureRoot.render(<DashboardClone />);

  // Wait longer for React to render and styles to apply
  await new Promise(resolve => setTimeout(resolve, 2000));
  return container;
}

/**
 * Expand all MUI Collapse/Accordion components within the cloned container.
 */
export function expandAllCollapsibles(container: HTMLElement): void {
  // Expand MUI Collapse components
  const collapses = Array.from(container.querySelectorAll<HTMLElement>('.MuiCollapse-root, [class*="collapse"]'));
  collapses.forEach(el => {
    el.style.height = 'auto';
    el.style.maxHeight = 'none';
    el.style.visibility = 'visible';
    el.style.opacity = '1';
    el.style.overflow = 'visible';
    el.classList.add('MuiCollapse-entered');
    el.classList.remove('MuiCollapse-hidden');
  });

  // Expand MUI Accordions
  const accordions = Array.from(container.querySelectorAll<HTMLElement>('.MuiAccordion-root, [class*="accordion"]'));
  accordions.forEach(acc => {
    acc.classList.add('Mui-expanded');
    const summary = acc.querySelector<HTMLElement>('.MuiAccordionSummary-root, [class*="summary"]');
    if (summary) {
      summary.setAttribute('aria-expanded', 'true');
      summary.classList.add('Mui-expanded');
    }
    const details = acc.querySelector<HTMLElement>('.MuiAccordionDetails-root, .MuiCollapse-root, [class*="details"]');
    if (details) {
      details.style.height = 'auto';
      details.style.maxHeight = 'none';
      details.style.visibility = 'visible';
      details.style.opacity = '1';
      details.style.display = 'block';
      details.classList.add('MuiCollapse-entered');
    }
  });

  // Expand any other collapsible content
  const hiddenElements = Array.from(container.querySelectorAll<HTMLElement>('[style*="display: none"], [hidden]'));
  hiddenElements.forEach(el => {
    el.style.display = 'block';
    el.style.visibility = 'visible';
    el.removeAttribute('hidden');
  });
}

/**
 * Remove the cloned container and unmount the React tree.
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

export async function captureTabImages(
  container: HTMLElement,
  tabIds: string[],
  options?: { scale?: number }
): Promise<string[]> {
  const images: string[] = [];
  
  for (let i = 0; i < tabIds.length; i++) {
    const tabId = tabIds[i];
    console.log(`Processing tab: ${tabId}`);
    
    // Find and activate the tab button
    let tabButton = container.querySelector(`[data-tab-id="${tabId}"]`) as HTMLElement;
    if (!tabButton) {
      tabButton = container.querySelector(`[value="${tabId}"]`) as HTMLElement;
    }
    if (!tabButton) {
      tabButton = container.querySelector(`[data-value="${tabId}"]`) as HTMLElement;
    }
    if (!tabButton) {
      // Try to find by text content
      const allButtons = container.querySelectorAll('button, [role="tab"]');
      for (const btn of allButtons) {
        if (btn.textContent?.toLowerCase().includes(tabId.toLowerCase())) {
          tabButton = btn as HTMLElement;
          break;
        }
      }
    }

    if (tabButton) {
      console.log(`Found tab button for ${tabId}, clicking...`);
      
      // Remove active state from all tabs
      const allTabs = container.querySelectorAll('[role="tab"], [data-tab-id], button[value]');
      allTabs.forEach(tab => {
        tab.setAttribute('aria-selected', 'false');
        tab.classList.remove('active', 'selected');
        (tab as HTMLElement).style.backgroundColor = '';
        (tab as HTMLElement).style.color = '';
      });
      
      // Hide all tab panels
      const allPanels = container.querySelectorAll('[role="tabpanel"], [data-tab-panel-id]');
      allPanels.forEach(panel => {
        (panel as HTMLElement).style.display = 'none';
        panel.setAttribute('hidden', 'true');
      });
      
      // Activate the current tab
      tabButton.click();
      tabButton.setAttribute('aria-selected', 'true');
      tabButton.classList.add('active', 'selected');
      
      // Wait for tab activation
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Find the corresponding tab panel
    let panel = container.querySelector(`[data-tab-panel-id="${tabId}"]`) as HTMLElement;
    if (!panel) {
      panel = container.querySelector(`[id*="${tabId}"]`) as HTMLElement;
    }
    if (!panel) {
      // Find the active/visible tab panel
      const allPanels = container.querySelectorAll('[role="tabpanel"]');
      for (const p of allPanels) {
        const panelEl = p as HTMLElement;
        if (!panelEl.hasAttribute('hidden') && panelEl.style.display !== 'none') {
          panel = panelEl;
          break;
        }
      }
    }
    if (!panel) {
      // Fallback to content area
      panel = container.querySelector('.MuiTabPanel-root') as HTMLElement || container;
    }

    if (panel) {
      console.log(`Found panel for ${tabId}, preparing for capture...`);
      
      // Ensure the panel is visible and expanded
      panel.style.display = 'block';
      panel.style.visibility = 'visible';
      panel.style.opacity = '1';
      panel.removeAttribute('hidden');
      
      // Expand all collapsibles in the current panel
      expandAllCollapsibles(panel);
      
      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        // Calculate the full content height
        const scrollHeight = Math.max(
          panel.scrollHeight,
          panel.offsetHeight,
          panel.clientHeight,
          1000 // minimum height
        );
        
        console.log(`Capturing ${tabId} with height: ${scrollHeight}`);
        
        const canvas = await html2canvas(panel, { 
          scale: options?.scale ?? 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null, // Preserve original background
          width: 1200,
          height: scrollHeight,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 1200,
          windowHeight: scrollHeight
        });
        
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        images.push(dataUrl);
        console.log(`Successfully captured ${tabId}`);
        
      } catch (error) {
        console.error(`Failed to capture tab ${tabId}:`, error);
        // Create a placeholder image if capture fails
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#333333';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`Failed to capture ${tabId} tab`, canvas.width / 2, canvas.height / 2);
        }
        images.push(canvas.toDataURL('image/png'));
      }
    } else {
      console.error(`Could not find panel for tab: ${tabId}`);
    }
    
    // Small delay between captures
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log(`Captured ${images.length} images total`);
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
        const orientation: 'portrait' | 'landscape' =
          width >= height ? 'landscape' : 'portrait';

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
        resolve(); // Continue even if image fails to load
      };
      img.src = dataUrl;
    });
  }

  return pdf as jsPDF;
}
