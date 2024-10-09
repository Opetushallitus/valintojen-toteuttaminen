'use client';
import { Suspense, useMemo } from 'react';

import { Select, SelectChangeEvent, Box, InputAdornment } from '@mui/material';

import { Tila, getHakuAlkamisKaudet } from '@/app/lib/types/kouta-types';
import { useHakuSearchParams } from '@/app/hooks/useHakuSearch';
import { useHakutavat } from '@/app/hooks/useHakutavat';
import { useTranslations } from '@/app/hooks/useTranslations';
import { OphFormControl } from '@/app/components/form/oph-form-control';
import { SpinnerIcon } from '@/app/components/spinner-icon';
import { LocalizedSelect } from '@/app/components/localized-select';
import { SearchInput } from '@/app/components/search-input';

const HakutapaSelect = ({
  labelId,
  value: selectedHakutapa,
  onChange,
}: {
  labelId: string;
  value: string;
  onChange: (e: SelectChangeEvent) => void;
}) => {
  const { data: hakutavat } = useHakutavat();

  const { translateEntity } = useTranslations();

  const hakutapaOptions = hakutavat.map((tapa) => {
    return { value: tapa.koodiUri, label: translateEntity(tapa.nimi) };
  });

  return (
    <LocalizedSelect
      labelId={labelId}
      id="hakutapa-select"
      value={selectedHakutapa ?? ''}
      onChange={onChange}
      options={hakutapaOptions}
      clearable
    />
  );
};

const SelectFallback = () => (
  <Select
    disabled={true}
    startAdornment={
      <InputAdornment position="start">
        <SpinnerIcon />
      </InputAdornment>
    }
  />
);

const HakutapaInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: SelectChangeEvent) => void;
}) => {
  const { t } = useTranslations();
  return (
    <OphFormControl
      label={t('haku.hakutapa')}
      sx={{ flex: '1 0 180px', textAlign: 'left' }}
      renderInput={({ labelId }) => (
        <Suspense fallback={<SelectFallback />}>
          <HakutapaSelect labelId={labelId} value={value} onChange={onChange} />
        </Suspense>
      )}
    />
  );
};

export default function HakuControls() {
  const alkamiskaudet = useMemo(getHakuAlkamisKaudet, []);

  const {
    searchPhrase,
    setSearchPhrase,
    selectedAlkamisKausi,
    setSelectedAlkamisKausi,
    selectedHakutapa,
    setSelectedHakutapa,
    tila,
    setTila,
  } = useHakuSearchParams();

  const { t } = useTranslations();

  const changeTila = (e: SelectChangeEvent) => {
    setTila(e.target.value);
  };

  const changeHakutapa = (e: SelectChangeEvent) => {
    setSelectedHakutapa(e.target.value);
  };

  const changeAlkamisKausi = (e: SelectChangeEvent) => {
    setSelectedAlkamisKausi(e.target.value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'stretch',
        gap: 2,
        marginBottom: 2,
        flexWrap: 'wrap',
        alignItems: 'flex-end',
      }}
    >
      <SearchInput
        searchPhrase={searchPhrase}
        setSearchPhrase={setSearchPhrase}
        name="haku-search"
        sx={{ flexGrow: 4, minWidth: '180px' }}
        label="haku.hae"
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
            labelId={labelId}
            value={tila ?? ''}
            onChange={changeTila}
            options={Object.values(Tila).map((tila) => {
              return {
                value: tila,
                label: t(tila),
              };
            })}
            clearable
          />
        )}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'stretch',
          gap: 2,
          flex: '1 0 400px',
          alignItems: 'flex-end',
        }}
      >
        <HakutapaInput value={selectedHakutapa} onChange={changeHakutapa} />
        <OphFormControl
          label={t('haku.alkamiskausi')}
          sx={{ textAlign: 'left', flex: '1 0 180px' }}
          renderInput={({ labelId }) => (
            <LocalizedSelect
              labelId={labelId}
              value={selectedAlkamisKausi ?? ''}
              onChange={changeAlkamisKausi}
              options={alkamiskaudet.map((kausi) => {
                return {
                  value: kausi.value,
                  label: `${kausi.alkamisVuosi} ${t(kausi.alkamisKausiNimi)}`,
                };
              })}
              clearable
            />
          )}
        />
      </Box>
    </Box>
  );
}
