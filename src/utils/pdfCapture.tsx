
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
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '1200px'; // Fixed width for consistent rendering
  container.style.backgroundColor = 'white';
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
          
          // Ensure all styles are preserved
          const allElements = clone.querySelectorAll('*');
          allElements.forEach((el, index) => {
            const originalEl = sourceEl.querySelectorAll('*')[index];
            if (originalEl) {
              const computedStyle = window.getComputedStyle(originalEl);
              (el as HTMLElement).style.cssText = computedStyle.cssText;
            }
          });
          
          ref.current.appendChild(clone);
          (window as any).__PDF_CLONE_READY = true;
        }
      }
    }, []);

    return <div ref={ref} style={{ width: '1200px', backgroundColor: 'white' }} />;
  };

  captureRoot = createRoot(container);
  captureRoot.render(<DashboardClone />);

  // Wait for the clone to signal readiness
  await new Promise<void>(resolve => {
    const checkReady = () => {
      if ((window as any).__PDF_CLONE_READY) {
        (window as any).__PDF_CLONE_READY = false;
        resolve();
      } else {
        setTimeout(checkReady, 100);
      }
    };
    checkReady();
  });
  return container;
}

/**
 * Expand all MUI Collapse/Accordion components within the cloned container.
 */
export function expandAllCollapsibles(container: HTMLElement): void {
  const details = Array.from(container.querySelectorAll<HTMLElement>('.MuiAccordionDetails-root'));
  details.forEach(el => {
    el.style.display = 'block';
    el.style.height = 'auto';
    el.style.maxHeight = 'none';
    el.style.visibility = 'visible';
    el.style.opacity = '1';
  });

  const wrappers = Array.from(container.querySelectorAll<HTMLElement>('.MuiCollapse-wrapper, .MuiCollapse-container'));
  wrappers.forEach(el => {
    el.style.height = 'auto';
    el.style.maxHeight = 'none';
    el.style.overflow = 'visible';
    el.style.visibility = 'visible';
    el.style.opacity = '1';
  });

  const summaries = Array.from(container.querySelectorAll<HTMLElement>('.MuiAccordionSummary-root'));
  summaries.forEach(el => {
    el.setAttribute('aria-expanded', 'true');
  });

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
  
  // Find the tabs container - try multiple selectors
  const tabsContainer = container.querySelector('[role="tablist"]') || 
                       container.querySelector('.MuiTabs-root') ||
                       container.querySelector('[class*="tab"]') ||
                       container;

  for (let i = 0; i < tabIds.length; i++) {
    const tabId = tabIds[i];
    
    // Try multiple ways to find and activate the tab
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
      // Simulate tab activation
      tabButton.click();
      tabButton.setAttribute('aria-selected', 'true');
      tabButton.classList.add('active', 'selected');
      
      // Wait for tab content to render
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Expand all collapsibles in the current view
    expandAllCollapsibles(container);
    
    // Find the tab panel content
    let panel = container.querySelector(`[data-tab-panel-id="${tabId}"]`) as HTMLElement;
    if (!panel) {
      panel = container.querySelector(`[id*="${tabId}"]`) as HTMLElement;
    }
    if (!panel) {
      panel = container.querySelector('[role="tabpanel"]:not([hidden])') as HTMLElement;
    }
    if (!panel) {
      // Fallback to the entire visible content area
      panel = container.querySelector('.MuiTabPanel-root') as HTMLElement || container;
    }

    try {
      // Ensure the panel is visible and has content
      if (panel) {
        panel.style.display = 'block';
        panel.style.visibility = 'visible';
        panel.style.opacity = '1';
        
        // Wait a bit more for rendering
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const canvas = await html2canvas(panel, { 
          scale: options?.scale ?? 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 1200,
          height: Math.max(panel.scrollHeight, 800)
        });
        images.push(canvas.toDataURL('image/png'));
      }
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
  }
  
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
