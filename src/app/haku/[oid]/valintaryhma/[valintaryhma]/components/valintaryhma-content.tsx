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
import { isDefined, prop, sortBy } from 'remeda';
import { OphTypography } from '@opetushallitus/oph-design-system';
import {
  findHakukohteetRecursively,
  findParent,
} from '../lib/valintaryhma-util';
import { ValintaryhmanValintalaskenta } from './valintaryhma-valintalaskenta';
import { useHaku } from '@/lib/kouta/useHaku';
import { useHaunAsetukset } from '@/lib/ohjausparametrit/useHaunAsetukset';

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

  const { data: haku } = useHaku({ hakuOid });
  const { data: haunAsetukset } = useHaunAsetukset({ hakuOid });

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
    function getHakukohdeFullName(hakukohde: Hakukohde) {
      const jarjestysPaikka = hakukohde.jarjestyspaikkaHierarkiaNimi
        ? `${translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}, `
        : '';
      return jarjestysPaikka + translateEntity(hakukohde.nimi);
    }

    function mapHakukohteet(valintaryhma: ValintaryhmaHakukohteilla) {
      return valintaryhma.hakukohteet
        .map((oid) => {
          return hakukohteet.find((hk) => hk.oid === oid);
        })
        .filter(isDefined);
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

  function getHakukohteetForLaskenta() {
    const hkOids = valittuRyhma ? findHakukohteetRecursively(valittuRyhma) : [];
    return hkOids
      .map((oid) => hakukohteet.find((hk) => hk.oid === oid))
      .filter(isDefined);
  }

  return !valittuRyhma ? (
    <></>
  ) : (
    <StyledContainer>
      <ValintaryhmaHeader valintaryhma={valittuRyhma} parentName={parentName} />
      <ValintaryhmanValintalaskenta
        haunAsetukset={haunAsetukset}
        hakukohteet={getHakukohteetForLaskenta()}
        valintaryhma={valittuRyhma}
        haku={haku}
      />
      <ValintaryhmaHakukohdeTable hakukohteet={mappedHakukohteet} />
    </StyledContainer>
  );
};
