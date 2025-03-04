import { usePisteSyottoSearchParams } from '../hooks/usePisteSyottoSearch';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, SelectChangeEvent, Stack } from '@mui/material';
import { ValintakoeAvaimet } from '@/app/lib/valintaperusteet/valintaperusteet-types';
import { LocalizedSelect } from '@/app/components/localized-select';
import {
  OphCheckbox,
  OphFormFieldWrapper,
} from '@opetushallitus/oph-design-system';
import { SearchInput } from '@/app/components/search-input';
import { OsallistumisenTilaSelect } from '@/app/components/osallistumisen-tila-select';

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
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-end' }}>
        <SearchInput
          searchPhrase={searchPhrase}
          setSearchPhrase={setSearchPhrase}
          name="pistesyotto-search"
          sx={{ flexGrow: 4 }}
        />
        <OphFormFieldWrapper
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
        <OphFormFieldWrapper
          sx={{
            width: 'auto',
            minWidth: '140px',
            textAlign: 'left',
          }}
          label={t('yleinen.tila')}
          renderInput={({ labelId }) => (
            <OsallistumisenTilaSelect
              id="osallistumisen-tila-select"
              labelId={labelId}
              value={osallistumisenTila}
              onChange={changeOsallistumisenTila}
              clearable
            />
          )}
        />
      </Stack>
      <Box sx={{ marginY: 1 }}>
        <OphCheckbox
          checked={naytaVainLaskentaanVaikuttavat}
          onChange={changeNaytaVainLaskentaanVaikuttavat}
          label={t('pistesyotto.laskentaanVaikuttavat')}
        />
      </Box>
    </Stack>
  );
};
