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
 * Activate a specific tab in the live dashboard
 */
async function activateTab(tabId: string): Promise<boolean> {
  console.log(`Attempting to activate tab: ${tabId}`);
  
  // Try multiple selectors to find the tab button
  const selectors = [
    `[data-tab-id="${tabId}"]`,
    `[value="${tabId}"]`,
    `[data-value="${tabId}"]`,
    `[aria-controls="${tabId}"]`,
    `button[role="tab"][aria-controls*="${tabId}"]`,
    `.MuiTab-root[data-testid*="${tabId}"]`,
    `button:has-text("${tabId}")` // This won't work but shows intent
  ];
  
  let tabButton: HTMLElement | null = null;
  
  for (const selector of selectors) {
    try {
      tabButton = document.querySelector(selector) as HTMLElement;
      if (tabButton) {
        console.log(`Found tab button with selector: ${selector}`);
        break;
      }
    } catch (e) {
      // Selector might not be valid, continue
    }
  }
  
  // If we can't find by specific selectors, try to find by text content
  if (!tabButton) {
    const allTabs = document.querySelectorAll('[role="tab"], .MuiTab-root, button[class*="tab"]');
    for (const tab of allTabs) {
      const text = tab.textContent?.toLowerCase().trim();
      if (text && (text.includes(tabId.toLowerCase()) || tabId.toLowerCase().includes(text))) {
        tabButton = tab as HTMLElement;
        console.log(`Found tab button by text content: ${text}`);
        break;
      }
    }
  }
  
  if (tabButton) {
    // Scroll into view
    tabButton.scrollIntoView({ behavior: 'instant', block: 'center' });
    
    // Multiple ways to trigger the tab
    tabButton.focus();
    
    // Dispatch mouse events
    const mouseEvents = ['mousedown', 'click', 'mouseup'];
    mouseEvents.forEach(eventType => {
      const event = new MouseEvent(eventType, {
        bubbles: true,
        cancelable: true,
        view: window
      });
      tabButton!.dispatchEvent(event);
    });
    
    // Dispatch keyboard event (Enter key)
    const keyEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Enter',
      code: 'Enter'
    });
    tabButton.dispatchEvent(keyEvent);
    
    // If it's a React component, try to trigger change events
    const changeEvent = new Event('change', { bubbles: true });
    tabButton.dispatchEvent(changeEvent);
    
    // Wait for the tab to activate and content to render
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Tab ${tabId} activation attempted`);
    return true;
  }
  
  console.warn(`Could not find tab button for: ${tabId}`);
  return false;
}

/**
 * Clone the current state of the dashboard
 */
export async function cloneDashboardState(): Promise<HTMLElement> {
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
    container.style.backgroundColor = '#1a1a1a';
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
          
          // Expand all collapsibles
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

  // Wait for React to render
  await new Promise(resolve => setTimeout(resolve, 1500));
  return container;
}

/**
 * Legacy function - now just calls cloneDashboardState
 */
export async function cloneDashboard(): Promise<HTMLElement> {
  return cloneDashboardState();
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
 * New approach: Activate each tab in the live dashboard, then capture the entire dashboard
 */
export async function captureTabImages(
  container: HTMLElement, // This parameter is now ignored - we'll capture from live dashboard
  tabIds: string[],
  options?: { scale?: number }
): Promise<string[]> {
  const images: string[] = [];
  
  console.log('Starting tab capture process...');
  
  for (const tabId of tabIds) {
    try {
      console.log(`\n--- Capturing tab: ${tabId} ---`);
      
      // Step 1: Activate the tab in the live dashboard
      const activated = await activateTab(tabId);
      
      if (!activated) {
        console.warn(`Failed to activate tab ${tabId}, capturing current state anyway`);
      }
      
      // Step 2: Wait for content to fully load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 3: Clone the current dashboard state
      const currentState = await cloneDashboardState();
      
      try {
        // Step 4: Capture the cloned state
        const canvas = await html2canvas(currentState, { 
          scale: options?.scale ?? 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: currentState.style.backgroundColor || '#1a1a1a',
          width: 1200,
          height: Math.max(currentState.scrollHeight, 800),
          logging: false,
          onclone: (clonedDoc) => {
            // Final cleanup of cloned document
            const allElements = clonedDoc.querySelectorAll('*');
            allElements.forEach(el => {
              const element = el as HTMLElement;
              if (element.style.display === 'none' && !element.closest('[hidden]')) {
                element.style.display = 'block';
              }
            });
          }
        });
        
        images.push(canvas.toDataURL('image/png'));
        console.log(`Successfully captured tab: ${tabId}`);
        
      } catch (error) {
        console.error(`Failed to capture tab ${tabId}:`, error);
        
        // Create error placeholder
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ffffff';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`Failed to capture ${tabId} tab`, canvas.width / 2, canvas.height / 2);
        }
        images.push(canvas.toDataURL('image/png'));
      }
      
      // Step 5: Clean up the temporary clone
      await cleanupCapture(currentState);
      
    } catch (error) {
      console.error(`Error processing tab ${tabId}:`, error);
      
      // Create error placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Error capturing ${tabId} tab`, canvas.width / 2, canvas.height / 2);
      }
      images.push(canvas.toDataURL('image/png'));
    }
  }
  
  console.log(`\nCapture process completed. Generated ${images.length} images.`);
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
