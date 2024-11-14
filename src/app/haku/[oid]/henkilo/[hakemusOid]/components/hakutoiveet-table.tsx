'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import {
  Box,
  Link,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { DEFAULT_BOX_BORDER } from '@/app/lib/constants';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { HakukohdeTabLink } from '@/app/haku/[oid]/hakukohde/components/hakukohde-tab-link';
import {
  OphButton,
  ophColors,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { isEmpty, isNonNullish } from 'remeda';
import { useState } from 'react';
import { ChevronRight } from '@mui/icons-material';
import { LasketutValinnanvaiheetInternal } from '@/app/hooks/useLasketutValinnanVaiheet';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import { getValintatapaJonoNimi } from '@/app/lib/get-valintatapa-jono-nimi';
import { SijoitteluajonTulosHakutoive } from '@/app/lib/valinta-tulos-service';
import {
  isHyvaksyttyHarkinnanvaraisesti,
  SijoittelunTila,
} from '@/app/lib/types/sijoittelu-types';
import { TFunction } from 'i18next';

type Tulokset = {
  sijoittelunTulokset: SijoitteluajonTulosHakutoive;
  valinnanvaiheet?: LasketutValinnanvaiheetInternal;
};

type HakukohdeTuloksilla = Hakukohde & Tulokset;

const TC = styled(TableCell)(({ theme }) => ({
  borderBottom: 0,
  padding: theme.spacing(2),
}));

const AccordionHeader = styled(Box)(({ theme }) => ({
  ...theme.typography.h5,
  display: 'flex',
  justifyContent: 'flex-start',
  gap: theme.spacing(1),
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

const HakutoiveContent = ({
  valinnanvaiheet,
  sijoittelunTulokset,
}: Tulokset) => {
  const { t } = useTranslations();
  return isEmpty(valinnanvaiheet ?? []) ? (
    <HakutoiveInfoRow>
      <TC />
      <TC colSpan={5}>{t('valintalaskennan-tulokset.ei-tuloksia')}</TC>
    </HakutoiveInfoRow>
  ) : (
    valinnanvaiheet?.map((valinnanvaihe) => {
      return valinnanvaihe.valintatapajonot?.map((jono) => {
        const jonosija = jono.jonosijat[0];
        const sijoittelunJono =
          sijoittelunTulokset?.hakutoiveenValintatapajonot?.find(
            (sijoitteluJono) =>
              sijoitteluJono.valintatapajonoOid === jono.valintatapajonooid,
          );

        return (
          <HakutoiveInfoRow key={valinnanvaihe.valinnanvaiheoid}>
            <TC />
            <TC>
              <OphTypography variant="label">
                {getValintatapaJonoNimi({
                  valinnanVaiheNimi: valinnanvaihe.nimi,
                  jonoNimi: jono.nimi,
                })}
              </OphTypography>
              <div>
                {t('henkilo.valintalaskenta-tehty')}
                {': '}
                {toFormattedDateTimeString(valinnanvaihe.createdAt)}
              </div>
            </TC>
            <TC>{jonosija.pisteet}</TC>
            <TC>{t(`tuloksenTila.${jonosija.tuloksenTila}`)}</TC>
            {sijoittelunTulokset ? (
              <>
                <TC>
                  {sijoittelunJono &&
                    getHakemuksenTila(sijoittelunJono, t) +
                      (isNonNullish(sijoittelunJono.varasijanNumero)
                        ? ` (${sijoittelunJono.varasijanNumero})`
                        : '')}
                </TC>
                <TC>
                  {t(`vastaanottotila.${sijoittelunTulokset.vastaanottotieto}`)}
                </TC>
              </>
            ) : (
              <TC colSpan={2}>Ei sijoittelun tuloksia</TC>
            )}
          </HakutoiveInfoRow>
        );
      });
    })
  );
};

const HakutoiveTableAccordion = ({
  hakuOid,
  hakukohde,
  hakutoiveNumero,
}: {
  hakuOid: string;
  hakukohde: HakukohdeTuloksilla;
  hakutoiveNumero: number;
}) => {
  const { t, translateEntity } = useTranslations();

  const { valinnanvaiheet, sijoittelunTulokset } = hakukohde;

  const noContent = isEmpty(valinnanvaiheet ?? []);

  const [isOpen, setIsOpen] = useState(() => !noContent);

  const headerId = `hakutoive-header-${hakutoiveNumero}`;
  const contentId = `hakutoive-content-${hakutoiveNumero}`;

  return (
    <>
      <TableBody>
        <TableRow
          sx={{
            width: '100%',
            borderTop: DEFAULT_BOX_BORDER,
            backgroundColor: noContent ? ophColors.grey50 : ophColors.white,
          }}
        >
          <TC colSpan={6} component="th">
            <AccordionHeader>
              <OphButton
                variant="text"
                title={
                  isOpen
                    ? t('henkilo.taulukko.piilota-hakutoiveen-tiedot')
                    : t('henkilo.taulukko.nayta-hakutoiveen-tiedot')
                }
                aria-label={
                  isOpen
                    ? t('henkilo.taulukko.piilota-hakutoiveen-tiedot')
                    : t('henkilo.taulukko.nayta-hakutoiveen-tiedot')
                }
                sx={{ color: ophColors.black }}
                startIcon={
                  <ChevronRight
                    sx={{
                      transform: isOpen ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.15s ease-in-out',
                    }}
                  />
                }
                onClick={() => setIsOpen((open) => !open)}
                aria-controls={contentId}
                aria-expanded={isOpen ? 'true' : 'false'}
              />
              <Box id={headerId} sx={{ color: 'black' }}>
                <span>
                  {hakutoiveNumero}
                  {'. '}
                  {translateEntity(hakukohde.nimi)}
                  {' \u2013 '}
                </span>
                <Link
                  component={HakukohdeTabLink}
                  hakuOid={hakuOid}
                  hakukohdeOid={hakukohde.oid}
                  tabRoute="perustiedot"
                >
                  {translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}
                </Link>
              </Box>
            </AccordionHeader>
          </TC>
        </TableRow>
      </TableBody>
      <TableBody
        role="region"
        id={contentId}
        aria-labelledby={headerId}
        sx={{
          visibility: isOpen ? 'visible' : 'collapse',
        }}
      >
        <HakutoiveContent
          valinnanvaiheet={valinnanvaiheet}
          sijoittelunTulokset={sijoittelunTulokset}
        />
      </TableBody>
    </>
  );
};

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& .MuiTableCell-root': {
    padding: theme.spacing(0, 2, 1, 2),
  },
}));

export const HakutoiveetTable = ({
  hakuOid,
  hakukohteet,
}: {
  hakuOid: string;
  hakukohteet: Array<HakukohdeTuloksilla>;
}) => {
  const { t } = useTranslations();
  return (
    <Table sx={{ width: '100%' }}>
      <StyledTableHead>
        <TableRow>
          <TC rowSpan={2} sx={{ verticalAlign: 'bottom' }}>
            {t('henkilo.taulukko.hakutoive')}
          </TC>
          <TC rowSpan={2} sx={{ verticalAlign: 'bottom' }}>
            {t('henkilo.taulukko.valintatapajono')}
          </TC>
          <TC colSpan={2}>{t('henkilo.taulukko.valintalaskenta')}</TC>
          <TC colSpan={2}>{t('henkilo.taulukko.sijoittelu')}</TC>
        </TableRow>
        <TableRow>
          <TC>{t('henkilo.taulukko.pisteet')}</TC>
          <TC>{t('henkilo.taulukko.valintatieto')}</TC>
          <TC>{t('henkilo.taulukko.tila')}</TC>
          <TC>{t('henkilo.taulukko.vastaanottotieto')}</TC>
        </TableRow>
      </StyledTableHead>
      {hakukohteet.map((hakukohde, index) => (
        <HakutoiveTableAccordion
          key={hakukohde.oid}
          hakuOid={hakuOid}
          hakukohde={hakukohde}
          hakutoiveNumero={index + 1}
        />
      ))}
    </Table>
  );
};
