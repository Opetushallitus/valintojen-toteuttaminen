'use client';
import React, { ChangeEvent, useCallback, useEffect, useMemo } from 'react';

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
import { useDebounce } from '@/app//hooks/useDebounce';
import { usePrevious } from '@/app/hooks/usePrevious';

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

  const previousValue = usePrevious(value);

  const setValue = (value?: string) => {
    if (!value || value === defaultValue) {
      removeQueryParam(name);
    } else {
      setQueryParam(name, value);
    }
  };

  return [value, setValue, value !== previousValue] as const;
};

const useHakuSearch = (
  haut: Array<Haku>,
  alkamiskaudet: Array<HaunAlkaminen>,
) => {
  const [searchPhrase, setSearchPhrase, searchPhraseChanged] =
    useQueryParamState('search', '');

  const setSearchDebounce = useDebounce(setSearchPhrase, 500);

  const [myosArkistoidut, setMyosArkistoidut, myosArkistuidutChanged] =
    useQueryParamState('arkistoidut', 'false');

  const setMyosArkistoidutBoolean = useCallback(
    (value: boolean) => {
      setMyosArkistoidut(value ? 'true' : 'false');
    },
    [setMyosArkistoidut],
  );

  const [selectedHakutapa, setSelectedHakutapa, selectedHakutapaChanged] =
    useQueryParamState('hakutapa', '');

  const [
    selectedAlkamisKausi,
    setSelectedAlkamisKausi,
    selectedAlkamisKausiChanged,
  ] = useQueryParamState('alkamiskausi', '');

  const [page, setPage] = useQueryParamState('page', '1');

  const setPageNum = useCallback(
    (pageNum: number) => {
      setPage(pageNum.toString());
    },
    [setPage],
  );

  const pageNum = parseInt(page, 10);

  const [pageSize, setPageSize] = useQueryParamState('page_size', '50');

  const setPageSizeNum = useCallback(
    (pageSize: number) => {
      setPageSize(pageSize.toString());
    },
    [setPageSize],
  );

  useEffect(() => {
    if (
      searchPhraseChanged ||
      myosArkistuidutChanged ||
      selectedHakutapaChanged ||
      selectedAlkamisKausiChanged
    ) {
      setPageNum(1);
    }
  }, [
    searchPhraseChanged,
    myosArkistuidutChanged,
    selectedHakutapaChanged,
    selectedAlkamisKausiChanged,
    setPageNum,
  ]);

  const myosArkistoidutBoolean = myosArkistoidut === ' true';

  const results = useMemo(() => {
    const tilat = myosArkistoidutBoolean
      ? [Tila.JULKAISTU, Tila.ARKISTOITU]
      : [Tila.JULKAISTU];
    return haut.filter(
      (haku: Haku) =>
        tilat.includes(haku.tila) &&
        getTranslation(haku.nimi).toLowerCase().includes(searchPhrase) &&
        alkamisKausiMatchesSelected(
          haku,
          alkamiskaudet.find((k) => k.value === selectedAlkamisKausi),
        ) &&
        haku.hakutapaKoodiUri.startsWith(selectedHakutapa),
    );
  }, [
    haut,
    searchPhrase,
    myosArkistoidutBoolean,
    selectedAlkamisKausi,
    selectedHakutapa,
    alkamiskaudet,
  ]);

  const pageSizeNum = parseInt(pageSize, 10);

  const pageResults = useMemo(() => {
    const start = pageSizeNum * (pageNum - 1);
    return results.slice(start, start + pageSizeNum);
  }, [results, pageNum, pageSizeNum]);

  return {
    searchPhrase,
    setSearchPhrase: setSearchDebounce,
    myosArkistoidut,
    setMyosArkistoidut: setMyosArkistoidutBoolean,
    selectedHakutapa,
    setSelectedHakutapa,
    selectedAlkamisKausi,
    setSelectedAlkamisKausi,
    page: pageNum,
    setPage: setPageNum,
    pageSize,
    setPageSize: setPageSizeNum,
    pageCount: Math.ceil(results.length / pageSizeNum),
    pageResults,
    results,
  };
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
    pageCount,
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
          <FormControl
            size="small"
            sx={{ m: 1, minWidth: 180, textAlign: 'left' }}
          >
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
          <FormControl
            size="small"
            sx={{ m: 1, minWidth: 180, textAlign: 'left' }}
          >
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
          <FormControl
            size="small"
            sx={{ m: 1, minWidth: 180, textAlign: 'left' }}
          >
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
      {results && results.length === 0 ? (
        <p>Ei hakutuloksia</p>
      ) : (
        <>
          <Typography component="p" sx={{ textAlign: 'left' }}>
            Hakuja: {results.length}
          </Typography>
          <Pagination
            aria-label="top pagination"
            count={pageCount}
            page={page}
            onChange={(_e: unknown, value: number) => {
              setPage(value);
            }}
          />
          <HakuList haut={pageResults} hakutavat={hakutavat} />
          <Pagination
            aria-label="bottom pagination"
            count={pageCount}
            page={page}
            onChange={(_e: unknown, value: number) => {
              setPage(value);
            }}
          />
        </>
      )}
    </div>
  );
};

export default HakuFilters;
