'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { TableCell, TableRow } from '@mui/material';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { isEmpty } from 'remeda';
import { toFormattedDateTimeString } from '@/lib/localization/translation-utils';
import { getValintatapaJonoNimi } from '@/lib/valintalaskenta/valintalaskenta-utils';
import { showModal } from '@/components/modals/global-modal';
import { ValintalaskentaEditGlobalModal } from '@/components/modals/valintalaskenta-edit-global-modal';
import { HakijaInfo } from '@/lib/ataru/ataru-types';
import { getHenkiloTitle } from '@/lib/henkilo-utils';
import { ValinnanTulosCells } from './valinnan-tulos-cells';
import { styled } from '@/lib/theme';
import { EditButton } from '@/components/edit-button';
import { HenkilonHakukohdeTuloksilla } from '../lib/henkilo-page-types';
import { useQueryClient } from '@tanstack/react-query';
import { TuloksenTila } from '@/lib/types/laskenta-types';
import { refetchHakemuksenValintalaskennanTulokset } from '@/lib/valintalaskenta/valintalaskenta-queries';

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

  const queryClient = useQueryClient();

  return isEmpty(valinnanvaiheet ?? []) ? (
    <HakutoiveInfoRow>
      <TableCell />
      <TableCell colSpan={6}>
        {t('henkilo.taulukko.ei-valintalaskennan-tuloksia')}
      </TableCell>
    </HakutoiveInfoRow>
  ) : (
    valinnanvaiheet?.map((valinnanvaihe) => {
      return valinnanvaihe.valintatapajonot?.map((jono) => {
        // Jonosijoja pitäisi aina olla vain yksi
        const jonosija = jono.jonosijat[0];
        const valintatapaJonoNimi = getValintatapaJonoNimi({
          valinnanVaiheNimi: valinnanvaihe.nimi,
          jonoNimi: jono.nimi,
        });

        return (
          jonosija && (
            <HakutoiveInfoRow key={jono.oid}>
              <TableCell />
              <TableCell>
                <OphTypography variant="label">
                  {valintatapaJonoNimi}
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
                {jonosija.tuloksenTila !==
                  TuloksenTila.HYVAKSYTTY_HARKINNANVARAISESTI &&
                  !hakukohde.readOnly && (
                    <EditButton
                      onClick={() =>
                        showModal(ValintalaskentaEditGlobalModal, {
                          hakutoiveNumero,
                          hakijanNimi: getHenkiloTitle(hakija),
                          hakukohde,
                          valintatapajono: jono,
                          jonosija,
                          onSuccess: () => {
                            refetchHakemuksenValintalaskennanTulokset({
                              hakuOid: hakukohde.hakuOid,
                              hakemusOid: jonosija.hakemusOid,
                              queryClient,
                            });
                          },
                        })
                      }
                    />
                  )}
              </TableCell>
              {
                <ValinnanTulosCells
                  hakukohde={hakukohde}
                  valintatapaJono={jono}
                  hakutoiveNumero={hakutoiveNumero}
                  hakija={hakija}
                />
              }
            </HakutoiveInfoRow>
          )
        );
      });
    })
  );
};
