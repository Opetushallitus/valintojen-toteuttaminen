'use client';

import { getHakukohde } from '@/app/lib/kouta';
import { styled } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';

const StyledContainer = styled('div')({
  width: '70%',
});

export default function ValintalaskennanTulosPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  const { data: hakukohde } = useSuspenseQuery({
    queryKey: ['getHakukohde', params.hakukohde],
    queryFn: () => getHakukohde(params.hakukohde),
  });

  return (
    <StyledContainer>
      <p>Valintalaskennan Tulos</p>
      <p>Hakukohde oid: {hakukohde.oid}</p>
    </StyledContainer>
  );
}