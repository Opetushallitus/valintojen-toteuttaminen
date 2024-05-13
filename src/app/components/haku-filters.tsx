'use client';
import React, { ChangeEvent, useMemo } from 'react';

import {
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormLabel,
  OutlinedInput,
  Checkbox,
  FormControlLabel,
  Box,
  InputAdornment,
} from '@mui/material';

import { getHakuAlkamisKaudet } from '../lib/kouta-types';
import { Koodi } from '../lib/koodisto';
import { HakuTable } from './haku-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getHaut } from '../lib/kouta';
import { Search } from '@mui/icons-material';
import { useHakuSearch } from '../hooks/useHakuSearch';
import { HakuTablePaginationWrapper } from './haku-table-pagination-wrapper';

const KAUSI_MAPPING = Object.freeze({
  kausi_s: {
    fi: 'Syksy',
    sv: 'Höst',
    en: 'Autumn',
  },
  kausi_k: {
    fi: 'Kevät',
    sv: 'Vår',
    en: 'Spring',
  },
});

const getKausiVuosiTranslation = (kausiUri: string, vuosi: number) => {
  if (kausiUri === 'kausi_s' || kausiUri === 'kausi_k') {
    const kausiName = KAUSI_MAPPING?.[kausiUri];
    return {
      fi: `${vuosi} ${kausiName.fi}`,
      sv: `${vuosi} ${kausiName.sv}`,
      en: `${vuosi} ${kausiName.en}`,
    };
  }
};

export const HakuFilters = ({ hakutavat }: { hakutavat: Array<Koodi> }) => {
  const { data: haut } = useSuspenseQuery({
    queryKey: ['getHaut'],
    queryFn: () => getHaut(),
    select: (haut) =>
      haut.map((haku) => ({
        ...haku,
        hakutapaNimi: hakutavat.find(
          (hakutapa) => hakutapa.koodiUri === haku.hakutapaKoodiUri,
        )?.nimi,
        alkamiskausiNimi: getKausiVuosiTranslation(
          haku.alkamisKausiKoodiUri?.split('#')?.[0],
          haku.alkamisVuosi,
        ),
      })),
  });

  const alkamiskaudet = useMemo(getHakuAlkamisKaudet, []);

  const {
    searchPhrase,
    setSearchPhrase,
    selectedAlkamisKausi,
    setSelectedAlkamisKausi,
    selectedHakutapa,
    setSelectedHakutapa,
    myosArkistoidut,
    setMyosArkistoidut,
    page,
    setPage,
    pageSize,
    setPageSize,
    results,
    pageResults,
    sort,
    setSort,
  } = useHakuSearch(haut, alkamiskaudet);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchPhrase(e.target.value);
  };

  const toggleMyosArkistoidut = (_e: unknown, checked: boolean) => {
    setMyosArkistoidut(checked);
  };

  const changeHakutapa = (e: SelectChangeEvent) => {
    setSelectedHakutapa(e.target.value);
  };

  const changeAlkamisKausi = (e: SelectChangeEvent) => {
    setSelectedAlkamisKausi(e.target.value);
  };

  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        gap={2}
        flexWrap="wrap"
      >
        <FormControl
          sx={{
            flexGrow: 2,
            minWidth: '180px',
            textAlign: 'left',
          }}
        >
          <FormLabel htmlFor="haku-search">Hae hakuja</FormLabel>
          <OutlinedInput
            id="haku-search"
            name="haku-search"
            defaultValue={searchPhrase}
            onChange={handleSearchChange}
            autoFocus={true}
            type="text"
            placeholder="Hae hakuja"
            endAdornment={
              <InputAdornment position="end">
                <Search />
              </InputAdornment>
            }
          />
          <FormControlLabel
            label="Myös arkistoidut"
            control={
              <Checkbox
                data-testid="haku-tila-toggle"
                checked={myosArkistoidut ?? false}
                onChange={toggleMyosArkistoidut}
              />
            }
          />
        </FormControl>
        <FormControl sx={{ minWidth: '180px', textAlign: 'left' }}>
          <FormLabel id="hakutapa-select-label">Hakutapa</FormLabel>
          <Select
            labelId="hakutapa-select-label"
            name="hakutapa-select"
            value={selectedHakutapa ?? ''}
            onChange={changeHakutapa}
            displayEmpty={true}
          >
            <MenuItem value="">Valitse...</MenuItem>
            {hakutavat.map((tapa) => {
              return (
                <MenuItem value={tapa.koodiUri} key={tapa.koodiUri}>
                  {tapa.nimi.fi}
                </MenuItem>
              ); //TODO: translate
            })}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: '180px', textAlign: 'left' }}>
          <FormLabel id="alkamiskausi-select-label">
            Koulutuksen alkamiskausi
          </FormLabel>
          <Select
            labelId="alkamiskausi-select-label"
            name="alkamiskausi-select"
            value={selectedAlkamisKausi ?? ''}
            onChange={changeAlkamisKausi}
            displayEmpty={true}
          >
            <MenuItem value="">Valitse...</MenuItem>
            {alkamiskaudet.map((kausi) => {
              const vuosiKausi = `${kausi.alkamisVuosi} ${kausi.alkamisKausiNimi}`;
              return (
                <MenuItem value={kausi.value} key={kausi.value}>
                  {vuosiKausi}
                </MenuItem>
              ); //TODO: translate
            })}
          </Select>
        </FormControl>
      </Box>
      <HakuTablePaginationWrapper
        totalCount={results?.length ?? 0}
        pageNumber={page}
        setPageNumber={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
      >
        <HakuTable
          haut={pageResults}
          hakutavat={hakutavat}
          setSort={setSort}
          sort={sort ?? ''}
        />
      </HakuTablePaginationWrapper>
    </>
  );
};

export default HakuFilters;
