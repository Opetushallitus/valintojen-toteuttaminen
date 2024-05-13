'use client';
import React, { ChangeEvent, useMemo } from 'react';

import {
  styled,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormLabel,
  OutlinedInput,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import {
  Haku,
  HaunAlkaminen,
  Tila,
  getHakuAlkamisKaudet,
} from '../lib/kouta-types';
import { Koodi } from '../lib/koodisto';
import { HakuList } from './haku-table';
import { getTranslation } from '../lib/common';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getHaut } from '../lib/kouta';
import useQueryParams from '@/app/hooks/useQueryParams';
import { useDebounce } from '../hooks/useDebounce';

const alkamisKausiMatchesSelected = (
  haku: Haku,
  selectedAlkamisKausi?: HaunAlkaminen,
): boolean =>
  !selectedAlkamisKausi ||
  (haku.alkamisVuosi === selectedAlkamisKausi.alkamisVuosi &&
    haku.alkamisKausiKoodiUri.startsWith(
      selectedAlkamisKausi.alkamisKausiKoodiUri,
    ));

const StyledGridContainer = styled(Grid)({
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'nowrap',
  marginBottom: '2rem',
});

const StyledGrid = styled(Grid)({
  alignSelf: 'flex-start',
  alignItems: 'flex-start',
  alignContent: 'flex-start',
  justifyContent: 'flex-start',
  input: {
    width: '100%',
  },
  label: {
    fontWeight: 500,
    fontSize: '1rem',
  },
  flexWrap: 'nowrap',
  rowGap: '0.7rem',
});

export const HakuFilters = ({ hakutavat }: { hakutavat: Array<Koodi> }) => {
  const { data: haut } = useSuspenseQuery({
    queryKey: ['getHaut'],
    queryFn: () => getHaut(),
  });

  return <HakuFiltersInternal haut={haut} hakutavat={hakutavat} />;
};

const useQueryParamState = <T extends string>(name: string, emptyValue?: T) => {
  const defaultValue = emptyValue ?? '';
  const { queryParams, setQueryParam, removeQueryParam } = useQueryParams();
  const value = queryParams.get(name) ?? defaultValue;

  const setValue = (value?: string) => {
    if (!value || value === defaultValue) {
      removeQueryParam(name);
    } else {
      setQueryParam(name, value);
    }
  };

  return [value, setValue] as const;
};

const HakuFiltersInternal = ({
  haut,
  hakutavat,
}: {
  haut: Haku[];
  hakutavat: Koodi[];
}) => {
  const [search, setSearch] = useQueryParamState('search', '');

  const setSearchDebounce = useDebounce(setSearch, 500);

  const [myosArkistoidut, setMyosArkistoidut] = useQueryParamState(
    'arkistoidut',
    'false',
  );

  const [selectedHakutapa, setSelectedHakutapa] = useQueryParamState(
    'hakutapa',
    '',
  );

  const [selectedAlkamisKausi, setSelectedAlkamisKausi] = useQueryParamState(
    'alkamiskausi',
    '',
  );

  const alkamiskaudet = useMemo(getHakuAlkamisKaudet, []);

  const results = useMemo(() => {
    const tilat =
      myosArkistoidut === 'true'
        ? [Tila.JULKAISTU, Tila.ARKISTOITU]
        : [Tila.JULKAISTU];
    return haut.filter(
      (haku: Haku) =>
        tilat.includes(haku.tila) &&
        getTranslation(haku.nimi).toLowerCase().includes(search) &&
        alkamisKausiMatchesSelected(
          haku,
          alkamiskaudet.find((k) => k.value === selectedAlkamisKausi),
        ) &&
        haku.hakutapaKoodiUri.startsWith(selectedHakutapa),
    );
  }, [
    haut,
    search,
    myosArkistoidut,
    selectedAlkamisKausi,
    selectedHakutapa,
    alkamiskaudet,
  ]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const searchStr = e.target.value.trim().toLowerCase();
    setSearchDebounce(searchStr);
  };

  const toggleMyosArkistoidut = (_e: unknown, checked: boolean) => {
    setMyosArkistoidut(checked ? 'true' : 'false');
  };

  const changeHakutapa = (e: SelectChangeEvent) => {
    const tapaKoodiUri = e.target.value;
    setSelectedHakutapa(tapaKoodiUri);
  };

  const changeAlkamisKausi = (e: SelectChangeEvent) => {
    setSelectedAlkamisKausi(e.target.value);
  };

  return (
    <div>
      <StyledGridContainer container spacing={2} direction="row">
        <StyledGrid container xs={6} direction="column">
          <FormControl
            size="small"
            sx={{ m: 1, minWidth: 180, textAlign: 'left' }}
          >
            <FormLabel htmlFor="haku-search">Hae hakuja</FormLabel>
            <OutlinedInput
              data-test-id="haku-search"
              id="haku-search"
              name="haku-search"
              key={search}
              defaultValue={search}
              onChange={handleSearchChange}
              autoFocus={true}
              type="text"
              placeholder="Hae hakuja"
            />
            <FormControlLabel
              label="Myös arkistoidut"
              control={
                <Checkbox
                  data-testid="haku-tila-toggle"
                  checked={myosArkistoidut === 'true'}
                  onChange={toggleMyosArkistoidut}
                />
              }
            />
          </FormControl>
        </StyledGrid>
        <StyledGrid container xs={2} direction="column">
          <FormControl
            size="small"
            sx={{ m: 1, minWidth: 180, textAlign: 'left' }}
          >
            <FormLabel id="hakutapa-select-label">Hakutapa</FormLabel>
            <Select
              data-testid="haku-hakutapa-select"
              labelId="hakutapa-select-label"
              name="hakutapa-select"
              value={selectedHakutapa}
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
        </StyledGrid>
        <StyledGrid container xs={2} direction="column">
          <FormControl
            size="small"
            sx={{ m: 1, minWidth: 180, textAlign: 'left' }}
          >
            <FormLabel id="alkamiskausi-select-label">
              Koulutuksen alkamiskausi
            </FormLabel>
            <Select
              data-testid="haku-kausi-select"
              labelId="alkamiskausi-select-label"
              name="alkamiskausi-select"
              displayEmpty={true}
              onChange={changeAlkamisKausi}
              defaultValue=""
            >
              <MenuItem value="">Valitse...</MenuItem>
              {alkamiskaudet.map((kausi) => {
                return (
                  <MenuItem value={kausi.value} key={kausi.value}>
                    {kausi.alkamisKausiNimi} {kausi.alkamisVuosi}
                  </MenuItem>
                ); //TODO: translate
              })}
            </Select>
          </FormControl>
        </StyledGrid>
      </StyledGridContainer>
      {results && results.length === 0 ? (
        <p>Ei hakutuloksia</p>
      ) : (
        <HakuList haut={results} hakutavat={hakutavat}></HakuList>
      )}
    </div>
  );
};

export default HakuFilters;
