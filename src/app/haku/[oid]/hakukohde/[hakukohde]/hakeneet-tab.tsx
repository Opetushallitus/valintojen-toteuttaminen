'use client';

import { Hakukohde } from '@/app/lib/kouta-types';
import { styled } from '@mui/material';

const StyledContainer = styled('div')({
  width: '70%',
});

export const HakeneetTab = ({ hakukohde }: { hakukohde: Hakukohde }) => {
  return (
    <StyledContainer>
      <p>Hakeneet</p>
      <p>Hakukohde oid: {hakukohde.oid}</p>
    </StyledContainer>
  );
};

export default HakeneetTab;
