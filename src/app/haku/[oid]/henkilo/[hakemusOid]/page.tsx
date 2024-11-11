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
import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { getHenkiloTitle } from '../lib/henkilo-utils';
import { LabeledInfoItem } from '@/app/components/labeled-info-item';
import { ExternalLink } from '@/app/components/external-link';
import { getPostitoimipaikka } from '@/app/lib/koodisto';
import { DEFAULT_BOX_BORDER } from '@/app/lib/constants';
import { getHakukohteet } from '@/app/lib/kouta';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import { HakukohdeTabLink } from '@/app/haku/[oid]/hakukohde/components/hakukohde-tab-link';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { sortBy } from 'remeda';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { useState } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

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
  '&:hover': {
    backgroundColor: ophColors.lightBlue2,
  },
});

const HakutoiveRows = ({
  hakuOid,
  hakukohde,
  hakutoiveNumero,
}: {
  hakuOid: string;
  hakukohde: Hakukohde;
  hakutoiveNumero: number;
}) => {
  const { translateEntity } = useTranslations();

  const [isOpen, setIsOpen] = useState(true);

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
          <HakutoiveInfoRow>
            <TC></TC>
            <TC>1</TC>
            <TC>2</TC>
            <TC>3</TC>
            <TC>4</TC>
            <TC>5</TC>
          </HakutoiveInfoRow>
          <HakutoiveInfoRow sx={{ backgroundColor: ophColors.grey50 }}>
            <TC></TC>
            <TC>1</TC>
            <TC>2</TC>
            <TC>3</TC>
            <TC>4</TC>
            <TC>5</TC>
          </HakutoiveInfoRow>
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
  hakukohteet: Array<Hakukohde>;
}) => {
  return (
    <Table sx={{ width: '100%' }}>
      <TableHead sx={{ borderBottom: DEFAULT_BOX_BORDER }}>
        <TableRow>
          <TC colSpan={2}></TC>
          <TC colSpan={2}>Valintalaskenta</TC>
          <TC colSpan={2}>Sijoittelu</TC>
        </TableRow>
        <TableRow>
          <TC>Hakutoive</TC>
          <TC>Valintatapajono</TC>
          <TC>Pisteet</TC>
          <TC>Valintatieto</TC>
          <TC>Tila</TC>
          <TC>Vastaanottotieto</TC>
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

  const { data: hakemukset } = useSuspenseQuery({
    queryKey: ['getHakemukset', hakuOid, hakemusOid],
    queryFn: () => getAtaruHakemukset({ hakuOid, hakemusOids: [hakemusOid] }),
  });

  const hakemus = hakemukset[0];

  if (!hakemus) {
    notFound();
  }
  const hakija = parseHakijaTiedot(hakemus);

  const hakukohdeOids = hakemus.hakutoiveet.map((h) => h.hakukohdeOid);

  const { data: postitoimipaikka } = useSuspenseQuery({
    queryKey: ['getPostitoimipaikka', hakemus.postinumero],
    queryFn: () => getPostitoimipaikka(hakemus.postinumero),
  });

  const { data: userPermissions } = useUserPermissions();

  const { data: hakukohteet } = useSuspenseQuery({
    queryKey: ['getHakukohteet', hakuOid, userPermissions],
    queryFn: () => getHakukohteet(hakuOid, userPermissions),
    select: (hakukohteet) =>
      sortBy(
        hakukohteet.filter((h) => hakukohdeOids.includes(h.oid)),
        (item) => hakukohdeOids.indexOf(item.oid),
      ),
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
