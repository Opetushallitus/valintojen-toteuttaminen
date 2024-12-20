import { ErrorOutline } from '@mui/icons-material';
import { Box, SvgIconProps } from '@mui/material';

export const ErrorWithIcon = ({
  children,
  color,
}: {
  children: React.ReactNode;
  color?: SvgIconProps['color'];
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
      <ErrorOutline color={color ?? 'error'} />
      <Box component="span" sx={{ paddingLeft: 1 }}>
        {children}
      </Box>
    </Box>
  );
};
