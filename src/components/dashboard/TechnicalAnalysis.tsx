
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Code, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { AnalysisResponse } from '@/hooks/useAnalysisApi';

interface TechnicalAnalysisProps {
  data: AnalysisResponse;
}

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ data }) => {
  const { technical } = data.data;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge variant="secondary">Medium</Badge>;
      case 'low': return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getHealthGradeColor = (grade: string) => {
    if (grade.includes('A')) return 'text-green-600';
    if (grade.includes('B')) return 'text-blue-600';
    if (grade.includes('C')) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Health Grade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Technical Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${getHealthGradeColor(technical.healthGrade)}`}>
              {technical.healthGrade}
            </div>
            <p className="text-sm text-muted-foreground">
              Overall technical health grade based on best practices and issues
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technical.techStack.map((tech, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium">{tech.technology}</h3>
                  <p className="text-sm text-muted-foreground">{tech.category}</p>
                </div>
                <Badge variant="outline">{tech.category}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Issues */}
      {technical.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Technical Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {technical.issues.map((issue, index) => (
                <Alert key={index}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <h4 className="font-medium">{issue.type}</h4>
                        <AlertDescription className="mt-1">
                          {issue.description}
                        </AlertDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {issue.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {getSeverityBadge(issue.severity)}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {technical.techStack.length}
              </div>
              <p className="text-sm text-muted-foreground">Technologies Detected</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {technical.issues.length}
              </div>
              <p className="text-sm text-muted-foreground">Issues Found</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthGradeColor(technical.healthGrade)}`}>
                {technical.healthGrade}
              </div>
              <p className="text-sm text-muted-foreground">Health Grade</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TechnicalAnalysis;
