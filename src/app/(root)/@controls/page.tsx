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

import { getHakuAlkamisKaudet } from '../../lib/kouta-types';
import { Search } from '@mui/icons-material';
import { useHakuSearchParams } from '../../hooks/useHakuSearch';
import { useHakutavat } from '@/app/hooks/useHakutavat';

export default function HakuControls() {
  const alkamiskaudet = useMemo(getHakuAlkamisKaudet, []);

  const { data: hakutavat } = useHakutavat();

  const {
    searchPhrase,
    setSearchPhrase,
    selectedAlkamisKausi,
    setSelectedAlkamisKausi,
    selectedHakutapa,
    setSelectedHakutapa,
    myosArkistoidut,
    setMyosArkistoidut,
  } = useHakuSearchParams();

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
  );
}
