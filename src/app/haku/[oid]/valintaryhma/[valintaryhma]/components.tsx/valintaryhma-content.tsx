'use client';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { getHakukohteetQueryOptions } from '@/lib/kouta/kouta-service';
import { getValintaryhmat } from '@/lib/valintaperusteet/valintaperusteet-service';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ValintaryhmaHakukohdeTable } from './valintaryhma-hakukohde-table';
import { Box } from '@mui/material';
import { styled } from '@/lib/theme';
import { useMemo } from 'react';
import { ValintaryhmaHakukohteilla } from '@/lib/valintaperusteet/valintaperusteet-types';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import { useTranslations } from '@/lib/localization/useTranslations';
import { isDefined, isNullish, prop, sortBy } from 'remeda';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { findParent } from './lib/valintaryhma-util';

const StyledContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  rowGap: theme.spacing(5),
  flexDirection: 'column',
}));

const StyledHeader = styled(Box)(() => ({
  textAlign: 'left',
  '& .valintaryhmaLabel': {
    fontWeight: 'normal',
  },
}));

const ValintaryhmaHeader = ({
  valintaryhma,
  parentName,
}: {
  valintaryhma: ValintaryhmaHakukohteilla;
  parentName: string | null;
}) => {
  return parentName ? (
    <StyledHeader>
      <OphTypography variant="h3" component="h2">
        <span className="parentLabel">{parentName}</span>
        <br />
        <span className="valintaryhmaLabel">{valintaryhma.nimi}</span>
      </OphTypography>
    </StyledHeader>
  ) : (
    <OphTypography variant="h3" component="h2">
      {valintaryhma.nimi}
    </OphTypography>
  );
};

export const ValintaryhmaContent = ({
  hakuOid,
  valintaryhmaOid,
}: {
  hakuOid: string;
  valintaryhmaOid: string;
}) => {
  const { data: userPermissions } = useUserPermissions();
  const { data: ryhmat } = useSuspenseQuery({
    queryKey: ['getValintaryhmat', hakuOid],
    queryFn: () => getValintaryhmat(hakuOid),
  });

  const { data: hakukohteet } = useSuspenseQuery(
    getHakukohteetQueryOptions(hakuOid, userPermissions),
  );

  const { translateEntity } = useTranslations();

  const valittuRyhma = useMemo(() => {
    function findRecursively(
      ryhmat: Array<ValintaryhmaHakukohteilla>,
    ): ValintaryhmaHakukohteilla | undefined {
      const foundRyhma = ryhmat.find((r) => r.oid === valintaryhmaOid);
      return (
        foundRyhma ||
        ryhmat
          .flatMap((r) => findRecursively(r.alaValintaryhmat))
          .filter(isDefined)[0]
      );
    }
    return ryhmat?.hakuRyhma?.oid === valintaryhmaOid
      ? ryhmat.hakuRyhma
      : findRecursively(ryhmat?.muutRyhmat);
  }, [ryhmat, valintaryhmaOid]);

  const parentName = useMemo(() => {
    if (
      !valittuRyhma ||
      valittuRyhma === ryhmat.hakuRyhma ||
      ryhmat.muutRyhmat.find((r) => r === valittuRyhma)
    ) {
      return null;
    }
    return findParent(valittuRyhma, ryhmat.muutRyhmat)?.nimi ?? null;
  }, [valittuRyhma, ryhmat]);

  const mappedHakukohteet = useMemo(() => {
    function getHakukohdeFullName(hakukohde?: Hakukohde) {
      if (!hakukohde) {
        return '';
      }
      const jarjestysPaikka = hakukohde.jarjestyspaikkaHierarkiaNimi
        ? `${translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}, `
        : '';
      return jarjestysPaikka + translateEntity(hakukohde.nimi);
    }

    function mapHakukohteet(valintaryhma: ValintaryhmaHakukohteilla) {
      return valintaryhma.hakukohteet
        .map((oid) => {
          return hakukohteet.find(
            (mappedHakukohde) => mappedHakukohde.oid === oid,
          );
        })
        .filter((hk) => !isNullish(hk));
    }
    if (!valittuRyhma) {
      return [];
    }
    return sortBy(
      mapHakukohteet(valittuRyhma).map((hakukohde) => ({
        oid: hakukohde.oid,
        name: getHakukohdeFullName(hakukohde),
        link: `kouta/hakukohde/${hakukohde.oid}`,
      })),
      prop('name'),
    );
  }, [hakukohteet, valittuRyhma, translateEntity]);

  return !valittuRyhma ? (
    <></>
  ) : (
    <StyledContainer>
      <ValintaryhmaHeader valintaryhma={valittuRyhma} parentName={parentName} />
      <ValintaryhmaHakukohdeTable hakukohteet={mappedHakukohteet} />
    </StyledContainer>
  );
};
