'use client'
import { ChangeEvent, useState } from "react";

import { styled, FormControl, Button, Select, MenuItem, SelectChangeEvent, FormLabel, Input } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import { Haku, HaunAlkaminen, Tila, getHakuAlkamisKaudet } from "../lib/kouta-types";
import { Koodi } from "../lib/koodisto";
import { HakuList } from "./haku-table";
import { getTranslation } from "../lib/common";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getHaut } from "../lib/kouta";

const alkamisKausiMatchesSelected = (haku: Haku, selectedAlkamisKausi: HaunAlkaminen): boolean =>
  haku.alkamisVuosi === selectedAlkamisKausi.alkamisVuosi && haku.alkamisKausiKoodiUri.startsWith(selectedAlkamisKausi.alkamisKausiKoodiUri);

const StyledGridContainer = styled(Grid)(
  {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    marginBottom: '2rem'
  }
)

const StyledGrid = styled(Grid)(
  {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
    input: {
      width: '100%'
    },
    label: {
      fontWeight: 500,
      fontSize: '1rem'
    },
    flexWrap: 'nowrap',
    rowGap: '0.7rem'
  }
)

export const HakuFilters = ({hakutavat}: {hakutavat: Array<Koodi>}) => {
  const {data: haut} = useSuspenseQuery({
    queryKey: ['getHaut'],
    queryFn: () => getHaut(),
  })

  return <HakuFiltersInternal haut={haut} hakutavat={hakutavat}/>
}

const HakuFiltersInternal = ({haut, hakutavat}: {haut : Haku[], hakutavat: Koodi[]}) => {
  const [results, setResults] = useState<Haku[]>(haut.filter(h => h.tila === Tila.JULKAISTU));
  const [search, setSearch] = useState<string>('');
  const [selectedTila, setSelectedTila] = useState<Tila>(Tila.JULKAISTU);
  const [selectedAlkamisKausi, setSelectedAlkamisKausi] = useState<HaunAlkaminen>();
  const [selectedHakutapa, setSelectedHakutapa] = useState<Koodi>();

  const alkamisKaudet = getHakuAlkamisKaudet();

  const filterHaut = (search: string, tila: Tila, kausi: HaunAlkaminen | undefined, tapa : Koodi | undefined) => {
    const filteredValue = haut.filter((haku: Haku) =>
      haku.tila == tila && getTranslation(haku.nimi).toLowerCase().includes(search)
       && (!kausi || alkamisKausiMatchesSelected(haku, kausi))
       && (!tapa || haku.hakutapaKoodiUri.startsWith(tapa.koodiUri))
    );
    setResults(filteredValue);
  }

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { target } = e;

    const searchStr = target.value.trim().toLowerCase();
    setSearch(searchStr);
    filterHaut(searchStr, selectedTila, selectedAlkamisKausi, selectedHakutapa);
  };

  const toggleSearchActive = () => {
    const toggledTila = selectedTila == Tila.ARKISTOITU ? Tila.JULKAISTU : Tila.ARKISTOITU
    setSelectedTila(toggledTila);
    filterHaut(search, toggledTila, selectedAlkamisKausi, selectedHakutapa);
  }

  const changeHakutapa = (e: SelectChangeEvent) => {
    const idx = parseInt(e.target.value);
    const tapa = idx > -1? hakutavat[idx]: undefined;
    setSelectedHakutapa(tapa);
    filterHaut(search, selectedTila, selectedAlkamisKausi, tapa);
  }

  const changeAlkamisKausi = (e: SelectChangeEvent) => {
    const idx = parseInt(e.target.value);
    const kausi = idx > -1? alkamisKaudet[idx]: undefined;
    setSelectedAlkamisKausi(kausi);
    filterHaut(search, selectedTila, kausi, selectedHakutapa);
  }

  return (
    <div>
      <StyledGridContainer container spacing={2} direction="row">
        <StyledGrid container xs={6} direction="column">
          <FormControl size="small" sx={{ m: 1, minWidth: 180, textAlign: 'left'}}>
            <FormLabel htmlFor="haku-search">Hae hakuja</FormLabel>
            <Input
              data-test-id="haku-search"
              name="haku-search"
              onChange={handleSearchChange}
              type="text"
              placeholder="Hae hakuja"
            />
            <Button data-testid="haku-tila-toggle" onClick={toggleSearchActive}>{selectedTila === Tila.JULKAISTU ? 'Julkaistut' : 'Arkistoidut'}</Button>
          </FormControl>
        </StyledGrid>
        <StyledGrid container xs={2} direction="column">
          <FormControl size="small" sx={{ m: 1, minWidth: 180, textAlign: 'left'}}>
            <FormLabel htmlFor="hakutapa-select">Hakutapa</FormLabel>
            <Select data-testid="haku-hakutapa-select" name="hakutapa-select" onChange={changeHakutapa} defaultValue="-1">
              <MenuItem value={-1}>Valitse...</MenuItem>
              {hakutavat.map((tapa, index) => {
                return <MenuItem value={index} key={tapa.koodiUri}>{tapa.nimi.fi}</MenuItem> //TODO: translate
              })}
            </Select>
          </FormControl>
        </StyledGrid>
        <StyledGrid container xs={2} direction="column">
          <FormControl size="small" sx={{ m: 1, minWidth: 180, textAlign: 'left'}}>
            <FormLabel htmlFor="alkamiskausi-select">Koulutuksen alkamiskausi</FormLabel>
            <Select data-testid="haku-kausi-select" name="alkamiskausi-select" onChange={changeAlkamisKausi} defaultValue="-1">
              <MenuItem value={-1}>Valitse...</MenuItem>
              {alkamisKaudet.map((kausi, index) => {
                return <MenuItem value={index} key={kausi.alkamisVuosi + kausi.alkamisKausiKoodiUri}>{kausi.alkamisVuosi} {kausi.alkamisKausiNimi}</MenuItem> //TODO: translate
              })}
            </Select>
          </FormControl>
        </StyledGrid>
      </StyledGridContainer>
      {results && <HakuList haut={results} hakutavat={hakutavat}></HakuList>}
    </div>
  );
}

export default HakuFilters