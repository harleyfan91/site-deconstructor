import React from 'react';
import { Box, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Share2 } from 'lucide-react';
import TwitterPreview from '../social/TwitterPreview';
import FacebookPreview from '../social/FacebookPreview';
import InstagramPreview from '../social/InstagramPreview';

interface SocialPreviewAuditProps {
  seoData: any;
  loading: boolean;
  url?: string;
}

const SocialPreviewAudit: React.FC<SocialPreviewAuditProps> = ({ seoData, loading, url }) => {
  const theme = useTheme();

  const extractDomain = (url?: string) => {
    if (!url) return 'example.com';
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    } catch {
      return 'example.com';
    }
  };

  const domain = extractDomain(url);

  // Extract meta tags for social previews
  const metaTags = seoData?.metaTags || {};
  
  // Twitter data
  const twitterTitle = metaTags['twitter:title'] || metaTags['og:title'] || metaTags['title'] || 'Page Title';
  const twitterDescription = metaTags['twitter:description'] || metaTags['og:description'] || metaTags['description'] || 'Page description will appear here';
  const twitterImage = metaTags['twitter:image'] || metaTags['og:image'];

  // Facebook/OpenGraph data
  const ogTitle = metaTags['og:title'] || metaTags['title'] || 'Page Title';
  const ogDescription = metaTags['og:description'] || metaTags['description'] || 'Page description will appear here';
  const ogImage = metaTags['og:image'];

  return (
    <Card variant="subtle" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Share2 size={24} style={{ marginRight: 8, color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Social Preview Audit
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={32} sx={{ mr: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Loading social previews...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Platform Labels and Previews */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.primary.main }}>
                Twitter (X) Summary Large Image
              </Typography>
              <TwitterPreview
                title={twitterTitle}
                description={twitterDescription}
                image={twitterImage}
                domain={domain}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.primary.main }}>
                Facebook / LinkedIn OpenGraph
              </Typography>
              <FacebookPreview
                title={ogTitle}
                description={ogDescription}
                image={ogImage}
                domain={domain}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.primary.main }}>
                Instagram Stories
              </Typography>
              <InstagramPreview
                title={ogTitle}
                description={ogDescription}
                image={ogImage}
                domain={domain}
              />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialPreviewAudit;