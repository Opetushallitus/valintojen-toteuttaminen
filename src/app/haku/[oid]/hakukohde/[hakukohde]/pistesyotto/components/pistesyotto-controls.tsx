import { usePisteSyottoSearchParams } from '../hooks/usePisteSyottoSearch';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, SelectChangeEvent } from '@mui/material';
import { ValintakoeAvaimet } from '@/app/lib/types/valintaperusteet-types';
import { OphFormControl } from '@/app/components/form/oph-form-control';
import { LocalizedSelect } from '@/app/components/localized-select';
import { OphCheckbox } from '@opetushallitus/oph-design-system';
import { SearchInput } from '@/app/components/search-input';

export const PisteSyottoControls = ({
  kokeet,
}: {
  kokeet: ValintakoeAvaimet[];
}) => {
  const {
    searchPhrase,
    setSearchPhrase,
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
        columnGap: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          columnGap: 2,
        }}
      >
        <SearchInput
          searchPhrase={searchPhrase}
          setSearchPhrase={setSearchPhrase}
          name="pistesyotto-search"
          flexGrow={4}
        />
        <OphFormControl
          sx={{
            width: 'auto',
            minWidth: '140px',
            textAlign: 'left',
          }}
          label={t('pistesyotto.koe')}
          renderInput={({ labelId }) => (
            <LocalizedSelect
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
            <LocalizedSelect
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
      <Box sx={{ marginY: 1 }}>
        <OphCheckbox
          checked={naytaVainLaskentaanVaikuttavat}
          onChange={changeNaytaVainLaskentaanVaikuttavat}
          label={t('pistesyotto.laskentaanVaikuttavat')}
        />
      </Box>
    </Box>
  );
};
