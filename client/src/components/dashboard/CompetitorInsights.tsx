import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Alert,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  TrendingUp, 
  Search, 
  Plus, 
  X, 
  BarChart3, 
  Globe,
  Users,
  Timer,
  Shield,
  Zap
} from 'lucide-react';

interface CompetitorData {
  url: string;
  loading: boolean;
  data?: {
    seoScore: number;
    performanceScore: number;
    techStack: string[];
    loadTime: number;
    trackingPixels: number;
    securityScore: number;
  };
  error?: string;
}

interface CompetitorInsightsProps {
  currentWebsite?: {
    url: string;
    seoScore: number;
    performanceScore: number;
    techStack: string[];
    loadTime: number;
    trackingPixels: number;
    securityScore: number;
  };
}

const CompetitorInsights: React.FC<CompetitorInsightsProps> = ({ currentWebsite }) => {
  const theme = useTheme();
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [newCompetitorUrl, setNewCompetitorUrl] = useState('');

  const analyzeCompetitor = async (url: string) => {
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Add competitor with loading state
    const newCompetitor: CompetitorData = {
      url: normalizedUrl,
      loading: true
    };
    
    setCompetitors(prev => [...prev, newCompetitor]);
    setNewCompetitorUrl('');

    try {
      // Call our existing analysis endpoint
      const response = await fetch(`/api/overview?url=${encodeURIComponent(normalizedUrl)}`);
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const analysisData = await response.json();
      
      // Extract relevant metrics for comparison
      const competitorData = {
        seoScore: analysisData.seo?.score || 0,
        performanceScore: analysisData.performance?.overallScore || 0,
        techStack: analysisData.tech?.techStack?.map((t: any) => t.technology) || [],
        loadTime: analysisData.performance?.pageLoadTime || 0,
        trackingPixels: Object.values(analysisData.tech?.adTags || {}).filter(Boolean).length,
        securityScore: analysisData.tech?.securityHeaders ? 
          Object.values(analysisData.tech.securityHeaders).filter(h => h !== 'Not Set').length * 20 : 0
      };

      // Update competitor with data
      setCompetitors(prev => prev.map(comp => 
        comp.url === normalizedUrl 
          ? { ...comp, loading: false, data: competitorData }
          : comp
      ));
    } catch (error) {
      // Update competitor with error
      setCompetitors(prev => prev.map(comp => 
        comp.url === normalizedUrl 
          ? { ...comp, loading: false, error: 'Analysis failed' }
          : comp
      ));
    }
  };

  const removeCompetitor = (url: string) => {
    setCompetitors(prev => prev.filter(comp => comp.url !== url));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getComparison = (current?: number, competitor?: number) => {
    if (!current || !competitor) return { text: '-', color: theme.palette.text.secondary };
    
    const diff = competitor - current;
    if (Math.abs(diff) < 5) return { text: '≈', color: theme.palette.text.secondary };
    if (diff > 0) return { text: `+${diff.toFixed(0)}`, color: theme.palette.success.main };
    return { text: diff.toFixed(0), color: theme.palette.error.main };
  };

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TrendingUp size={24} color={theme.palette.primary.main} style={{ marginRight: 8 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              flexGrow: 1
            }}
          >
            Competitor Insights
          </Typography>
        </Box>

        {/* Add Competitor Input */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <TextField
            size="small"
            placeholder="Enter competitor URL (e.g. example.com)"
            value={newCompetitorUrl}
            onChange={(e) => setNewCompetitorUrl(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newCompetitorUrl.trim()) {
                analyzeCompetitor(newCompetitorUrl.trim());
              }
            }}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<Plus size={16} />}
            onClick={() => newCompetitorUrl.trim() && analyzeCompetitor(newCompetitorUrl.trim())}
            disabled={!newCompetitorUrl.trim()}
          >
            Analyze
          </Button>
        </Box>

        {/* Current Website Header */}
        {currentWebsite && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              Current Website: {new URL(currentWebsite.url).hostname}
            </Typography>
          </Box>
        )}

        {/* No Competitors Message */}
        {competitors.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Add competitor URLs to compare key metrics side-by-side
          </Alert>
        )}

        {/* Competitors List */}
        {competitors.map((competitor, index) => (
          <Card key={competitor.url} variant="outlined" sx={{ mb: 2, position: 'relative' }}>
            <CardContent sx={{ p: 2 }}>
              {/* Remove Button */}
              <IconButton
                size="small"
                onClick={() => removeCompetitor(competitor.url)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <X size={16} />
              </IconButton>

              {/* Competitor Header */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, pr: 4 }}>
                {new URL(competitor.url).hostname}
              </Typography>

              {/* Loading State */}
              {competitor.loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                  <CircularProgress size={20} sx={{ mr: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Analyzing competitor...
                  </Typography>
                </Box>
              )}

              {/* Error State */}
              {competitor.error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {competitor.error}
                </Alert>
              )}

              {/* Competitor Data */}
              {competitor.data && (
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <Search size={16} color={theme.palette.primary.main} style={{ marginRight: 4 }} />
                        <Typography variant="caption" color="text.secondary">SEO</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ color: getScoreColor(competitor.data.seoScore) }}>
                        {competitor.data.seoScore}
                      </Typography>
                      {currentWebsite && (
                        <Typography 
                          variant="caption" 
                          sx={{ color: getComparison(currentWebsite.seoScore, competitor.data.seoScore).color }}
                        >
                          {getComparison(currentWebsite.seoScore, competitor.data.seoScore).text}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <Timer size={16} color={theme.palette.primary.main} style={{ marginRight: 4 }} />
                        <Typography variant="caption" color="text.secondary">Speed</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ color: getScoreColor(competitor.data.performanceScore) }}>
                        {competitor.data.performanceScore}
                      </Typography>
                      {currentWebsite && (
                        <Typography 
                          variant="caption" 
                          sx={{ color: getComparison(currentWebsite.performanceScore, competitor.data.performanceScore).color }}
                        >
                          {getComparison(currentWebsite.performanceScore, competitor.data.performanceScore).text}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <Shield size={16} color={theme.palette.primary.main} style={{ marginRight: 4 }} />
                        <Typography variant="caption" color="text.secondary">Security</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ color: getScoreColor(competitor.data.securityScore) }}>
                        {competitor.data.securityScore}
                      </Typography>
                      {currentWebsite && (
                        <Typography 
                          variant="caption" 
                          sx={{ color: getComparison(currentWebsite.securityScore, competitor.data.securityScore).color }}
                        >
                          {getComparison(currentWebsite.securityScore, competitor.data.securityScore).text}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <Globe size={16} color={theme.palette.primary.main} style={{ marginRight: 4 }} />
                        <Typography variant="caption" color="text.secondary">Load Time</Typography>
                      </Box>
                      <Typography variant="body2">
                        {competitor.data.loadTime > 0 ? `${competitor.data.loadTime}ms` : 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <Zap size={16} color={theme.palette.primary.main} style={{ marginRight: 4 }} />
                        <Typography variant="caption" color="text.secondary">Tracking</Typography>
                      </Box>
                      <Typography variant="body2">
                        {competitor.data.trackingPixels} pixels
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <BarChart3 size={16} color={theme.palette.primary.main} style={{ marginRight: 4 }} />
                        <Typography variant="caption" color="text.secondary">Tech Stack</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                        {competitor.data.techStack.slice(0, 3).map((tech, techIndex) => (
                          <Chip
                            key={techIndex}
                            label={tech}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        ))}
                        {competitor.data.techStack.length > 3 && (
                          <Chip
                            label={`+${competitor.data.techStack.length - 3}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default CompetitorInsights;