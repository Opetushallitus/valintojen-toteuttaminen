'use client';
import { useTranslations } from '@/lib/localization/useTranslations';
import { TableCell as MuiTableCell } from '@mui/material';
import { HenkilonHakukohdeTuloksilla } from '../lib/henkilo-page-types';
import { styled } from '@/lib/theme';

const ValintaTableCell = styled(MuiTableCell)({
  verticalAlign: 'top',
  textAlign: 'center',
});

export const ValinnanTulosCellsRest = ({
  hakukohde,
  valintatapaJonoNimi,
}: {
  hakukohde: HenkilonHakukohdeTuloksilla;
  valintatapaJonoNimi: string;
}) => {
  const { t } = useTranslations();
  const firstJonoSija = hakukohde.valinnanvaiheet
    ?.flatMap((v) => v.valintatapajonot ?? [])
    .find((j) => j?.nimi === valintatapaJonoNimi)?.jonosijat?.[0];

  const localizedTuloksenTila = firstJonoSija?.tuloksenTila
    ? t(`tuloksenTila.${firstJonoSija.tuloksenTila}`)
    : '';

  return (
    <>
      <ValintaTableCell>{localizedTuloksenTila}</ValintaTableCell>
      <ValintaTableCell colSpan={3} />
    </>
  );
};
