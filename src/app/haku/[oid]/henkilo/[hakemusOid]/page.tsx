'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import {
  buildLinkToApplication,
  getAtaruHakemukset,
  parseHakijaTiedot,
} from '@/app/lib/ataru';
import {
  Box,
  Link,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useSuspenseQueries } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { getHenkiloTitle } from '../lib/henkilo-utils';
import { LabeledInfoItem } from '@/app/components/labeled-info-item';
import { ExternalLink } from '@/app/components/external-link';
import { getPostitoimipaikka } from '@/app/lib/koodisto';
import { DEFAULT_BOX_BORDER } from '@/app/lib/constants';
import { getHakukohteetQueryOptions } from '@/app/lib/kouta';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import { HakukohdeTabLink } from '@/app/haku/[oid]/hakukohde/components/hakukohde-tab-link';
import {
  OphButton,
  ophColors,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { filter, indexBy, isEmpty, map, pipe, prop, sortBy } from 'remeda';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { useState } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { getHakemuksenLasketutValinnanvaiheet } from '@/app/lib/valintalaskenta-service';
import {
  LaskettuJonoWithHakijaInfo,
  selectValinnanvaiheet,
} from '@/app/hooks/useLasketutValinnanVaiheet';
import { LaskettuValinnanVaihe } from '@/app/lib/types/laskenta-types';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import { getValintatapaJonoNimi } from '@/app/lib/get-valintatapa-jono-nimi';
import {
  getLatestSijoitteluajonTuloksetForHakemus,
  SijoitteluajonTulosHakutoive,
} from '@/app/lib/valinta-tulos-service';
import {
  isHyvaksyttyHarkinnanvaraisesti,
  SijoittelunTila,
} from '@/app/lib/types/sijoittelu-types';
import { TFunction } from 'i18next';

const TC = styled(TableCell)(({ theme }) => ({
  borderBottom: 0,
  padding: theme.spacing(2),
}));

const AccordionHeader = styled(Box)(({ theme }) => ({
  ...theme.typography.h5,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const HakutoiveInfoRow = styled(TableRow)({
  '&:nth-of-type(even)': {
    backgroundColor: ophColors.grey50,
  },
  '&:hover': {
    backgroundColor: ophColors.lightBlue2,
  },
});

type HakukohdeValinnanvaiheilla = Hakukohde & {
  sijoittelunTulokset: SijoitteluajonTulosHakutoive;
  valinnanvaiheet?: Array<
    Omit<LaskettuValinnanVaihe, 'valintatapajonot'> & {
      valintatapajonot?: Array<LaskettuJonoWithHakijaInfo>;
    }
  >;
};

const CellContentRows = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1),
}));

const getHakemuksenTila = (
  hakemus: {
    tila: SijoittelunTila;
    hyvaksyttyHarkinnanvaraisesti: boolean;
  },
  t: TFunction,
) =>
  isHyvaksyttyHarkinnanvaraisesti(hakemus)
    ? t('sijoitteluntila.HARKINNANVARAISESTI_HYVAKSYTTY')
    : t(`sijoitteluntila.${hakemus.tila}`);

const HakutoiveRows = ({
  hakuOid,
  hakukohde,
  hakutoiveNumero,
}: {
  hakuOid: string;
  hakukohde: HakukohdeValinnanvaiheilla;
  hakutoiveNumero: number;
}) => {
  const { translateEntity } = useTranslations();

  const [isOpen, setIsOpen] = useState(true);

  const { valinnanvaiheet, sijoittelunTulokset } = hakukohde;
  const { t } = useTranslations();

  return (
    <>
      <TableBody>
        <TableRow
          sx={{
            width: '100%',
            borderBottom: isOpen ? 'none' : DEFAULT_BOX_BORDER,
          }}
        >
          <TC colSpan={6}>
            <AccordionHeader>
              <Box>
                {hakutoiveNumero}
                {'. '}
                {translateEntity(hakukohde.nimi)}
                {' \u2013 '}
                <Link
                  component={HakukohdeTabLink}
                  hakuOid={hakuOid}
                  hakukohdeOid={hakukohde.oid}
                  tabRoute="perustiedot"
                >
                  {translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}
                </Link>
              </Box>
              <OphButton
                variant="text"
                sx={{ color: ophColors.black }}
                startIcon={isOpen ? <ExpandLess /> : <ExpandMore />}
                onClick={() => setIsOpen((open) => !open)}
              />
            </AccordionHeader>
          </TC>
        </TableRow>
      </TableBody>
      {isOpen && (
        <TableBody>
          {isEmpty(valinnanvaiheet ?? []) ? (
            <HakutoiveInfoRow>
              <TC></TC>
              <TC colSpan={5}>{t('valintalaskennan-tulokset.ei-tuloksia')}</TC>
            </HakutoiveInfoRow>
          ) : (
            valinnanvaiheet?.map((vv) => {
              return vv.valintatapajonot?.map((jono) => {
                const jonosija = jono.jonosijat[0];
                const sijoittelunJono =
                  sijoittelunTulokset.hakutoiveenValintatapajonot.find(
                    (sijoitteluJono) =>
                      sijoitteluJono.valintatapajonoOid ===
                      jono.valintatapajonooid,
                  );

                return (
                  <HakutoiveInfoRow key={vv.valinnanvaiheoid}>
                    <TC></TC>
                    <TC>
                      <CellContentRows>
                        <OphTypography variant="label">
                          {getValintatapaJonoNimi({
                            valinnanVaiheNimi: vv.nimi,
                            jonoNimi: jono.nimi,
                          })}
                        </OphTypography>
                        <div>
                          {t('henkilo.valintalaskenta-tehty')}
                          {': '}
                          {toFormattedDateTimeString(vv.createdAt)}
                        </div>
                      </CellContentRows>
                    </TC>
                    <TC>{jonosija.pisteet}</TC>
                    <TC>{t(`tuloksenTila.${jonosija.tuloksenTila}`)}</TC>
                    <TC>
                      {sijoittelunJono &&
                        getHakemuksenTila(sijoittelunJono, t) +
                          ' ' +
                          (sijoittelunJono.varasijanNumero
                            ? `(${sijoittelunJono.varasijanNumero})`
                            : '')}
                    </TC>
                    <TC>
                      {t(
                        `vastaanottotila.${sijoittelunTulokset.vastaanottotieto}`,
                      )}
                    </TC>
                  </HakutoiveInfoRow>
                );
              });
            })
          )}
        </TableBody>
      )}
    </>
  );
};

const HakutoiveetTable = ({
  hakuOid,
  hakukohteet,
}: {
  hakuOid: string;
  hakukohteet: Array<HakukohdeValinnanvaiheilla>;
}) => {
  const { t } = useTranslations();
  return (
    <Table sx={{ width: '100%' }}>
      <TableHead sx={{ borderBottom: DEFAULT_BOX_BORDER }}>
        <TableRow>
          <TC colSpan={2}></TC>
          <TC colSpan={2}>{t('henkilo.taulukko.valintalaskenta')}</TC>
          <TC colSpan={2}>{t('henkilo.taulukko.sijoittelu')}</TC>
        </TableRow>
        <TableRow>
          <TC>{t('henkilo.taulukko.hakutoive')}</TC>
          <TC>{t('henkilo.taulukko.valintatapajono')}</TC>
          <TC>{t('henkilo.taulukko.pisteet')}</TC>
          <TC>{t('henkilo.taulukko.valintatieto')}</TC>
          <TC>{t('henkilo.taulukko.tila')}</TC>
          <TC>{t('henkilo.taulukko.vastaanottotieto')}</TC>
        </TableRow>
      </TableHead>
      {hakukohteet.map((hakukohde, index) => (
        <HakutoiveRows
          key={hakukohde.oid}
          hakuOid={hakuOid}
          hakukohde={hakukohde}
          hakutoiveNumero={index + 1}
        />
      ))}
    </Table>
  );
};

const HenkiloContent = ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) => {
  const { t, translateEntity } = useTranslations();

  const [
    { data: hakemukset },
    { data: hakemuksenValintalaskenta },
    { data: sijoittelunTuloksetByHakemus },
  ] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['getHakemukset', hakuOid, hakemusOid],
        queryFn: () =>
          getAtaruHakemukset({ hakuOid, hakemusOids: [hakemusOid] }),
      },
      {
        queryKey: ['getHakemuksenValintalaskenta', hakuOid, hakemusOid],
        queryFn: () =>
          getHakemuksenLasketutValinnanvaiheet({ hakuOid, hakemusOid }),
      },
      {
        queryKey: [
          'getLatestSijoitteluajonTuloksetForHakemus',
          hakuOid,
          hakemusOid,
        ],
        queryFn: () =>
          getLatestSijoitteluajonTuloksetForHakemus({ hakuOid, hakemusOid }),
      },
    ],
  });

  const hakemus = hakemukset[0];

  if (!hakemus) {
    notFound();
  }

  const hakija = parseHakijaTiedot(hakemus);

  const hakukohdeOids = hakemus.hakutoiveet.map((h) => h.hakukohdeOid);
  const hakemuksetByOid = indexBy(hakemukset, prop('oid'));
  const lasketutValinnanVaiheet = hakemuksenValintalaskenta.hakukohteet.map(
    (hakukohde) => {
      return {
        ...hakukohde,
        valinnanvaiheet: selectValinnanvaiheet({
          hakemuksetByOid,
          lasketutValinnanVaiheet: hakukohde.valinnanvaihe,
          selectHakemusFields(hakemus) {
            return parseHakijaTiedot(hakemus);
          },
        }),
      };
    },
  );

  const { data: userPermissions } = useUserPermissions();

  const [{ data: hakukohteet }, { data: postitoimipaikka }] =
    useSuspenseQueries({
      queries: [
        {
          ...getHakukohteetQueryOptions(hakuOid, userPermissions),
          select: (hakukohteet: Array<Hakukohde>) =>
            pipe(
              hakukohteet,
              filter((h) => hakukohdeOids.includes(h.oid)),
              sortBy((h) => hakukohdeOids.indexOf(h.oid)),
              map((hakukohde) => ({
                ...hakukohde,
                ...lasketutValinnanVaiheet.find((v) => v.oid === hakukohde.oid),
                sijoittelunTulokset:
                  sijoittelunTuloksetByHakemus[hakukohde.oid],
              })),
            ),
        },
        {
          queryKey: ['getPostitoimipaikka', hakemus.postinumero],
          queryFn: () => getPostitoimipaikka(hakemus.postinumero),
        },
      ],
    });

  return (
    <>
      <Typography variant="h2">{getHenkiloTitle(hakija)}</Typography>
      <Stack direction="row" spacing="4vw">
        <LabeledInfoItem
          label={t('henkilo.hakemus-oid')}
          value={
            <ExternalLink
              name={hakija.hakemusOid}
              href={buildLinkToApplication(hakija.hakemusOid)}
              noIcon={true}
            />
          }
        />
        <LabeledInfoItem
          label={t('henkilo.lahiosoite')}
          value={`${hakemus.lahiosoite}, ${hakemus.postinumero} ${translateEntity(postitoimipaikka)}`}
        />
      </Stack>
      <HakutoiveetTable hakukohteet={hakukohteet} hakuOid={hakuOid} />
    </>
  );
};

export default function HenkiloPage({
  params,
}: {
  params: { oid: string; hakemusOid: string };
}) {
  const hakuOid = params.oid;
  const hakemusOid = params.hakemusOid;

  return (
    <Stack spacing={2} sx={{ m: 4, width: '100%' }}>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <HenkiloContent hakuOid={hakuOid} hakemusOid={hakemusOid} />
      </QuerySuspenseBoundary>
    </Stack>
  );
}
