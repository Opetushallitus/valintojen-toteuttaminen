import { styled } from '@/lib/theme';
import { Box } from '@mui/material';

export const SijoittelunTulosStyledCell = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(1),
  minWidth: '240px',
}));
