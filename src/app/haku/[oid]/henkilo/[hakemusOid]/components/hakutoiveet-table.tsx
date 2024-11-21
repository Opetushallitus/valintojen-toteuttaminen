'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import {
  Box,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { DEFAULT_BOX_BORDER } from '@/app/lib/constants';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import {
  OphButton,
  ophColors,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { isEmpty, isNonNullish } from 'remeda';
import { useState } from 'react';
import { ChevronRight, Edit } from '@mui/icons-material';
import { LasketutValinnanvaiheet } from '@/app/hooks/useLasketutValinnanVaiheet';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import { getValintatapaJonoNimi } from '@/app/lib/get-valintatapa-jono-nimi';
import {
  SijoitteluajonTulosHakutoive,
  ValinnanTulos,
} from '@/app/lib/valinta-tulos-service';
import {
  isHyvaksyttyHarkinnanvaraisesti,
  SijoittelunTila,
} from '@/app/lib/types/sijoittelu-types';
import { TFunction } from 'i18next';
import { showModal } from '@/app/components/global-modal';
import { MuokkaaValintalaskentaaModalDialog } from './muokkaa-valintalaskentaa-modal-dialog';
import { HakijaInfo } from '@/app/lib/types/ataru-types';
import { getHenkiloTitle } from '@/app/lib/henkilo-utils';
import { HakutoiveTitle } from './hakutoive-title';
import { ValinnanTilatEditModal } from './valinnan-tilat-edit-modal';
import {
  isIlmoittautumistilaEditable,
  isVastaanottotilaEditable,
} from '@/app/lib/sijoittelun-tulokset-utils';

type Tulokset = {
  sijoittelunTulokset: SijoitteluajonTulosHakutoive;
  valinnanvaiheet?: LasketutValinnanvaiheet;
  valinnanTulos?: ValinnanTulos;
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

const MuokkaaButton = ({
  onClick,
  label,
}: {
  label?: string;
  onClick: () => void;
}) => {
  const { t } = useTranslations();
  return (
    <OphButton
      sx={{ paddingX: 0 }}
      variant="text"
      startIcon={<Edit />}
      onClick={onClick}
    >
      {label ?? t('yleinen.muokkaa')}
    </OphButton>
  );
};

const getHakemuksenTila = (
  hakemus: {
    tila: SijoittelunTila;
    hyvaksyttyHarkinnanvaraisesti?: boolean;
    varasijanNumero?: number | null;
  },
  t: TFunction,
) => {
  switch (true) {
    case isHyvaksyttyHarkinnanvaraisesti(hakemus):
      return t('sijoitteluntila.HARKINNANVARAISESTI_HYVAKSYTTY');
    case hakemus.tila === SijoittelunTila.VARALLA &&
      isNonNullish(hakemus.varasijanNumero):
      return `${t(`sijoitteluntila.${hakemus.tila}`)} (${hakemus.varasijanNumero})`;
    default:
      return t(`sijoitteluntila.${hakemus.tila}`);
  }
};

const HakutoiveContent = ({
  hakija,
  hakukohde,
  hakuOid,
}: {
  hakija: HakijaInfo;
  hakukohde: HakukohdeTuloksilla;
  hakuOid: string;
}) => {
  const { t } = useTranslations();
  const { valinnanvaiheet, sijoittelunTulokset, valinnanTulos } = hakukohde;

  return isEmpty(valinnanvaiheet ?? []) ? (
    <HakutoiveInfoRow>
      <TC />
      <TC colSpan={5}>{t('henkilo.taulukko.ei-valintalaskennan-tuloksia')}</TC>
    </HakutoiveInfoRow>
  ) : (
    valinnanvaiheet?.map((valinnanvaihe, valinnanvaiheIndex) => {
      return valinnanvaihe.valintatapajonot?.map((jono, jonoIndex) => {
        const isFirstJono = valinnanvaiheIndex === 0 && jonoIndex === 0;
        const jonosija = jono.jonosijat[0];
        const sijoittelunJono =
          sijoittelunTulokset?.hakutoiveenValintatapajonot?.find(
            (sijoitteluJono) =>
              sijoitteluJono.valintatapajonoOid === jono.valintatapajonooid,
          );

        const openValinnanTilatEditModal = () =>
          showModal(ValinnanTilatEditModal, {
            hakijanNimi: getHenkiloTitle(hakija),
            henkiloOid: hakija.hakijaOid,
            hakemusOid: hakija.hakemusOid,
            hakuOid,
            hakukohde,
            valinnanTulos,
            valintatapajono: jono,
          });

        return (
          <HakutoiveInfoRow key={jono.oid}>
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
            <TC>
              <div>{t(`tuloksenTila.${jonosija.tuloksenTila}`)}</div>
              <MuokkaaButton
                onClick={() =>
                  showModal(MuokkaaValintalaskentaaModalDialog, {
                    hakijanNimi: getHenkiloTitle(hakija),
                    hakuOid,
                    hakukohde,
                    valintatapajono: jono,
                  })
                }
              />
            </TC>
            {valinnanTulos ? (
              isFirstJono ? (
                <>
                  <TC>
                    {getHakemuksenTila(
                      {
                        tila: valinnanTulos.valinnantila,
                        hyvaksyttyHarkinnanvaraisesti:
                          sijoittelunJono?.hyvaksyttyHarkinnanvaraisesti,
                        varasijanNumero: sijoittelunJono?.varasijanNumero,
                      },
                      t,
                    )}
                  </TC>
                  <TC>
                    {isVastaanottotilaEditable({
                      tila: valinnanTulos.valinnantila,
                      vastaanottotila: valinnanTulos.vastaanottotila,
                      julkaistavissa: Boolean(valinnanTulos.julkaistavissa),
                    }) && (
                      <>
                        <div>
                          {t(
                            `vastaanottotila.${valinnanTulos?.vastaanottotila}`,
                          )}
                        </div>
                        <MuokkaaButton onClick={openValinnanTilatEditModal} />
                      </>
                    )}
                  </TC>
                  <TC>
                    {isIlmoittautumistilaEditable({
                      tila: valinnanTulos.valinnantila,
                      vastaanottotila: valinnanTulos.vastaanottotila,
                      julkaistavissa: Boolean(valinnanTulos.julkaistavissa),
                    }) && (
                      <>
                        <div>
                          {t(
                            `ilmoittautumistila.${valinnanTulos?.ilmoittautumistila}`,
                          )}
                        </div>
                        <MuokkaaButton onClick={openValinnanTilatEditModal} />
                      </>
                    )}
                  </TC>
                </>
              ) : (
                <TC colSpan={3} />
              )
            ) : (
              <TC colSpan={2}>{t('henkilo.taulukko.ei-valinnan-tulosta')}</TC>
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
  hakija,
}: {
  hakuOid: string;
  hakukohde: HakukohdeTuloksilla;
  hakutoiveNumero: number;
  hakija: HakijaInfo;
}) => {
  const { t } = useTranslations();

  const { valinnanvaiheet } = hakukohde;

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
          <TC colSpan={7} component="th">
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
                <HakutoiveTitle
                  hakutoiveNumero={hakutoiveNumero}
                  hakuOid={hakuOid}
                  hakukohde={hakukohde}
                />
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
          display: isOpen ? 'table-row-group' : 'none',
        }}
      >
        <HakutoiveContent
          hakija={hakija}
          hakuOid={hakuOid}
          hakukohde={hakukohde}
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
  hakija,
}: {
  hakuOid: string;
  hakukohteet: Array<HakukohdeTuloksilla>;
  hakija: HakijaInfo;
}) => {
  const { t } = useTranslations();
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table sx={{ width: '100%' }}>
        <StyledTableHead>
          <TableRow
            sx={{
              '& > th': {
                position: 'sticky',
              },
            }}
          >
            <TC rowSpan={2} sx={{ verticalAlign: 'bottom' }}>
              {t('henkilo.taulukko.hakutoive')}
            </TC>
            <TC rowSpan={2} sx={{ verticalAlign: 'bottom' }}>
              {t('henkilo.taulukko.valintatapajono')}
            </TC>
            <TC colSpan={2}>{t('henkilo.taulukko.valintalaskenta')}</TC>
            <TC colSpan={2}>{t('henkilo.taulukko.sijoittelu')}</TC>
            <TC />
          </TableRow>
          <TableRow>
            <TC>{t('henkilo.taulukko.pisteet')}</TC>
            <TC>{t('henkilo.taulukko.laskennan-tuloksen-tila')}</TC>
            <TC>{t('henkilo.taulukko.valinnan-tila')}</TC>
            <TC>{t('henkilo.taulukko.vastaanotto')}</TC>
            <TC>{t('henkilo.taulukko.ilmoittautuminen')}</TC>
          </TableRow>
        </StyledTableHead>
        {hakukohteet.map((hakukohde, index) => (
          <HakutoiveTableAccordion
            key={hakukohde.oid}
            hakuOid={hakuOid}
            hakukohde={hakukohde}
            hakutoiveNumero={index + 1}
            hakija={hakija}
          />
        ))}
      </Table>
    </Box>
  );
};
