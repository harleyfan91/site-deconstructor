// Utility function for smooth scrolling to sections
export const smoothScrollToSection = (sectionId: string) => {
  console.log('Attempting to scroll to section:', sectionId);
  
  const element = document.getElementById(sectionId);
  console.log('Found element:', element);
  
  if (element) {
    const headerHeight = 80; // Account for fixed AppBar height with some padding
    const elementPosition = element.offsetTop - headerHeight;
    
    console.log('Scrolling to position:', elementPosition);
    
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  } else {
    console.error(`Element with id "${sectionId}" not found`);
  }
};

// New function to handle cross-page navigation and scrolling
export const navigateAndScroll = (sectionId: string, navigate: (path: string) => void, currentPath: string) => {
  console.log('Navigate and scroll to:', sectionId, 'from path:', currentPath);
  
  // If we're already on the landing page, just scroll
  if (currentPath === '/') {
    smoothScrollToSection(sectionId);
    return;
  }
  
  // Otherwise, navigate to landing page first, then scroll after a delay
  navigate('/');
  setTimeout(() => {
    smoothScrollToSection(sectionId);
  }, 100); // Small delay to ensure page has loaded
};
