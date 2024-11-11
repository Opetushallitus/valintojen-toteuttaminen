'use client';

'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
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
} from '@mui/material';
import { DEFAULT_BOX_BORDER } from '@/app/lib/constants';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { HakukohdeTabLink } from '@/app/haku/[oid]/hakukohde/components/hakukohde-tab-link';
import {
  OphButton,
  ophColors,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { isEmpty } from 'remeda';
import { useState } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { LaskettuJonoWithHakijaInfo } from '@/app/hooks/useLasketutValinnanVaiheet';
import { LaskettuValinnanVaihe } from '@/app/lib/types/laskenta-types';
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
  valinnanvaiheet?: Array<
    Omit<LaskettuValinnanVaihe, 'valintatapajonot'> & {
      valintatapajonot?: Array<LaskettuJonoWithHakijaInfo>;
    }
  >;
};

type HakukohdeTuloksilla = Hakukohde & Tulokset;

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

const HakutoiveContent = ({
  valinnanvaiheet,
  sijoittelunTulokset,
}: Tulokset) => {
  const { t } = useTranslations();
  return isEmpty(valinnanvaiheet ?? []) ? (
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
              sijoitteluJono.valintatapajonoOid === jono.valintatapajonooid,
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
              {t(`vastaanottotila.${sijoittelunTulokset.vastaanottotieto}`)}
            </TC>
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
  const { translateEntity } = useTranslations();

  const [isOpen, setIsOpen] = useState(true);

  const { valinnanvaiheet, sijoittelunTulokset } = hakukohde;

  const headerId = `hakutoive-header-${hakutoiveNumero}`;
  const contentId = `hakutoive-content-${hakutoiveNumero}`;

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
              <Box id={headerId}>
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
                aria-controls={contentId}
                aria-expanded={isOpen ? 'true' : 'false'}
              />
            </AccordionHeader>
          </TC>
        </TableRow>
      </TableBody>
      {isOpen && (
        <TableBody role="region" id={contentId} aria-labelledby={headerId}>
          <HakutoiveContent
            valinnanvaiheet={valinnanvaiheet}
            sijoittelunTulokset={sijoittelunTulokset}
          />
        </TableBody>
      )}
    </>
  );
};

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  borderBottom: DEFAULT_BOX_BORDER,
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
