'use client';

import { getValinnanvaiheet } from '@/app/lib/valintaperusteet';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
} from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Haku, Hakukohde } from '@/app/lib/kouta-types';
import HallintaTableRow from './hallinta-table-row';

type HallintaTableParams = {
  haku: Haku;
  hakukohde: Hakukohde;
};

const HallintaTable = ({ hakukohde, haku }: HallintaTableParams) => {
  const { data: valinnanvaiheet } = useSuspenseQuery({
    queryKey: ['getValinnanvaiheet', hakukohde.oid],
    queryFn: () => getValinnanvaiheet(hakukohde.oid),
  });

  const { t } = useTranslations();

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>{t('valinnanvaihe.nimi')}</TableCell>
          <TableCell>{t('valinnanhallinta.laskenta')}</TableCell>
          <TableCell>{t('valinnanhallinta.tyyppi')}</TableCell>
          <TableCell>{t('yleinen.toiminnot')}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {valinnanvaiheet.map((vaihe, index) => (
          <HallintaTableRow
            key={'vv-' + vaihe.oid}
            vaihe={vaihe}
            index={index}
            haku={haku}
            hakukohde={hakukohde}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default HallintaTable;
