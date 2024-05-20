'use client';
import React, { ChangeEvent, Suspense, useMemo } from 'react';

import {
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormLabel,
  OutlinedInput,
  Box,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import { Tila, getHakuAlkamisKaudet } from '@/app/lib/kouta-types';
import { Search } from '@mui/icons-material';
import { useHakuSearchParams } from '@/app/hooks/useHakuSearch';
import { useHakutavat } from '@/app/hooks/useHakutavat';
import { useTranslation } from 'react-i18next';
import { useUserLanguage } from '@/app/hooks/useAsiointiKieli';
import { translateName } from '@/app/lib/localization/translation-utils';

const HakutapaSelect = ({
  value: selectedHakutapa,
  onChange,
}: {
  value: string;
  onChange: (e: SelectChangeEvent) => void;
}) => {
  const { data: hakutavat } = useHakutavat();
  const userLanguage = useUserLanguage();
  const { t } = useTranslation();

  return (
    <Select
      labelId="hakutapa-select-label"
      name="hakutapa-select"
      value={selectedHakutapa ?? ''}
      onChange={onChange}
      displayEmpty={true}
    >
      <MenuItem value="">{t('common.choose')}</MenuItem>
      {hakutavat.map((tapa) => {
        return (
          <MenuItem value={tapa.koodiUri} key={tapa.koodiUri}>
            {translateName(tapa.nimi, userLanguage)}
          </MenuItem>
        );
      })}
    </Select>
  );
};

const SelectFallback = () => (
  <Select
    disabled={true}
    startAdornment={
      <InputAdornment position="start">
        <CircularProgress
          sx={{ height: '24px !important', width: '24px !important' }}
        />
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
  const { t } = useTranslation();
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

  const { t } = useTranslation();

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
        <FormLabel htmlFor="haku-search">{t('haku.search')}</FormLabel>
        <OutlinedInput
          id="haku-search"
          name="haku-search"
          defaultValue={searchPhrase}
          onChange={handleSearchChange}
          autoFocus={true}
          type="text"
          placeholder={t('haku.search')}
          endAdornment={
            <InputAdornment position="end">
              <Search />
            </InputAdornment>
          }
        />
      </FormControl>
      <FormControl
        sx={{
          width: 'auto',
          minWidth: '140px',
          textAlign: 'left',
        }}
      >
        <FormLabel id="tila-select-label">{t('common.status')}</FormLabel>
        <Select
          labelId="tila-select-label"
          name="tila-select"
          value={tila ?? ''}
          onChange={changeTila}
          displayEmpty={true}
        >
          <MenuItem value="">{t('common.choose')}</MenuItem>
          {Object.values(Tila).map((tila) => {
            return (
              <MenuItem value={tila} key={tila}>
                {t(tila)}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <Box
        display="flex"
        justifyContent="stretch"
        gap={2}
        flex="1 0 400px"
        alignItems="flex-end"
      >
        <HakutapaInput value={selectedHakutapa} onChange={changeHakutapa} />
        <FormControl sx={{ textAlign: 'left', flex: '1 0 180px' }}>
          <FormLabel id="alkamiskausi-select-label">
            {t('haku.alkamiskausi')}
          </FormLabel>
          <Select
            labelId="alkamiskausi-select-label"
            name="alkamiskausi-select"
            value={selectedAlkamisKausi ?? ''}
            onChange={changeAlkamisKausi}
            displayEmpty={true}
          >
            <MenuItem value="">{t('common.choose')}</MenuItem>
            {alkamiskaudet.map((kausi) => {
              const kausiVuosi = `${kausi.alkamisVuosi} ${t(kausi.alkamisKausiNimi)}`;
              return (
                <MenuItem value={kausi.value} key={kausi.value}>
                  {kausiVuosi}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}
