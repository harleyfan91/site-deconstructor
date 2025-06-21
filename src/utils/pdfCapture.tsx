import React, { useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

let captureRoot: Root | null = null;

/**
 * Deep clone element with all computed styles preserved
 */
function deepCloneWithStyles(sourceElement: Element, targetElement: Element): void {
  const computedStyle = window.getComputedStyle(sourceElement);
  const targetEl = targetElement as HTMLElement;
  
  // Copy all computed styles
  for (let i = 0; i < computedStyle.length; i++) {
    const prop = computedStyle[i];
    const value = computedStyle.getPropertyValue(prop);
    targetEl.style.setProperty(prop, value, computedStyle.getPropertyPriority(prop));
  }
  
  // Handle special attributes
  if (sourceElement.hasAttribute('aria-expanded')) {
    targetElement.setAttribute('aria-expanded', sourceElement.getAttribute('aria-expanded')!);
  }
  if (sourceElement.hasAttribute('aria-selected')) {
    targetElement.setAttribute('aria-selected', sourceElement.getAttribute('aria-selected')!);
  }
  
  // Recursively clone children
  for (let i = 0; i < sourceElement.children.length; i++) {
    if (targetElement.children[i]) {
      deepCloneWithStyles(sourceElement.children[i], targetElement.children[i]);
    }
  }
}

/**
 * Force show all tab panels and their content
 */
function forceShowAllTabContent(container: HTMLElement): void {
  // Show all tab panels
  const tabPanels = container.querySelectorAll<HTMLElement>('[role="tabpanel"], .MuiTabPanel-root, [class*="tabpanel"], [class*="TabPanel"]');
  tabPanels.forEach(panel => {
    panel.style.display = 'block !important';
    panel.style.visibility = 'visible !important';
    panel.style.opacity = '1 !important';
    panel.style.height = 'auto !important';
    panel.style.maxHeight = 'none !important';
    panel.style.overflow = 'visible !important';
    panel.removeAttribute('hidden');
    panel.setAttribute('aria-hidden', 'false');
  });

  // Make sure all tabs appear active for styling purposes
  const tabButtons = container.querySelectorAll<HTMLElement>('[role="tab"], .MuiTab-root, [class*="tab-button"]');
  tabButtons.forEach(tab => {
    tab.setAttribute('aria-selected', 'true');
    tab.classList.add('Mui-selected', 'active', 'selected');
  });
}

/**
 * Clone the dashboard with proper style preservation and theme detection
 */
export async function cloneDashboard(): Promise<HTMLElement> {
  const dashboardEl = document.querySelector('#dashboard-root') as HTMLElement | null;
  if (!dashboardEl) {
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
    if (!mainContent) {
      throw new Error('Dashboard content not found');
    }
  }

  // Detect current theme
  const isDarkTheme = document.documentElement.classList.contains('dark') ||
                     document.body.classList.contains('dark') ||
                     window.getComputedStyle(document.body).backgroundColor.includes('rgb(0, 0, 0)') ||
                     window.getComputedStyle(document.body).backgroundColor.includes('rgb(33, 33, 33)') ||
                     window.getComputedStyle(document.documentElement).colorScheme === 'dark';

  const container = document.createElement('div');
  container.id = 'pdf-capture-container';
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '1200px';
  container.style.minHeight = '100vh';
  
  // Preserve theme
  if (isDarkTheme) {
    container.style.backgroundColor = '#1a1a1a'; // Dark background
    container.style.color = '#ffffff';
    container.classList.add('dark');
  } else {
    container.style.backgroundColor = '#ffffff';
    container.style.color = '#000000';
  }
  
  document.body.appendChild(container);

  const DashboardClone = () => {
    const ref = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      if (ref.current) {
        const sourceEl = document.querySelector('#dashboard-root') || 
                         document.querySelector('[data-dashboard]') ||
                         document.querySelector('main') ||
                         document.querySelector('.dashboard-content') ||
                         document.body;
        
        if (sourceEl) {
          const clone = sourceEl.cloneNode(true) as HTMLElement;
          
          // Copy theme classes to clone
          if (isDarkTheme) {
            clone.classList.add('dark');
            clone.style.backgroundColor = '#1a1a1a';
            clone.style.color = '#ffffff';
          }
          
          // Deep clone with styles
          deepCloneWithStyles(sourceEl, clone);
          
          // Force show all content
          forceShowAllTabContent(clone);
          expandAllCollapsibles(clone);
          
          ref.current.appendChild(clone);
        }
      }
    }, []);

    const containerStyle: React.CSSProperties = {
      width: '1200px',
      minHeight: '100vh',
      backgroundColor: isDarkTheme ? '#1a1a1a' : '#ffffff',
      color: isDarkTheme ? '#ffffff' : '#000000'
    };

    if (isDarkTheme) {
      containerStyle.colorScheme = 'dark';
    }

    return <div ref={ref} style={containerStyle} className={isDarkTheme ? 'dark' : ''} />;
  };

  captureRoot = createRoot(container);
  captureRoot.render(<DashboardClone />);

  // Wait longer for React to render and all dynamic content to load
  await new Promise(resolve => setTimeout(resolve, 2000));
  return container;
}

/**
 * Enhanced expand all collapsibles function
 */
export function expandAllCollapsibles(container: HTMLElement): void {
  // Expand MUI Collapse components
  const collapses = Array.from(container.querySelectorAll<HTMLElement>(
    '.MuiCollapse-root, [class*="collapse"], .MuiCollapse-wrapper, .MuiCollapse-wrapperInner'
  ));
  collapses.forEach(el => {
    el.style.height = 'auto !important';
    el.style.maxHeight = 'none !important';
    el.style.visibility = 'visible !important';
    el.style.opacity = '1 !important';
    el.style.overflow = 'visible !important';
    el.style.display = 'block !important';
    el.classList.add('MuiCollapse-entered');
    el.classList.remove('MuiCollapse-hidden', 'MuiCollapse-hiddenStart', 'MuiCollapse-hiddenSize');
  });

  // Expand MUI Accordions
  const accordions = Array.from(container.querySelectorAll<HTMLElement>(
    '.MuiAccordion-root, [class*="accordion"], .MuiExpansionPanel-root'
  ));
  accordions.forEach(acc => {
    acc.classList.add('Mui-expanded');
    acc.setAttribute('aria-expanded', 'true');
    
    const summary = acc.querySelector<HTMLElement>(
      '.MuiAccordionSummary-root, .MuiExpansionPanelSummary-root, [class*="summary"]'
    );
    if (summary) {
      summary.setAttribute('aria-expanded', 'true');
      summary.classList.add('Mui-expanded');
    }
    
    const details = acc.querySelector<HTMLElement>(
      '.MuiAccordionDetails-root, .MuiExpansionPanelDetails-root, .MuiCollapse-root, [class*="details"]'
    );
    if (details) {
      details.style.height = 'auto !important';
      details.style.maxHeight = 'none !important';
      details.style.visibility = 'visible !important';
      details.style.opacity = '1 !important';
      details.style.display = 'block !important';
      details.style.overflow = 'visible !important';
      details.classList.add('MuiCollapse-entered');
      details.removeAttribute('hidden');
    }
  });

  // Show all hidden elements
  const hiddenElements = Array.from(container.querySelectorAll<HTMLElement>(
    '[style*="display: none"], [style*="display:none"], [hidden], [aria-hidden="true"]'
  ));
  hiddenElements.forEach(el => {
    el.style.display = 'block !important';
    el.style.visibility = 'visible !important';
    el.style.opacity = '1 !important';
    el.removeAttribute('hidden');
    el.setAttribute('aria-hidden', 'false');
  });

  // Force show any elements with zero height/width
  const collapsedElements = Array.from(container.querySelectorAll<HTMLElement>('*')).filter(el => {
    const style = window.getComputedStyle(el);
    return style.height === '0px' || style.maxHeight === '0px';
  });
  collapsedElements.forEach(el => {
    el.style.height = 'auto !important';
    el.style.maxHeight = 'none !important';
    el.style.minHeight = 'auto !important';
  });
}

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
 * Enhanced tab capture that properly handles all tab content
 */
export async function captureTabImages(
  container: HTMLElement,
  tabIds: string[],
  options?: { scale?: number }
): Promise<string[]> {
  const images: string[] = [];
  
  // Since we've already forced all tab content to be visible,
  // we can capture each tab panel directly
  for (const tabId of tabIds) {
    try {
      // Find the specific tab panel for this tab
      let panel = container.querySelector(`[data-tab-panel-id="${tabId}"]`) as HTMLElement;
      if (!panel) {
        panel = container.querySelector(`[id*="${tabId}"][role="tabpanel"]`) as HTMLElement;
      }
      if (!panel) {
        panel = container.querySelector(`[aria-labelledby*="${tabId}"]`) as HTMLElement;
      }
      if (!panel) {
        // Try to find by matching tab button and then finding associated panel
        const tabButton = container.querySelector(`[data-tab-id="${tabId}"], [value="${tabId}"], [data-value="${tabId}"]`);
        if (tabButton) {
          const controls = tabButton.getAttribute('aria-controls');
          if (controls) {
            panel = container.querySelector(`#${controls}`) as HTMLElement;
          }
        }
      }
      
      // If we still can't find a specific panel, capture the entire visible content
      if (!panel) {
        console.warn(`Could not find specific panel for tab ${tabId}, capturing full content`);
        panel = container;
      }

      // Ensure the panel and all its content is visible
      if (panel) {
        panel.style.display = 'block !important';
        panel.style.visibility = 'visible !important';
        panel.style.opacity = '1 !important';
        panel.style.position = 'relative';
        
        // Expand any remaining collapsibles in this panel
        expandAllCollapsibles(panel);
        
        // Wait for any dynamic content to render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the computed background color for proper theme handling
        const computedStyle = window.getComputedStyle(panel);
        const backgroundColor = computedStyle.backgroundColor || 
                              (container.classList.contains('dark') ? '#1a1a1a' : '#ffffff');
        
        const canvas = await html2canvas(panel, { 
          scale: options?.scale ?? 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: backgroundColor,
          width: 1200,
          height: Math.max(panel.scrollHeight, 800),
          ignoreElements: (element) => {
            // Skip elements that are explicitly hidden
            const style = window.getComputedStyle(element);
            return style.display === 'none' && !element.closest('[role="tabpanel"]');
          }
        });
        images.push(canvas.toDataURL('image/png'));
      }
    } catch (error) {
      console.error(`Failed to capture tab ${tabId}:`, error);
      // Create a themed placeholder image if capture fails
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const isDark = container.classList.contains('dark');
        ctx.fillStyle = isDark ? '#1a1a1a' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = isDark ? '#ffffff' : '#333333';
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
          pdf = new jsPDF({ 
            orientation, 
            unit: 'pt', 
            format: [width, height],
            compress: options?.resolution === 'standard'
          });
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
