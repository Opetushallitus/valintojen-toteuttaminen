'use client';

import { SeurantaTiedotLaajennettu } from '@/lib/types/laskenta-types';
import { Box } from '@mui/material';
import { ophColors, styled } from '@/lib/theme';
import { SeurantaItemStatus } from './seuranta-item-status';
import { SeurantaItemDetails } from './seuranta-item-details';
import { PersonDetails } from '@/lib/oppijanumerorekisteri/onr-types';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { FullClientSpinner } from '@/components/client-spinner';
import { SeurantaItemError } from './seuranta-item-error';

const StyledItemContainer = styled(Box)(({ theme }) => ({
  maxWidth: '100%',
  borderColor: ophColors.grey300,
  borderWidth: '1px',
  borderStyle: 'solid',
  display: 'grid',
  gridTemplateColumns: '20% 20% 20% 20% 20%',
  gridTemplateAreas: `"status status details details details"
                      "error error error error error"`,
  rowGap: theme.spacing(2),
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
      {seurantaTiedot.tila === 'PERUUTETTU' && (
        <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
          <SeurantaItemError seurantaTiedot={seurantaTiedot} />
        </QuerySuspenseBoundary>
      )}
    </StyledItemContainer>
  );
}
