'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { getHenkiloTitle } from '@/app/lib/henkilo-utils';
import {
  getReadableHakemuksenTila,
  isVastaanottoPossible,
  isImoittautuminenPossible,
} from '@/app/lib/sijoittelun-tulokset-utils';
import { HakijaInfo } from '@/app/lib/types/ataru-types';
import { HakutoiveTitle } from './hakutoive-title';
import { ValinnanTilatEditModal } from './valinnan-tilat-edit-modal';
import { showModal } from '@/app/components/global-modal';
import { TableCell } from '@mui/material';
import { EditButton } from '@/app/components/edit-button';
import { HenkilonHakukohdeTuloksilla } from '../lib/henkilo-page-types';

export const ValinnanTulosCells = ({
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

  const openValinnanTilatEditModal = () =>
    showModal(ValinnanTilatEditModal, {
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
      <TableCell>
        {getReadableHakemuksenTila(
          {
            tila: valinnanTulos.valinnantila,
            hyvaksyttyHarkinnanvaraisesti:
              valinnanTulos?.hyvaksyttyHarkinnanvaraisesti,
            varasijanNumero: valinnanTulos?.varasijanNumero,
          },
          t,
        )}
      </TableCell>
      <TableCell>
        {isVastaanottoPossible({
          tila: valinnanTulos.valinnantila,
          vastaanottotila: valinnanTulos.vastaanottotila,
          julkaistavissa: Boolean(valinnanTulos.julkaistavissa),
        }) && (
          <>
            <div>{t(`vastaanottotila.${valinnanTulos?.vastaanottotila}`)}</div>
            <EditButton onClick={openValinnanTilatEditModal} />
          </>
        )}
      </TableCell>
      <TableCell>
        {isImoittautuminenPossible({
          tila: valinnanTulos.valinnantila,
          vastaanottotila: valinnanTulos.vastaanottotila,
          julkaistavissa: Boolean(valinnanTulos.julkaistavissa),
        }) && (
          <>
            <div>
              {t(`ilmoittautumistila.${valinnanTulos?.ilmoittautumistila}`)}
            </div>
            <EditButton onClick={openValinnanTilatEditModal} />
          </>
        )}
      </TableCell>
    </>
  ) : (
    <TableCell colSpan={2}>
      {t('henkilo.taulukko.ei-valinnan-tulosta')}
    </TableCell>
  );
};
