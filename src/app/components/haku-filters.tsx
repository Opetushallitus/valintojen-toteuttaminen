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
  InputAdornment,
  IconButton,
} from '@mui/material';

import {
  Haku,
  HaunAlkaminen,
  Tila,
  getHakuAlkamisKaudet,
} from '../lib/kouta-types';
import { Koodi } from '../lib/koodisto';
import { HakuList } from './haku-table';
import { Language, TranslatedName, getTranslation } from '../lib/common';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getHaut } from '../lib/kouta';
import { useDebounce } from '@/app/hooks/useDebounce';
import { parseAsBoolean, parseAsInteger, useQueryState } from 'nuqs';
import { useHasChanged } from '@/app/hooks/useHasChanged';
import { getSortParts } from './table/list-table';
import { Search } from '@mui/icons-material';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isTranslatedName(value: unknown): value is TranslatedName {
  return (
    isObject(value) &&
    (typeof value?.fi === 'string' ||
      typeof value?.sv === 'string' ||
      typeof value?.en === 'string')
  );
}

const byProp = <T extends Record<string, string | number | TranslatedName>>(
  key: string,
  direction: 'asc' | 'desc' = 'asc',
  lng: Language,
) => {
  const asc = direction === 'asc';
  return (a: T, b: T) => {
    const aKey = a[key];
    const aProp = isTranslatedName(aKey) ? getTranslation(aKey, lng) : aKey;

    const bKey = b[key];
    const bProp = isTranslatedName(bKey) ? getTranslation(bKey, lng) : bKey;

    return aProp > bProp ? (asc ? 1 : -1) : bProp > aProp ? (asc ? -1 : 1) : 0;
  };
};

const alkamisKausiMatchesSelected = (
  haku: Haku,
  selectedAlkamisKausi?: HaunAlkaminen,
): boolean =>
  !selectedAlkamisKausi ||
  (haku.alkamisVuosi === selectedAlkamisKausi.alkamisVuosi &&
    haku.alkamisKausiKoodiUri.startsWith(
      selectedAlkamisKausi.alkamisKausiKoodiUri,
    ));

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

  return <HakuFiltersInternal haut={haut} hakutavat={hakutavat} />;
};

const PAGE_SIZES = [10, 20, 30, 50, 100];

const DEFAULT_PAGE_SIZE = 30;

const DEFAULT_NUQS_OPTIONS = {
  history: 'push',
  clearOnDefault: true,
} as const;

const useHakuSearch = (
  haut: Array<Haku>,
  alkamiskaudet: Array<HaunAlkaminen>,
) => {
  const [searchPhrase, setSearchPhrase] = useQueryState(
    'search',
    DEFAULT_NUQS_OPTIONS,
  );

  const setSearchDebounce = useDebounce(setSearchPhrase, 500);

  const [myosArkistoidut, setMyosArkistoidut] = useQueryState(
    'arkistoidut',
    parseAsBoolean.withDefault(false).withOptions(DEFAULT_NUQS_OPTIONS),
  );

  const [selectedHakutapa, setSelectedHakutapa] = useQueryState(
    'hakutapa',
    DEFAULT_NUQS_OPTIONS,
  );

  const [selectedAlkamisKausi, setSelectedAlkamisKausi] = useQueryState(
    'alkamiskausi',
    DEFAULT_NUQS_OPTIONS,
  );

  const [page, setPage] = useQueryState<number>(
    'page',
    parseAsInteger.withDefault(1).withOptions(DEFAULT_NUQS_OPTIONS),
  );

  const [pageSize, setPageSize] = useQueryState(
    'page_size',
    parseAsInteger
      .withDefault(DEFAULT_PAGE_SIZE)
      .withOptions(DEFAULT_NUQS_OPTIONS),
  );

  const [sort, setSort] = useQueryState('sort', DEFAULT_NUQS_OPTIONS);

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

    const { orderBy, direction } = getSortParts(sort ?? '');

    const filtered = haut.filter(
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
    return orderBy && direction
      ? filtered.sort(byProp(orderBy, direction, Language.FI))
      : filtered;
  }, [
    haut,
    searchPhrase,
    myosArkistoidut,
    selectedAlkamisKausi,
    selectedHakutapa,
    alkamiskaudet,
    sort,
  ]);

  const pageResults = useMemo(() => {
    const start = pageSize * (page - 1);
    return results.slice(start, start + pageSize);
  }, [results, page, pageSize]);

  console.log({ results, pageResults, pageSize, page });

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
    sort,
    setSort,
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
    sort,
    setSort,
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
            key={searchPhrase}
            defaultValue={searchPhrase}
            onChange={handleSearchChange}
            autoFocus={true}
            type="text"
            placeholder="Hae hakuja"
            endAdornment={
              <InputAdornment position="end">
                <IconButton>
                  <Search />
                </IconButton>
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
      <HakuListFrame
        totalCount={results?.length ?? 0}
        pageNumber={page}
        setPageNumber={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
      >
        <HakuList
          haut={pageResults}
          hakutavat={hakutavat}
          setSort={setSort}
          sort={sort ?? ''}
        />
      </HakuListFrame>
    </>
  );
};

export default HakuFilters;
