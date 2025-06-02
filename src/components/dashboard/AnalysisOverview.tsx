
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Globe, Zap, Users } from 'lucide-react';
import { AnalysisResponse } from '@/hooks/useAnalysisApi';

interface AnalysisOverviewProps {
  data: AnalysisResponse;
}

const AnalysisOverview: React.FC<AnalysisOverviewProps> = ({ data }) => {
  const { overview } = data.data;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Website Analysis Overview
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Analysis for: {data.url}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(overview.overallScore)}`}>
                {overview.overallScore}
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
              <Progress value={overview.overallScore} className="mt-2" />
            </div>

            {/* SEO Score */}
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(overview.seoScore)}`}>
                {overview.seoScore}
              </div>
              <div className="text-sm text-muted-foreground">SEO Score</div>
              <Progress value={overview.seoScore} className="mt-2" />
            </div>

            {/* UX Score */}
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(overview.userExperienceScore)}`}>
                {overview.userExperienceScore}
              </div>
              <div className="text-sm text-muted-foreground">UX Score</div>
              <Progress value={overview.userExperienceScore} className="mt-2" />
            </div>

            {/* Load Time */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {overview.pageLoadTime}
              </div>
              <div className="text-sm text-muted-foreground">Load Time</div>
              <div className="mt-2 flex justify-center">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Health Grade</p>
                <p className="text-2xl font-bold">{data.data.technical.healthGrade}</p>
              </div>
              <Badge variant={getScoreBadgeVariant(overview.overallScore)}>
                {data.data.technical.healthGrade}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Performance</p>
                <p className="text-2xl font-bold">{data.data.performance.performanceScore}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tech Stack</p>
                <p className="text-2xl font-bold">{data.data.technical.techStack.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalysisOverview;
