'use client';

import { SeurantaTiedotLaajennettu } from '@/lib/types/laskenta-types';
import { Box } from '@mui/material';
import { ophColors, styled } from '@/lib/theme';
import { SeurantaItemStatus } from './seuranta-item-status';
import { SeurantaItemDetails } from './seuranta-item-details';
import { PersonDetails } from '@/lib/oppijanumerorekisteri/onr-types';

const StyledItemContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '100%',
  borderColor: ophColors.grey300,
  borderWidth: '1px',
  borderStyle: 'solid',
  display: 'grid',
  gridTemplateColumns: '[status] 35% 25px [details] 60%',
  flexDirection: 'row',
  marginBottom: theme.spacing(1),
}));

export default function SeurantaItem({
  seurantaTiedot,
  personDetails,
}: {
  seurantaTiedot: SeurantaTiedotLaajennettu;
  personDetails?: PersonDetails;
}) {
  return (
    <StyledItemContainer>
      <SeurantaItemStatus
        seurantaTiedot={seurantaTiedot}
        personDetails={personDetails}
      />
      <SeurantaItemDetails seurantaTiedot={seurantaTiedot} />
    </StyledItemContainer>
  );
}
