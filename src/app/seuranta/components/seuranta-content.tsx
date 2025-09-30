'use client';

import { Box } from '@mui/material';
import SeurantaItem from './seuranta-item';
import { SeurantaControls } from './seuranta-controls';
import { useSeurantaResults } from '../hooks/useSeuranta';
import { styled } from '@/lib/theme';

const StyledContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(2),
}));

export default function SeurantaContent() {
  const { results, usersMap } = useSeurantaResults();

  return (
    <StyledContainer>
      <SeurantaControls />
      {results.map((st) => (
        <SeurantaItem
          seurantaTiedot={st}
          key={st.uuid}
          personDetails={usersMap[st.userOID]?.[0]}
        />
      ))}
    </StyledContainer>
  );
}
