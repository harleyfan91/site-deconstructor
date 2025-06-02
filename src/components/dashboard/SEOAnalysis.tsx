
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { AnalysisResponse } from '@/hooks/useAnalysisApi';

interface SEOAnalysisProps {
  data: AnalysisResponse;
}

const SEOAnalysis: React.FC<SEOAnalysisProps> = ({ data }) => {
  const { seo } = data.data;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High Priority</Badge>;
      case 'medium': return <Badge variant="secondary">Medium Priority</Badge>;
      case 'low': return <Badge variant="outline">Low Priority</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* SEO Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${getStatusColor(seo.score >= 80 ? 'good' : seo.score >= 60 ? 'warning' : 'error')}`}>
              {seo.score}
            </div>
            <Progress value={seo.score} className="mb-4" />
            <p className="text-sm text-muted-foreground">
              Overall SEO health based on best practices and technical factors
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SEO Checks */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Health Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {seo.checks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <h3 className="font-medium">{check.name}</h3>
                    <p className="text-sm text-muted-foreground">{check.description}</p>
                  </div>
                </div>
                <Badge variant={check.status === 'good' ? 'default' : check.status === 'warning' ? 'secondary' : 'destructive'}>
                  {check.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SEO Recommendations */}
      {seo.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>SEO Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {seo.recommendations.map((rec, index) => (
                <Alert key={index}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{rec.title}</h4>
                      <AlertDescription className="mt-1">
                        {rec.description}
                      </AlertDescription>
                    </div>
                    <div className="ml-4">
                      {getPriorityBadge(rec.priority)}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SEOAnalysis;
