
import React from "react";
import { Box, Typography } from "@mui/material";
import type { AnalysisResponse } from "@/types/analysis";

interface PerformanceChartProps {
  performanceData: AnalysisResponse['data']['performance'];
}

// Placeholder: you can later add actual charts/visualizations
const PerformanceChart: React.FC<PerformanceChartProps> = ({ performanceData }) => {
  return (
    <Box>
      <Typography variant="body2" color="textSecondary">
        Core Web Vitals:
      </Typography>
      {performanceData.coreWebVitals.length > 0 ? (
        <ul>
          {performanceData.coreWebVitals.map((vital) => (
            <li key={vital.name}>
              {vital.name}: {vital.value} (Benchmark: {vital.benchmark})
            </li>
          ))}
        </ul>
      ) : (
        <Typography variant="caption" color="textSecondary">
          No data available.
        </Typography>
      )}
      <Typography variant="body2" sx={{ mt: 1 }}>
        Performance Score: {performanceData.performanceScore}
      </Typography>
      <Typography variant="body2">
        Mobile Responsive: {performanceData.mobileResponsive ? "Yes" : "No"}
      </Typography>
    </Box>
  );
};

export default PerformanceChart;
