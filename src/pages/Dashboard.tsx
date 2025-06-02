
import React, { useState } from 'react';
import { Container, Paper, Typography, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AppHeader from '../components/AppHeader';
import { useAnalysisApi, AnalysisResponse } from '../hooks/useAnalysisApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Search, Loader2 } from 'lucide-react';
import AnalysisTabs from '../components/dashboard/AnalysisTabs';

interface DashboardProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ darkMode, toggleDarkMode }) => {
  const theme = useTheme();
  const [url, setUrl] = useState('');
  const { analyzeWebsite, loading, error, data } = useAnalysisApi();
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    
    const result = await analyzeWebsite(url.trim());
    if (result) {
      setAnalysisData(result);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.palette.background.default }}>
      <AppHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Website Analysis Dashboard</h1>
          <p className="text-muted-foreground">
            Analyze any website for performance, SEO, design, and technical insights
          </p>
        </div>

        {/* URL Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Website URL Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="url"
                  placeholder="Enter website URL (e.g., https://example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
              </div>
              <Button 
                onClick={handleAnalyze}
                disabled={loading || !url.trim()}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
            
            {error && (
              <Alert severity="error" className="mt-4">
                {error}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisData && (
          <div className="space-y-6">
            {/* Analysis Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Analysis Results</h2>
                <Badge variant="default">
                  {analysisData.status === 'complete' ? 'Complete' : 'Processing'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Analyzed on {new Date(analysisData.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Analysis Tabs */}
            <AnalysisTabs data={analysisData} />
          </div>
        )}

        {/* Empty State */}
        {!analysisData && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
              <p className="text-muted-foreground">
                Enter a website URL above to get started with comprehensive analysis
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
