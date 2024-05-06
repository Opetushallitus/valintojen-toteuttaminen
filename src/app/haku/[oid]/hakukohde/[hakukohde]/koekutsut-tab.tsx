'use client';

import { Hakukohde } from '@/app/lib/kouta-types';
import { styled } from '@mui/material';

const StyledContainer = styled('div')({
  width: '70%',
});

export const KoekutsutTab = ({ hakukohde }: { hakukohde: Hakukohde }) => {
  return (
    <StyledContainer>
      <p>Koekutsut</p>
      <p>Hakukohde oid: {hakukohde.oid}</p>
    </StyledContainer>
  );
};

export default KoekutsutTab;
