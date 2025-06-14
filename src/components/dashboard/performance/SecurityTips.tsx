
import React from "react";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";

interface SecurityTipsProps {
  securityScore: number;
  issues: Array<{
    type: string;
    description: string;
    severity: "high" | "medium" | "low";
    status: string;
  }>;
}

const SecurityTips: React.FC<SecurityTipsProps> = ({ securityScore, issues }) => {
  return (
    <Box>
      <Typography variant="body2" color="textSecondary">
        Security Score: {securityScore}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
        Issues:
      </Typography>
      <List dense>
        {issues && issues.length > 0 ? (
          issues.map((issue, i) => (
            <ListItem key={i} sx={{ pl: 0 }}>
              <ListItemText
                primary={issue.description}
                secondary={`Severity: ${issue.severity}`}
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No security issues found." />
          </ListItem>
        )}
      </List>
    </Box>
  );
};
export default SecurityTips;
