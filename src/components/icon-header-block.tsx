import { responsivePadding } from '@/lib/responsive-padding';
import { DEFAULT_BOX_BORDER } from '@/lib/theme';
import { Box, Typography } from '@mui/material';

export const IconHeaderBlock = ({
  title,
  children,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <Box component="main">
      <Box
        sx={(theme) => ({
          borderBottom: DEFAULT_BOX_BORDER,
          display: 'flex',
          alignItems: 'center',
          columnGap: 1,
          ...responsivePadding(theme),
        })}
      >
        {icon}
        <Typography variant="h2">{title}</Typography>
      </Box>
      <Box sx={(theme) => responsivePadding(theme)}>{children}</Box>
    </Box>
  );
};
