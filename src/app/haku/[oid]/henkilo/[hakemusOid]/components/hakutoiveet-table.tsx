'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import {
  Box,
  styled,
  Table,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { HakijaInfo } from '@/app/lib/types/ataru-types';
import { HakukohdeTuloksilla } from '../hooks/useHenkiloPageData';
import { HakutoiveAccordion } from './hakutoive-accordion';

const StyledTable = styled(Table)(({ theme }) => ({
  '& .MuiTableCell-root': {
    borderBottom: 0,
    padding: theme.spacing(2),
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& .MuiTableCell-root': {
    padding: theme.spacing(0, 2, 1, 2),
  },
}));

export const HakutoiveetTable = ({
  hakukohteet,
  hakija,
}: {
  hakukohteet: Array<HakukohdeTuloksilla>;
  hakija: HakijaInfo;
}) => {
  const { t } = useTranslations();
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <StyledTable sx={{ width: '100%' }}>
        <StyledTableHead>
          <TableRow>
            <TableCell rowSpan={2} sx={{ verticalAlign: 'bottom' }}>
              {t('henkilo.taulukko.hakutoive')}
            </TableCell>
            <TableCell rowSpan={2} sx={{ verticalAlign: 'bottom' }}>
              {t('henkilo.taulukko.valintatapajono')}
            </TableCell>
            <TableCell colSpan={2}>
              {t('henkilo.taulukko.valintalaskenta')}
            </TableCell>
            <TableCell colSpan={2}>
              {t('henkilo.taulukko.sijoittelu')}
            </TableCell>
            <TableCell />
          </TableRow>
          <TableRow>
            <TableCell>{t('henkilo.taulukko.pisteet')}</TableCell>
            <TableCell>
              {t('henkilo.taulukko.laskennan-tuloksen-tila')}
            </TableCell>
            <TableCell>{t('henkilo.taulukko.valinnan-tila')}</TableCell>
            <TableCell>{t('henkilo.taulukko.vastaanotto')}</TableCell>
            <TableCell>{t('henkilo.taulukko.ilmoittautuminen')}</TableCell>
          </TableRow>
        </StyledTableHead>
        {hakukohteet.map((hakukohde, index) => (
          <HakutoiveAccordion
            key={hakukohde.oid}
            hakukohde={hakukohde}
            hakutoiveNumero={index + 1}
            hakija={hakija}
          />
        ))}
      </StyledTable>
    </Box>
  );
};
