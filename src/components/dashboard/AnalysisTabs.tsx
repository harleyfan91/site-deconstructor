
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Search, Palette, Code, Zap } from 'lucide-react';
import { AnalysisResponse } from '@/hooks/useAnalysisApi';
import AnalysisOverview from './AnalysisOverview';
import PerformanceAnalysis from './PerformanceAnalysis';
import SEOAnalysis from './SEOAnalysis';
import UIAnalysis from './UIAnalysis';
import TechnicalAnalysis from './TechnicalAnalysis';

interface AnalysisTabsProps {
  data: AnalysisResponse;
}

const AnalysisTabs: React.FC<AnalysisTabsProps> = ({ data }) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="performance" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Performance
        </TabsTrigger>
        <TabsTrigger value="seo" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          SEO
        </TabsTrigger>
        <TabsTrigger value="ui" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          UI/Design
        </TabsTrigger>
        <TabsTrigger value="technical" className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          Technical
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <AnalysisOverview data={data} />
      </TabsContent>

      <TabsContent value="performance" className="mt-6">
        <PerformanceAnalysis data={data} />
      </TabsContent>

      <TabsContent value="seo" className="mt-6">
        <SEOAnalysis data={data} />
      </TabsContent>

      <TabsContent value="ui" className="mt-6">
        <UIAnalysis data={data} />
      </TabsContent>

      <TabsContent value="technical" className="mt-6">
        <TechnicalAnalysis data={data} />
      </TabsContent>
    </Tabs>
  );
};

export default AnalysisTabs;
