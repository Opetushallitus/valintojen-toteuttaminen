'use client';
import { useTranslations } from '@/lib/localization/useTranslations';
import { getHenkiloTitle } from '@/lib/henkilo-utils';
import {
  getReadableHakemuksenTila,
  isIlmoittautuminenPossible,
} from '@/lib/sijoittelun-tulokset-utils';
import { HakijaInfo } from '@/lib/ataru/ataru-types';
import { HakutoiveTitle } from '@/components/hakutoive-title';
import { ValinnanTilatEditModal } from './valinnan-tilat-edit-modal';
import { showModal } from '@/components/modals/global-modal';
import { TableCell as MuiTableCell } from '@mui/material';
import { EditButton } from '@/components/edit-button';
import { HenkilonHakukohdeTuloksilla } from '../lib/henkilo-page-types';
import { useHaku } from '@/lib/kouta/useHaku';
import { styled } from '@/lib/theme';

const ValintaTableCell = styled(MuiTableCell)({
  verticalAlign: 'top',
  textAlign: 'center',
});

export const ValinnanTulosCellsFirst = ({
  hakukohde,
  hakija,
  hakutoiveNumero,
}: {
  hakukohde: HenkilonHakukohdeTuloksilla;
  hakija: HakijaInfo;
  hakutoiveNumero: number;
}) => {
  const { valinnanTulos } = hakukohde;
  const { t } = useTranslations();

  const { data: haku } = useHaku({ hakuOid: hakukohde.hakuOid });

  const openValinnanTilatEditModal = () =>
    showModal(ValinnanTilatEditModal, {
      haku,
      hakijanNimi: getHenkiloTitle(hakija),
      hakutoiveTitle: (
        <HakutoiveTitle
          hakutoiveNumero={hakutoiveNumero}
          hakukohde={hakukohde}
        />
      ),
      valinnanTulos,
    });

  return valinnanTulos ? (
    <>
      <ValintaTableCell>
        {getReadableHakemuksenTila(
          {
            valinnanTila: valinnanTulos.valinnantila,
            hyvaksyttyHarkinnanvaraisesti:
              valinnanTulos?.hyvaksyttyHarkinnanvaraisesti,
            varasijanNumero: valinnanTulos?.varasijanNumero,
          },
          t,
        )}
      </ValintaTableCell>
      <ValintaTableCell>
        <div>
          {valinnanTulos.julkaistavissa ? t('yleinen.kylla') : t('yleinen.ei')}
        </div>
        {!hakukohde.readOnly && (
          <EditButton onClick={openValinnanTilatEditModal} />
        )}
      </ValintaTableCell>
      <ValintaTableCell>
        <div>{t(`vastaanottotila.${valinnanTulos?.vastaanottotila}`)}</div>
      </ValintaTableCell>
      <ValintaTableCell>
        {isIlmoittautuminenPossible({
          valinnanTila: valinnanTulos.valinnantila,
          vastaanottoTila: valinnanTulos.vastaanottotila,
          julkaistavissa: Boolean(valinnanTulos.julkaistavissa),
        }) && t(`ilmoittautumistila.${valinnanTulos?.ilmoittautumistila}`)}
      </ValintaTableCell>
    </>
  ) : (
    <ValintaTableCell colSpan={2}>
      {t('henkilo.taulukko.ei-valinnan-tulosta')}
    </ValintaTableCell>
  );
};
