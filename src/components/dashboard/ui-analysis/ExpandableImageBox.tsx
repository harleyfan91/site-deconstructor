
import React from 'react';
import { Box, Typography, List, ListItem, Link, Card, CardContent } from '@mui/material';
import { ChevronDown } from 'lucide-react';

interface ExpandableImageBoxProps {
  title: string;
  count: number;
  format: string;
  totalSize: string;
  isExpanded: boolean;
  onToggle: () => void;
  urls: string[];
  emptyMessage: string;
}

const ExpandableImageBox: React.FC<ExpandableImageBoxProps> = ({
  title,
  count,
  format,
  totalSize,
  isExpanded,
  onToggle,
  urls,
  emptyMessage,
}) => {

  return (
    <Card
      onClick={onToggle}
      sx={{
        border: '1px solid #E0E0E0',
        borderRadius: 2,
        textAlign: 'center',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'rgba(255, 107, 53, 0.05)',
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
        {count}
      </Typography>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: isExpanded ? 'bold' : 'normal' }}>
        {title}
        <ChevronDown 
          size={16} 
          style={{ 
            marginLeft: 4,
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }} 
        />
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {format}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {totalSize}
      </Typography>
      
      {isExpanded && (
        <Box sx={{ width: '100%', mt: 2, textAlign: 'left' }}>
          {urls && urls.length > 0 ? (
            <List dense>
              {urls.map((url, idx) => (
                <ListItem key={idx} disableGutters>
                  <Link 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    underline="hover"
                    sx={{ wordBreak: 'break-all' }}
                  >
                    <Typography variant="body2">{url}</Typography>
                  </Link>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {count > 0 ? "Loading image links..." : emptyMessage}
            </Typography>
          )}
        </Box>
      )}
      </CardContent>
    </Card>
  );
};

export default ExpandableImageBox;
