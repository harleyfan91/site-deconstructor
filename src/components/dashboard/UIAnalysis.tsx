
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Type, Image } from 'lucide-react';
import { AnalysisResponse } from '@/hooks/useAnalysisApi';

interface UIAnalysisProps {
  data: AnalysisResponse;
}

const UIAnalysis: React.FC<UIAnalysisProps> = ({ data }) => {
  const { ui } = data.data;

  return (
    <div className="space-y-6">
      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Palette
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ui.colors.map((color, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="flex-1">
                  <h3 className="font-medium">{color.name}</h3>
                  <p className="text-sm text-muted-foreground">{color.hex}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {color.usage}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ui.fonts.map((font, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium" style={{ fontFamily: font.name }}>
                    {font.name}
                  </h3>
                  <Badge variant="outline">{font.weight}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{font.category}</p>
                <Badge variant="secondary" className="text-xs">
                  {font.usage}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Images Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Images Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ui.images.map((imageType, index) => (
              <div key={index} className="p-4 border rounded-lg text-center">
                <h3 className="font-medium mb-2">{imageType.type}</h3>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {imageType.count}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {imageType.format}
                </p>
                <Badge variant="outline">{imageType.totalSize}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UIAnalysis;
