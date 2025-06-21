import React, { useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import html2canvas from 'html2canvas';

let captureRoot: Root | null = null;

/**
 * Clone the current dashboard DOM tree into an off-screen container.
 * The container is appended to document.body and rendered via React.
 */
export async function cloneDashboard(): Promise<HTMLElement> {
  const dashboardEl = document.querySelector('#dashboard-root') as HTMLElement | null;
  if (!dashboardEl) {
    throw new Error('Dashboard root element not found');
  }

  const container = document.createElement('div');
  container.id = 'pdf-capture-container';
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  document.body.appendChild(container);

  const DashboardClone = () => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (ref.current) {
        const clone = dashboardEl.cloneNode(true) as HTMLElement;
        ref.current.appendChild(clone);
      }
    }, []);

    return <div ref={ref} />;
  };

  captureRoot = createRoot(container);
  captureRoot.render(<DashboardClone />);

  // wait a microtask so React flushes effects
  await Promise.resolve();
  return container;
}

/**
 * Expand all MUI Collapse/Accordion components within the cloned container.
 */
export function expandAllCollapsibles(container: HTMLElement): void {
  const collapses = Array.from(container.querySelectorAll<HTMLElement>('.MuiCollapse-root'));
  collapses.forEach(el => {
    el.style.height = 'auto';
    el.style.visibility = 'visible';
    el.style.opacity = '1';
    el.classList.add('MuiCollapse-entered');
  });

  const accordions = Array.from(container.querySelectorAll<HTMLElement>('.MuiAccordion-root'));
  accordions.forEach(acc => {
    acc.classList.add('Mui-expanded');
    const summary = acc.querySelector<HTMLElement>('.MuiAccordionSummary-root');
    if (summary) summary.setAttribute('aria-expanded', 'true');
    const details = acc.querySelector<HTMLElement>('.MuiCollapse-root');
    if (details) {
      details.style.height = 'auto';
      details.style.visibility = 'visible';
      details.style.opacity = '1';
      details.classList.add('MuiCollapse-entered');
    }
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
  for (const id of tabIds) {
    const tabButton = container.querySelector(`[role="tab"][data-tab-id="${id}"]`) as HTMLElement;
    tabButton.click();
    await Promise.resolve();
    expandAllCollapsibles(container);
    const panel = container.querySelector(`[data-tab-panel-id="${id}"]`) as HTMLElement;
    const canvas = await html2canvas(panel, { scale: options?.scale ?? 2 });
    images.push(canvas.toDataURL('image/png'));
  }
  return images;
}
