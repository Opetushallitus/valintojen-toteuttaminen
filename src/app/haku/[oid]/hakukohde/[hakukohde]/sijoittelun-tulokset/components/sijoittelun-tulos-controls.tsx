import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, SelectChangeEvent } from '@mui/material';
import { SijoittelunTila } from '@/app/lib/types/sijoittelu-types';
import { OphFormControl } from '@/app/components/form/oph-form-control';
import { LocalizedSelect } from '@/app/components/localized-select';
import { useSijoittelunTulosSearchParams } from '../hooks/useSijoittelunTuloksetSearch';
import { SijoittelunTulosSearch } from './sijoittelun-tulos-search';

export const SijoittelunTulosControls = ({
  valintatapajonoOid,
}: {
  valintatapajonoOid: string;
}) => {
  const { sijoittelunTila, setSijoittelunTila } =
    useSijoittelunTulosSearchParams(valintatapajonoOid);

  const { t } = useTranslations();

  const changeSijoittelunTila = (e: SelectChangeEvent) => {
    setSijoittelunTila(e.target.value);
  };

  const sijoitteluntilaOptions = Object.values(SijoittelunTila).map((tila) => {
    return { value: tila as string, label: t(`sijoitteluntila.${tila}`) };
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        columnGap: 2,
      }}
    >
      <SijoittelunTulosSearch valintatapajonoOid={valintatapajonoOid} />
      <OphFormControl
        sx={{
          width: 'auto',
          minWidth: '140px',
          textAlign: 'left',
        }}
        label={t('hakijaryhmat.taulukko.sijoittelun-tila')}
        renderInput={({ labelId }) => (
          <LocalizedSelect
            id="sijoittelun-tila-select"
            labelId={labelId}
            value={sijoittelunTila}
            onChange={changeSijoittelunTila}
            options={sijoitteluntilaOptions}
            clearable
          />
        )}
      />
    </Box>
  );
};
