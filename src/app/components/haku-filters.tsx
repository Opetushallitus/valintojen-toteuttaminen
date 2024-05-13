'use client';
import React, { ChangeEvent, useEffect, useMemo } from 'react';

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
  Pagination,
  Typography,
  Box,
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
import { useDebounce } from '@/app/hooks/useDebounce';
import { parseAsBoolean, parseAsInteger, useQueryState } from 'nuqs';
import { useHasChanged } from '@/app/hooks/useHasChanged';

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

const PAGE_SIZES = [10, 20, 30, 50, 100];

const DEFAULT_PAGE_SIZE = 30;

const useHakuSearch = (
  haut: Array<Haku>,
  alkamiskaudet: Array<HaunAlkaminen>,
) => {
  const [searchPhrase, setSearchPhrase] = useQueryState('search');

  const setSearchDebounce = useDebounce(setSearchPhrase, 500);

  const [myosArkistoidut, setMyosArkistoidut] = useQueryState(
    'arkistoidut',
    parseAsBoolean,
  );

  const [selectedHakutapa, setSelectedHakutapa] = useQueryState('hakutapa');

  const [selectedAlkamisKausi, setSelectedAlkamisKausi] =
    useQueryState('alkamiskausi');

  const [page, setPage] = useQueryState<number>(
    'page',
    parseAsInteger.withDefault(1),
  );

  const [pageSize, setPageSize] = useQueryState(
    'page_size',
    parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  );

  const myosArkistoidutChanged = useHasChanged(myosArkistoidut);
  const searchPhraseChanged = useHasChanged(searchPhrase);
  const selectedAlkamisKausiChanged = useHasChanged(selectedAlkamisKausi);
  const selectedHakutapaChanged = useHasChanged(selectedHakutapa);

  useEffect(() => {
    if (
      searchPhraseChanged ||
      myosArkistoidutChanged ||
      selectedHakutapaChanged ||
      selectedAlkamisKausiChanged
    ) {
      setPage(1);
    }
  }, [
    searchPhraseChanged,
    myosArkistoidutChanged,
    selectedHakutapaChanged,
    selectedAlkamisKausiChanged,
    setPage,
  ]);

  const results = useMemo(() => {
    const tilat = myosArkistoidut
      ? [Tila.JULKAISTU, Tila.ARKISTOITU]
      : [Tila.JULKAISTU];
    return haut.filter(
      (haku: Haku) =>
        tilat.includes(haku.tila) &&
        getTranslation(haku.nimi)
          .toLowerCase()
          .includes(searchPhrase ?? '') &&
        alkamisKausiMatchesSelected(
          haku,
          alkamiskaudet.find((k) => k.value === selectedAlkamisKausi),
        ) &&
        haku.hakutapaKoodiUri.startsWith(selectedHakutapa ?? ''),
    );
  }, [
    haut,
    searchPhrase,
    myosArkistoidut,
    selectedAlkamisKausi,
    selectedHakutapa,
    alkamiskaudet,
  ]);

  const pageResults = useMemo(() => {
    const start = pageSize * (page - 1);
    return results.slice(start, start + pageSize);
  }, [results, page, pageSize]);

  return {
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
    myosArkistoidut,
    setMyosArkistoidut: setMyosArkistoidut,
    selectedHakutapa,
    setSelectedHakutapa,
    selectedAlkamisKausi,
    setSelectedAlkamisKausi,
    page,
    setPage,
    pageSize,
    setPageSize,
    pageResults,
    results,
  };
};

type HakuListFrameProps = {
  totalCount: number;
  pageNumber: number;
  setPageNumber: (page: number) => void;
  pageSize: number;
  setPageSize: (page: number) => void;
  children: React.ReactNode;
};

const StyledPagination = styled(Pagination)({
  display: 'flex',
});

const HakuListFrame = ({
  totalCount,
  pageNumber,
  pageSize,
  setPageNumber,
  setPageSize,
  children,
}: HakuListFrameProps) => {
  const pageCount = Math.ceil(totalCount / pageSize);
  return totalCount === 0 ? (
    <p>Ei hakutuloksia</p>
  ) : (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography sx={{ textAlign: 'left' }}>Hakuja: {totalCount}</Typography>
        <FormControl>
          <FormLabel id="page-size-select-label">Näytä per sivu:</FormLabel>
          <Select
            labelId="page-size-select-label"
            name="page-size-select"
            value={pageSize.toString()}
            onChange={(e) => {
              const newValue = parseInt(e.target.value, 10);
              setPageSize(isNaN(newValue) ? DEFAULT_PAGE_SIZE : newValue);
            }}
          >
            {PAGE_SIZES.map((size) => {
              return (
                <MenuItem value={size} key={size}>
                  {size}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>
      <Box display="flex" flexDirection="column" rowGap={1} alignItems="center">
        <StyledPagination
          aria-label="top pagination"
          count={pageCount}
          page={pageNumber}
          onChange={(_e: unknown, value: number) => {
            setPageNumber(value);
          }}
        />
        {children}
        <StyledPagination
          aria-label="bottom pagination"
          count={pageCount}
          page={pageNumber}
          onChange={(_e: unknown, value: number) => {
            setPageNumber(value);
          }}
        />
      </Box>
    </>
  );
};

const HakuFiltersInternal = ({
  haut,
  hakutavat,
}: {
  haut: Haku[];
  hakutavat: Koodi[];
}) => {
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
  } = useHakuSearch(haut, alkamiskaudet);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const searchStr = e.target.value.trim().toLowerCase();
    setSearchPhrase(searchStr);
  };

  const toggleMyosArkistoidut = (_e: unknown, checked: boolean) => {
    setMyosArkistoidut(checked);
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
          <FormControl sx={{ m: 1, minWidth: 180, textAlign: 'left' }}>
            <FormLabel htmlFor="haku-search">Hae hakuja</FormLabel>
            <OutlinedInput
              id="haku-search"
              name="haku-search"
              key={searchPhrase}
              defaultValue={searchPhrase}
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
          <FormControl sx={{ m: 1, minWidth: 180, textAlign: 'left' }}>
            <FormLabel id="hakutapa-select-label">Hakutapa</FormLabel>
            <Select
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
          <FormControl sx={{ m: 1, minWidth: 180, textAlign: 'left' }}>
            <FormLabel id="alkamiskausi-select-label">
              Koulutuksen alkamiskausi
            </FormLabel>
            <Select
              labelId="alkamiskausi-select-label"
              name="alkamiskausi-select"
              value={selectedAlkamisKausi}
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
        </StyledGrid>
      </StyledGridContainer>
      <HakuListFrame
        totalCount={results?.length ?? 0}
        pageNumber={page}
        setPageNumber={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
      >
        <HakuList haut={pageResults} hakutavat={hakutavat} />
      </HakuListFrame>
    </div>
  );
};

export default HakuFilters;
