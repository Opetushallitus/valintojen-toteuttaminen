import { LocalizedSelect } from '@/components/localized-select';
import { useTranslations } from '@/lib/localization/useTranslations';
import { OphFormFieldWrapper } from '@opetushallitus/oph-design-system';
import { useSeurantaParams } from '../hooks/useSeuranta';
import { Box, SelectChangeEvent } from '@mui/material';
import { isEmptyish } from 'remeda';

export const SeurantaControls = () => {
  const { t } = useTranslations();

  const { setLaskennanTila, laskennanTila } = useSeurantaParams();

  const laskennanTilaOptions = [
    'VALMIS',
    'MENEILLAAN',
    'ALOITTAMATTA',
    'PERUUTETTU',
  ].map((tila) => {
    return { value: tila as string, label: t(`valintalaskenta.tila.${tila}`) };
  });

  const changeLaskennanTila = (e: SelectChangeEvent) => {
    setLaskennanTila(isEmptyish(e.target.value) ? null : e.target.value);
  };

  return (
    <Box>
      <OphFormFieldWrapper
        sx={{
          width: 'auto',
          minWidth: '140px',
          textAlign: 'left',
          marginBottom: '15px',
        }}
        label={t('seuranta.laskennan-tila')}
        renderInput={({ labelId }) => (
          <LocalizedSelect
            id="seurannan-tila-select"
            labelId={labelId}
            onChange={changeLaskennanTila}
            value={laskennanTila ?? ''}
            options={laskennanTilaOptions}
            clearable
          />
        )}
      />
    </Box>
  );
};
