'use client';
import React, { ChangeEvent, useMemo } from 'react';

import {
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormLabel,
  OutlinedInput,
  Box,
  InputAdornment,
} from '@mui/material';

import { Tila, getHakuAlkamisKaudet } from '../../lib/kouta-types';
import { Search } from '@mui/icons-material';
import { useHakuSearchParams } from '../../hooks/useHakuSearch';
import { useHakutavat } from '@/app/hooks/useHakutavat';

export default function HakuControls() {
  const { data: hakutavat } = useHakutavat();

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
      justifyContent="space-between"
      gap={2}
      flexWrap="wrap"
    >
      <Box
        display="flex"
        flexGrow={2}
        flexDirection="column"
        gap={1}
        alignItems="stretch"
      >
        <FormControl
          sx={{
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
        </FormControl>
        <FormControl
          sx={{ width: '150px', textAlign: 'left', alignSelf: 'flex-start' }}
        >
          <FormLabel id="tila-select-label">Tila</FormLabel>
          <Select
            labelId="tila-select-label"
            name="tila-select"
            value={tila ?? ''}
            onChange={changeTila}
            displayEmpty={true}
          >
            <MenuItem value="">Valitse...</MenuItem>
            {Object.values(Tila).map((tila) => {
              return (
                <MenuItem value={tila} key={tila}>
                  {tila}
                </MenuItem>
              ); //TODO: translate
            })}
          </Select>
        </FormControl>
      </Box>
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
  );
}
