import { Card, CardContent, CardHeader, Skeleton, Box } from '@mui/material';

interface SkeletonCardProps {
  title: string;
  lines?: number;
}

export function SkeletonCard({ title, lines = 3 }: SkeletonCardProps) {
  return (
    <Card sx={{ height: '100%', minHeight: 200 }}>
      <CardHeader
        title={title.toUpperCase()}
        sx={{
          backgroundColor: 'action.hover',
          '& .MuiCardHeader-title': {
            fontSize: '0.875rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
          },
        }}
      />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
              key={index}
              variant="text"
              height={20}
              width={index === lines - 1 ? '60%' : '100%'}
              animation="wave"
            />
          ))}
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="rectangular" height={60} animation="wave" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}