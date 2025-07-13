/**
 * Alt text statistics helper
 * Analyzes images for accessibility compliance
 */

interface AltStats {
  totalImages: number;
  withAlt: number;
  suspectAlt: number;
}

/**
 * List of generic/suspect alt text values that are not meaningful
 */
const SUSPECT_ALT_TEXT = [
  'image',
  'img',
  'picture',
  'photo',
  'icon',
  'logo',
  'banner',
  'graphic',
  'placeholder',
  'untitled',
  'spacer',
  'blank',
  '',
  ' ',
  'alt',
  'alt text',
  'description',
  'click here',
  'read more',
  'more info',
  'info',
  'here',
  'link',
  'button'
];

/**
 * Check if alt text is suspect (generic or non-descriptive)
 * @param altText The alt text to check
 * @returns True if the alt text is suspect
 */
function isSuspectAltText(altText: string): boolean {
  if (!altText) return false;
  
  const normalized = altText.toLowerCase().trim();
  
  // Check if it's in our list of suspect terms
  if (SUSPECT_ALT_TEXT.includes(normalized)) {
    return true;
  }
  
  // Check for very short alt text (less than 3 characters)
  if (normalized.length < 3) {
    return true;
  }
  
  // Check for alt text that's just numbers or single characters
  if (/^[0-9\s]+$/.test(normalized) || /^[a-z]\s*$/.test(normalized)) {
    return true;
  }
  
  // Check for filename-like patterns
  if (normalized.match(/\.(jpg|jpeg|png|gif|svg|webp|bmp)$/)) {
    return true;
  }
  
  return false;
}

/**
 * Analyze alt text statistics from a list of image elements
 * @param images Array of image data objects
 * @returns Statistics about alt text usage
 */
export function getAltStats(images: Array<{ alt?: string; src?: string }>): AltStats {
  const totalImages = images.length;
  let withAlt = 0;
  let suspectAlt = 0;
  
  for (const image of images) {
    const altText = image.alt || '';
    const hasAlt = altText.length > 0;
    
    if (hasAlt) {
      withAlt++;
      
      if (isSuspectAltText(altText)) {
        suspectAlt++;
      }
    }
  }
  
  return {
    totalImages,
    withAlt,
    suspectAlt
  };
}

/**
 * Calculate accessibility score based on alt text statistics
 * @param stats Alt text statistics
 * @returns Score from 0-100
 */
export function calculateAltTextScore(stats: AltStats): number {
  if (stats.totalImages === 0) return 100;
  
  // Base score for having alt text
  const altTextRatio = stats.withAlt / stats.totalImages;
  let score = altTextRatio * 100;
  
  // Penalize suspect alt text
  if (stats.withAlt > 0) {
    const suspectRatio = stats.suspectAlt / stats.withAlt;
    score = score * (1 - suspectRatio * 0.5); // Reduce score by up to 50% for suspect alt text
  }
  
  return Math.round(Math.max(0, Math.min(100, score)));
}