
// Utility function for smooth scrolling to sections
export const smoothScrollToSection = (sectionId: string, fast: boolean = false) => {
  console.log('Attempting to scroll to section:', sectionId, 'Fast mode:', fast);
  
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

// Enhanced scroll function that handles cross-page navigation
export const scrollToSectionFromAnyPage = (sectionId: string, currentPath: string) => {
  console.log('Cross-page scroll requested for:', sectionId, 'from:', currentPath);
  
  // If we're already on the landing page, just scroll
  if (currentPath === '/') {
    smoothScrollToSection(sectionId);
    return;
  }
  
  // If we're on a different page, navigate to landing page first
  window.location.href = '/';
  
  // Wait for navigation and page load, then scroll with fast animation
  setTimeout(() => {
    smoothScrollToSection(sectionId, true);
  }, 300); // Shorter delay for faster UX
};
