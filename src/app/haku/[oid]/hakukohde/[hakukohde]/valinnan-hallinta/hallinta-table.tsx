'use client';

import { getValinnanvaiheet } from '@/app/lib/valintaperusteet';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Table, Box, TableCell, TableHead, TableRow } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Button } from '@opetushallitus/oph-design-system';

const HallintaTable = ({ hakukohdeOid }: { hakukohdeOid: string }) => {
  const { data: valinnanvaiheet } = useSuspenseQuery({
    queryKey: ['getValinnanvaiheet', hakukohdeOid],
    queryFn: () => getValinnanvaiheet(hakukohdeOid),
  });

  const { t } = useTranslations();

  return (
    <Table>
      <TableHead>
        <TableCell>{t('valinnanvaihe.nimi')}</TableCell>
        <TableCell>{t('valinnanhallinta.laskenta')}</TableCell>
        <TableCell>{t('valinnanhallinta.tyyppi')}</TableCell>
        <TableCell>{t('yleinen.toiminnot')}</TableCell>
      </TableHead>
      {valinnanvaiheet.map((vaihe) => {
        return (
          <TableRow key={'vv-' + vaihe.oid}>
            <TableCell>
              <Box sx={{ fontWeight: 600 }}>{vaihe.nimi}</Box>
              {vaihe.jonot.map((jono) => (
                <Box key={'vtj-' + jono.oid}>{jono.nimi}</Box>
              ))}
            </TableCell>
            <TableCell>
              <br />
              {vaihe.jonot.map((jono) => (
                <Box key={'vtj-aktiivinen-' + jono.oid}>
                  {jono.eiLasketaPaivamaaranJalkeen
                    ? t('valinnanhallinta.eilasketajalkeen', {
                        pvm: jono.eiLasketaPaivamaaranJalkeen,
                      })
                    : t('valinnanhallinta.mukanalaskennassa')}
                </Box>
              ))}
            </TableCell>
            <TableCell sx={{ verticalAlign: 'top' }}>
              {t(vaihe.tyyppi)}
            </TableCell>
            <TableCell>
              {vaihe.aktiivinen && (
                <Button variant="outlined">
                  {t('valinnanhallinta.kaynnista')}
                </Button>
              )}
              {!vaihe.aktiivinen && (
                <Box>{t('valinnanhallinta.eilaskennassa')}</Box>
              )}
            </TableCell>
          </TableRow>
        );
      })}
    </Table>
  );
};

export default HallintaTable;
