'use client';

import { Box } from '@mui/material';
import SeurantaItem from './seuranta-item';
import { SeurantaControls } from './seuranta-controls';
import { useSeurantaResults } from '../hooks/useSeuranta';
import { styled } from '@/lib/theme';
import { SeurantaInfo } from './seuranta-info';

const StyledContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(2),
}));

const StyledHeader = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
}));

export default function SeurantaContent() {
  const { results, usersMap, totalResults } = useSeurantaResults();

  return (
    <StyledContainer>
      <StyledHeader>
        <SeurantaControls />
        <SeurantaInfo seurantaTiedot={totalResults} />
      </StyledHeader>
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
