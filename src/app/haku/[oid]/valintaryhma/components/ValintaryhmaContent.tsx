'use client';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import { getHakukohteetQueryOptions } from '@/app/lib/kouta';
import { getValintaryhmat } from '@/app/lib/valintaperusteet';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ValintaryhmaSelector } from './ValintaryhmaSelector';
import { HakukohdeWithLink, ValintaryhmaHakukohdeTable } from './ValintaryhmaHakukohdeTable';
import { Box } from '@mui/material';
import { styled } from '@/app/lib/theme';
import { useMemo, useState } from 'react';
import { ValintaryhmaHakukohteilla } from '@/app/lib/types/valintaperusteet-types';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { useTranslations } from '@/app/hooks/useTranslations';
import { isNullish } from 'remeda';

const StyledContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  rowGap: theme.spacing(5),
  flexDirection: 'column',
}));

export const ValintaryhmaContent = ({ hakuOid }: { hakuOid: string }) => {
  const { data: userPermissions } = useUserPermissions();
  const { data: ryhmat } = useSuspenseQuery({
    queryKey: ['getValintaryhmat', hakuOid],
    queryFn: () => getValintaryhmat(hakuOid),
  });

  const { data: hakukohteet } = useSuspenseQuery(
    getHakukohteetQueryOptions(hakuOid, userPermissions),
  );

  const [selectedValintaryhma, setSelectedValintaryhma] = useState<ValintaryhmaHakukohteilla | null>(ryhmat[0]);

  const { translateEntity } = useTranslations();

  function getHakukohdeFullName(hakukohde?: Hakukohde) {
    if (!hakukohde) {
      return '';
    }
    const jarjestysPaikka = hakukohde.jarjestyspaikkaHierarkiaNimi
      ? `${translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}, `
      : '';
    return jarjestysPaikka + translateEntity(hakukohde.nimi);
  }

  const mappedHakukohteet = useMemo(() =>
    hakukohteet.map(hakukohde =>
      ({
        oid: hakukohde.oid,
        name: getHakukohdeFullName(hakukohde),
        link: `/kouta/organisaatio/${hakukohde.organisaatioOid}/hakukohde/${hakukohde.oid}/muokkaus`,
      })), [hakukohteet]);

  function mapHakukohteet(valintaryhma: ValintaryhmaHakukohteilla) {
    return valintaryhma.hakukohteet.map((oid) => {
      return mappedHakukohteet.find((mappedHakukohde) => mappedHakukohde.oid === oid)
    }).filter(hk => !isNullish(hk));
  }

  function onValintaryhmaSelect(valintaryhma: ValintaryhmaHakukohteilla | null) {
    console.log(valintaryhma);
    if (valintaryhma) {
      setSelectedValintaryhma(valintaryhma);
      setRyhmaHakukohteet(mapHakukohteet(valintaryhma));
    } else {
      setSelectedValintaryhma(null);
      setRyhmaHakukohteet([]);
    }
  }
  
  const [ryhmaHakukohteet, setRyhmaHakukohteet] = useState<HakukohdeWithLink[]>(mapHakukohteet(ryhmat[0]));

  return (
    <StyledContainer>
      <ValintaryhmaSelector valintaryhmat={ryhmat} onValintaryhmaSelect={onValintaryhmaSelect} />
      <ValintaryhmaHakukohdeTable hakukohteet={ryhmaHakukohteet} />
    </StyledContainer>
  );
};
