import { usePisteSyottoSearchParams } from '@/app/hooks/usePisteSyottoSearch';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  Box,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { PisteSyottoSearch } from './pistesyotto-search';
import { OphSelect } from '@/app/components/form/oph-select';
import theme from '@/app/theme';
import { Valintakoe } from '@/app/lib/types/valintaperusteet-types';
import { CheckBoxOutlined } from '@mui/icons-material';
import { OphFormControl } from '@/app/components/form/oph-form-control';

export const PisteSyottoControls = ({ kokeet }: { kokeet: Valintakoe[] }) => {
  const {
    valittuKoe,
    setValittukoe,
    osallistumisenTila,
    setOsallistumisenTila,
    naytaVainLaskentaanVaikuttavat,
    setNaytaVainLaskentaanVaikuttavat,
  } = usePisteSyottoSearchParams();
  const { t } = useTranslations();

  const changeKoe = (e: SelectChangeEvent) => {
    setValittukoe(e.target.value);
  };

  const changeOsallistumisenTila = (e: SelectChangeEvent) => {
    setOsallistumisenTila(e.target.value);
  };

  const changeNaytaVainLaskentaanVaikuttavat = () => {
    setNaytaVainLaskentaanVaikuttavat(!naytaVainLaskentaanVaikuttavat);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        columnGap: theme.spacing(2),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          columnGap: theme.spacing(2),
        }}
      >
        <PisteSyottoSearch />
        <OphFormControl
          sx={{
            width: 'auto',
            minWidth: '140px',
            textAlign: 'left',
          }}
          label={t('pistesyotto.koe')}
          renderInput={({ labelId }) => (
            <OphSelect
              id="koe-select"
              labelId={labelId}
              value={valittuKoe}
              onChange={changeKoe}
              options={kokeet.map((k) => ({
                value: k.tunniste,
                label: k.kuvaus,
              }))}
              clearable
            />
          )}
        />
        <OphFormControl
          sx={{
            width: 'auto',
            minWidth: '140px',
            textAlign: 'left',
          }}
          label={t('yleinen.tila')}
          renderInput={({ labelId }) => (
            <OphSelect
              id="osallistumisen-tila-select"
              labelId={labelId}
              value={osallistumisenTila}
              onChange={changeOsallistumisenTila}
              options={[
                {
                  value: 'OSALLISTUI',
                  label: t('valintakoe.osallistumisenTila.OSALLISTUI'),
                },
                {
                  value: 'EI_OSALLISTUNUT',
                  label: t('valintakoe.osallistumisenTila.EI_OSALLISTUNUT'),
                },
                {
                  value: 'MERKITSEMATTA',
                  label: t('valintakoe.osallistumisenTila.MERKITSEMATTA'),
                },
                {
                  value: 'EI_VAADITA',
                  label: t('valintakoe.osallistumisenTila.EI_VAADITA'),
                },
              ]}
              clearable
            />
          )}
        />
      </Box>
      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={naytaVainLaskentaanVaikuttavat}
              onChange={changeNaytaVainLaskentaanVaikuttavat}
              checkedIcon={<CheckBoxOutlined />}
            />
          }
          label={t('pistesyotto.laskentaanVaikuttavat')}
        />
      </Box>
    </Box>
  );
};
