'use client';
import React, { ChangeEvent, Suspense, useMemo } from 'react';

import {
  FormControl,
  Select,
  SelectChangeEvent,
  FormLabel,
  OutlinedInput,
  Box,
  InputAdornment,
} from '@mui/material';

import { Tila, getHakuAlkamisKaudet } from '@/app/lib/kouta-types';
import { Search } from '@mui/icons-material';
import { useHakuSearchParams } from '@/app/hooks/useHakuSearch';
import { useHakutavat } from '@/app/hooks/useHakutavat';
import { useTranslations } from '@/app/hooks/useTranslations';
import { OphSelectControl, OphSelect } from '@/app/components/oph-select';
import { Spinner } from '@/app/components/spinner';

const HakutapaSelect = ({
  value: selectedHakutapa,
  onChange,
}: {
  value: string;
  onChange: (e: SelectChangeEvent) => void;
}) => {
  const { data: hakutavat } = useHakutavat();

  const { translateEntity } = useTranslations();

  const hakutapaOptions = hakutavat.map((tapa) => {
    return { value: tapa.koodiUri, label: translateEntity(tapa.nimi) };
  });

  return (
    <OphSelect
      labelId="hakutapa-select-label"
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
        <Spinner sx={{ height: '24px !important', width: '24px !important' }} />
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
    <FormControl sx={{ flex: '1 0 180px', textAlign: 'left' }}>
      <FormLabel id="hakutapa-select-label">{t('haku.hakutapa')}</FormLabel>
      <Suspense fallback={<SelectFallback />}>
        <HakutapaSelect value={value} onChange={onChange} />
      </Suspense>
    </FormControl>
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

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchPhrase(e.target.value);
  };

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
      display="flex"
      flexDirection="row"
      justifyContent="stretch"
      gap={2}
      marginBottom={2}
      flexWrap="wrap"
      alignItems="flex-end"
    >
      <FormControl
        sx={{
          flexGrow: 4,
          minWidth: '180px',
          textAlign: 'left',
        }}
      >
        <FormLabel htmlFor="haku-search">{t('haku.hae')}</FormLabel>
        <OutlinedInput
          id="haku-search"
          name="haku-search"
          defaultValue={searchPhrase}
          onChange={handleSearchChange}
          autoFocus={true}
          type="text"
          placeholder={t('haku.hae')}
          endAdornment={
            <InputAdornment position="end">
              <Search />
            </InputAdornment>
          }
        />
      </FormControl>
      <OphSelectControl
        formControlProps={{
          sx: {
            width: 'auto',
            minWidth: '140px',
            textAlign: 'left',
          },
        }}
        id="tila-select"
        label={t('yleinen.tila')}
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
      <Box
        display="flex"
        justifyContent="stretch"
        gap={2}
        flex="1 0 400px"
        alignItems="flex-end"
      >
        <HakutapaInput value={selectedHakutapa} onChange={changeHakutapa} />
        <OphSelectControl
          formControlProps={{
            sx: { textAlign: 'left', flex: '1 0 180px' },
          }}
          clearable
          label={t('haku.alkamiskausi')}
          id="alkamiskausi-select"
          value={selectedAlkamisKausi ?? ''}
          onChange={changeAlkamisKausi}
          options={alkamiskaudet.map((kausi) => ({
            value: kausi.value,
            label: `${kausi.alkamisVuosi} ${t(kausi.alkamisKausiNimi)}`,
          }))}
        />
      </Box>
    </Box>
  );
}
