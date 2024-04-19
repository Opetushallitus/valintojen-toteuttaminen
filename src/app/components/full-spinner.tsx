import { Box, CircularProgress } from '@mui/material';

export const FullSpinner = () => (
  <Box
    position="relative"
    left="0"
    top="0"
    minHeight="100px"
    height="100%"
    width="100%"
    display="flex"
    justifyContent="center"
    alignItems="center"
  >
    <CircularProgress aria-label="Ladataan..." />
  </Box>
);
