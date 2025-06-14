
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
