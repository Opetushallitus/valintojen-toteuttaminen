'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { TableCell, TableRow } from '@mui/material';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { isEmpty } from 'remeda';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import { getValintatapaJonoNimi } from '@/app/lib/valintalaskenta-utils';
import { showModal } from '@/app/components/global-modal';
import { ValintalaskentaEditModal } from '@/app/components/valintalaskenta-edit-modal';
import { HakijaInfo } from '@/app/lib/types/ataru-types';
import { getHenkiloTitle } from '@/app/lib/henkilo-utils';
import { ValinnanTulosCells } from './valinnan-tulos-cells';
import { styled } from '@/app/lib/theme';
import { EditButton } from '@/app/components/edit-button';
import { HenkilonHakukohdeTuloksilla } from '../lib/henkilo-page-types';

const HakutoiveInfoRow = styled(TableRow)({
  '&:nth-of-type(even)': {
    backgroundColor: ophColors.grey50,
  },
  '&:hover': {
    backgroundColor: ophColors.lightBlue2,
  },
});

export const HakutoiveAccordionContent = ({
  hakija,
  hakukohde,
  hakutoiveNumero,
}: {
  hakija: HakijaInfo;
  hakukohde: HenkilonHakukohdeTuloksilla;
  hakutoiveNumero: number;
}) => {
  const { t } = useTranslations();
  const { valinnanvaiheet } = hakukohde;

  return isEmpty(valinnanvaiheet ?? []) ? (
    <HakutoiveInfoRow>
      <TableCell />
      <TableCell colSpan={5}>
        {t('henkilo.taulukko.ei-valintalaskennan-tuloksia')}
      </TableCell>
    </HakutoiveInfoRow>
  ) : (
    valinnanvaiheet?.map((valinnanvaihe, valinnanvaiheIndex) => {
      return valinnanvaihe.valintatapajonot?.map((jono, jonoIndex) => {
        const isFirstJono = valinnanvaiheIndex === 0 && jonoIndex === 0;

        // Jonosijoja pitäisi aina olla vain yksi
        const jonosija = jono.jonosijat[0];

        return (
          <HakutoiveInfoRow key={jono.oid}>
            <TableCell />
            <TableCell>
              <OphTypography variant="label">
                {getValintatapaJonoNimi({
                  valinnanVaiheNimi: valinnanvaihe.nimi,
                  jonoNimi: jono.nimi,
                })}
              </OphTypography>
              <div>
                {t('henkilo.taulukko.valintalaskenta-tehty')}
                {': '}
                {toFormattedDateTimeString(valinnanvaihe.createdAt)}
              </div>
            </TableCell>
            <TableCell>{jonosija.pisteet}</TableCell>
            <TableCell>
              <div>{t(`tuloksenTila.${jonosija.tuloksenTila}`)}</div>
              <EditButton
                onClick={() =>
                  showModal(ValintalaskentaEditModal, {
                    hakutoiveNumero,
                    hakijanNimi: getHenkiloTitle(hakija),
                    hakukohde,
                    valintatapajono: jono,
                    jonosija: jono.jonosijat?.[0], // Yhdellä henkilöllä vain yksi jonosija
                  })
                }
              />
            </TableCell>
            {
              /* Näytetään valinnan tiedot vain taulukon ensimmäiselle jonolle, joka siis järjestyksessä viimeinen jono, jonka perusteella valinta tehdään */
              isFirstJono ? (
                <ValinnanTulosCells
                  hakukohde={hakukohde}
                  hakutoiveNumero={hakutoiveNumero}
                  hakija={hakija}
                />
              ) : (
                <TableCell colSpan={3} />
              )
            }
          </HakutoiveInfoRow>
        );
      });
    })
  );
};
