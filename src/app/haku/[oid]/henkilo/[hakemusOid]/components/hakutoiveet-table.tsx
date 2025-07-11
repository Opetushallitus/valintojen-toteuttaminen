'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { Box, Table, TableCell, TableHead, TableRow } from '@mui/material';
import { HakijaInfo } from '@/lib/ataru/ataru-types';
import { HakutoiveAccordion } from './hakutoive-accordion';
import { HenkilonHakukohdeTuloksilla } from '../lib/henkilo-page-types';
import { styled } from '@/lib/theme';

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
  hakukohteet: Array<HenkilonHakukohdeTuloksilla>;
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
            <TableCell colSpan={4}>
              {t('henkilo.taulukko.sijoittelu')}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t('henkilo.taulukko.pisteet')}</TableCell>
            <TableCell>
              {t('henkilo.taulukko.laskennan-tuloksen-tila')}
            </TableCell>
            <TableCell>{t('henkilo.taulukko.valinnan-tila')}</TableCell>
            <TableCell>{t('henkilo.taulukko.julkaistavissa')}</TableCell>
            <TableCell>{t('henkilo.taulukko.vastaanoton-tila')}</TableCell>
            <TableCell>{t('henkilo.taulukko.ilmoittautumisen-tila')}</TableCell>
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
