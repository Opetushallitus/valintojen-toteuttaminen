'use client';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { getHakukohdeFullName } from '@/lib/kouta/kouta-service';
import { getValintaryhmat } from '@/lib/valintaperusteet/valintaperusteet-service';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  HakukohdeWithLink,
  ValintaryhmaHakukohdeTable,
} from './valintaryhma-hakukohde-table';
import { Box } from '@mui/material';
import { styled } from '@/lib/theme';
import { useEffect, useMemo } from 'react';
import { ValintaryhmaHakukohteilla } from '@/lib/valintaperusteet/valintaperusteet-types';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
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
import { getLasketutHakukohteet } from '@/lib/valintalaskenta/valintalaskenta-service';
import { HaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-types';
import { useLaskentaState } from '@/lib/state/laskenta-state';
import { queryOptionsGetHakukohteet } from '@/lib/kouta/kouta-queries';

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

const ValintaryhmaBody = ({
  valittuRyhma,
  haunAsetukset,
  hakukohteet,
  hakukohteetWithLink,
  haku,
}: {
  valittuRyhma: ValintaryhmaHakukohteilla;
  haunAsetukset: HaunAsetukset;
  hakukohteet: Array<Hakukohde>;
  hakukohteetWithLink: Array<HakukohdeWithLink>;
  haku: Haku;
}) => {
  const { actorRef, setLaskentaParams } = useLaskentaState();

  useEffect(() => {
    setLaskentaParams({
      haku,
      valintaryhma: valittuRyhma,
      haunAsetukset,
      hakukohteet,
    });
  }, [setLaskentaParams, haku, valittuRyhma, haunAsetukset, hakukohteet]);

  return (
    <>
      {valittuRyhma.userHasWriteAccess && (
        <ValintaryhmanValintalaskenta
          hakukohteet={hakukohteet}
          actorRef={actorRef}
        />
      )}
      <ValintaryhmaHakukohdeTable
        hakukohteet={hakukohteetWithLink}
        actorRef={actorRef}
      />
    </>
  );
};

export const ValintaryhmaContent = ({
  hakuOid,
  valintaryhmaOid,
}: {
  hakuOid: string;
  valintaryhmaOid: string;
}) => {
  const userPermissions = useUserPermissions();

  const { translateEntity } = useTranslations();

  const { data: hakukohteet } = useSuspenseQuery(
    queryOptionsGetHakukohteet(hakuOid, userPermissions),
  );

  const { data: valintaryhmat } = useSuspenseQuery({
    queryKey: ['getValintaryhmat', hakuOid, userPermissions, hakukohteet],
    queryFn: () =>
      getValintaryhmat(
        hakuOid,
        userPermissions,
        hakukohteet.map((hk) => hk.oid),
      ),
  });

  const { data: haku } = useHaku({ hakuOid });
  const { data: haunAsetukset } = useHaunAsetukset({ hakuOid });
  const { data: lasketutHakukohteet } = useSuspenseQuery({
    queryKey: ['getLasketutHakukohteet', hakuOid],
    queryFn: () => getLasketutHakukohteet(hakuOid),
  });

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
    return valintaryhmat?.hakuRyhma?.oid === valintaryhmaOid
      ? valintaryhmat.hakuRyhma
      : findRecursively(valintaryhmat?.muutRyhmat);
  }, [valintaryhmat, valintaryhmaOid]);

  const parentName = useMemo(() => {
    if (
      !valittuRyhma ||
      valittuRyhma === valintaryhmat.hakuRyhma ||
      valintaryhmat.muutRyhmat.find((r) => r === valittuRyhma)
    ) {
      return null;
    }
    return findParent(valittuRyhma, valintaryhmat.muutRyhmat)?.nimi ?? null;
  }, [valittuRyhma, valintaryhmat]);

  const mappedHakukohteet = useMemo(() => {
    function mapHakukohteet(valintaryhma: ValintaryhmaHakukohteilla) {
      return findHakukohteetRecursively(valintaryhma)
        .map((oid) => {
          return hakukohteet.find((hk) => hk.oid === oid);
        })
        .filter(isDefined);
    }

    function findLaskentaValmistunut(hakukohde: Hakukohde) {
      const laskettuHakukohde = lasketutHakukohteet.find(
        (lhk) => lhk.hakukohdeOid === hakukohde.oid,
      );
      return laskettuHakukohde?.laskentaValmistunut ?? '';
    }

    if (!valittuRyhma) {
      return [];
    }
    return sortBy(
      mapHakukohteet(valittuRyhma).map((hakukohde) => ({
        oid: hakukohde.oid,
        name: getHakukohdeFullName(hakukohde, translateEntity, true),
        link: `kouta/hakukohde/${hakukohde.oid}`,
        laskentaValmistunut: findLaskentaValmistunut(hakukohde),
      })),
      prop('name'),
    );
  }, [hakukohteet, lasketutHakukohteet, valittuRyhma, translateEntity]);

  function getHakukohteetForLaskenta() {
    return mappedHakukohteet
      .map((mhk) => hakukohteet.find((hk) => hk.oid === mhk.oid))
      .filter(isDefined);
  }

  return !valittuRyhma ? (
    <></>
  ) : (
    <StyledContainer>
      <ValintaryhmaHeader valintaryhma={valittuRyhma} parentName={parentName} />
      <ValintaryhmaBody
        haku={haku}
        hakukohteet={getHakukohteetForLaskenta()}
        hakukohteetWithLink={mappedHakukohteet}
        haunAsetukset={haunAsetukset}
        valittuRyhma={valittuRyhma}
      />
    </StyledContainer>
  );
};
