import { Box, CircularProgress } from '@mui/material';

export const FullSpinner = ({ ariaLabel }: { ariaLabel?: string }) => (
  <Box
    sx={{
      position: 'relative',
      left: '0',
      top: '0',
      minHeight: '150px',
      maxHeight: '80vh',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <CircularProgress aria-label={ariaLabel} />
  </Box>
);
