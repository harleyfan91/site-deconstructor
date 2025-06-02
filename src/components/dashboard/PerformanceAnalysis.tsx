
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { AnalysisResponse } from '@/hooks/useAnalysisApi';

interface PerformanceAnalysisProps {
  data: AnalysisResponse;
}

const PerformanceAnalysis: React.FC<PerformanceAnalysisProps> = ({ data }) => {
  const { performance } = data.data;

  const getVitalStatus = (value: number, benchmark: number) => {
    if (value <= benchmark) return 'good';
    if (value <= benchmark * 1.5) return 'needs-improvement';
    return 'poor';
  };

  const getVitalColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {performance.performanceScore}
            </div>
            <Progress value={performance.performanceScore} className="mb-4" />
            <p className="text-sm text-muted-foreground">
              Overall performance rating based on Core Web Vitals and load metrics
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Core Web Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performance.coreWebVitals.map((vital, index) => {
              const status = getVitalStatus(vital.value, vital.benchmark);
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{vital.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Benchmark: {vital.benchmark}{vital.name.includes('Paint') || vital.name.includes('Delay') ? 'ms' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${getVitalColor(status)}`}>
                      {vital.value}{vital.name.includes('Paint') || vital.name.includes('Delay') ? 'ms' : ''}
                    </div>
                    <Badge variant={status === 'good' ? 'default' : status === 'needs-improvement' ? 'secondary' : 'destructive'}>
                      {status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {performance.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performance.recommendations.map((rec, index) => (
                <Alert key={index}>
                  <div className="flex items-start gap-2">
                    {getRecommendationIcon(rec.type)}
                    <div>
                      <h4 className="font-medium">{rec.title}</h4>
                      <AlertDescription className="mt-1">
                        {rec.description}
                      </AlertDescription>
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

export default PerformanceAnalysis;
