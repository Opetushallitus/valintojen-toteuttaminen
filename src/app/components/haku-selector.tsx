'use client'
import { ChangeEvent, useState } from "react";

import { styled } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

import { Haku, HaunAlkaminen, Tila, getHakuAlkamisKaudet } from "../lib/kouta";
import { Koodi } from "../lib/koodisto";
import { HakuList } from "./haku-list";
import { getTranslation } from "../lib/common";

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

export const HakuSelector = ({haut, hakutavat}: {haut : Haku[], hakutavat: Koodi[]}) =>{

  const [results, setResults] = useState<Haku[]>(haut.filter(h => h.tila === Tila.JULKAISTU));
  const [search, setSearch] = useState<string>('');
  const [selectedTila, setSelectedTila] = useState<Tila>(Tila.JULKAISTU);
  const [selectedAlkamisKausi, setSelectedAlkamisKausi] = useState<HaunAlkaminen | undefined>();
  const [selectedHakutapa, setSelectedHakutapa] = useState<Koodi | undefined>();

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

  const changeHakutapa = (e: ChangeEvent<HTMLSelectElement>) => {
    const tapa = e.target.value? hakutavat[parseInt(e.target.value)]: undefined;
    setSelectedHakutapa(tapa);
    filterHaut(search, selectedTila, selectedAlkamisKausi, tapa);
  }

  const changeAlkamisKausi = (e: ChangeEvent<HTMLSelectElement>) => {
    const kausi = e.target.value? alkamisKaudet[parseInt(e.target.value)]: undefined;
    setSelectedAlkamisKausi(kausi);
    filterHaut(search, selectedTila, kausi, selectedHakutapa);
  }

  return (
    <div>
      <StyledGridContainer container spacing={2} direction="row">
        <StyledGrid container xs={6} direction="column">
          <label htmlFor="haku-select">Hae hakuja</label>
          <input
            name="haku-select"
            onChange={handleSearchChange}
            type="text"
            placeholder="Hae hakuja"
          />
          <button data-testid="haku-tila-toggle" onClick={toggleSearchActive}>{selectedTila === Tila.JULKAISTU ? 'Julkaistut' : 'Arkistoidut'}</button>
        </StyledGrid>
        <StyledGrid container item xs={2} direction="column">
          <label htmlFor="hakutapa-select">Hakutapa</label>
          <select data-testid="haku-hakutapa-select" name="hakutapa-select" onChange={changeHakutapa}>
            <option value={undefined}>Valitse...</option>
            {hakutavat.map((tapa, index) => {
              return <option value={index} key={tapa.koodiUri}>{tapa.nimi.fi}</option> //TODO: translate
            })}
          </select>
        </StyledGrid>
        <StyledGrid container xs={2} direction="column">
          <label htmlFor="alkamiskausi-select">Koulutuksen alkamiskausi</label>
          <select data-testid="haku-kausi-select" name="alkamiskausi-select" onChange={changeAlkamisKausi}>
            <option value={undefined}>Valitse...</option>
            {alkamisKaudet.map((kausi, index) => {
              return <option value={index} key={kausi.alkamisVuosi + kausi.alkamisKausiKoodiUri}>{kausi.alkamisVuosi} {kausi.alkamisKausiNimi}</option> //TODO: translate
            })}
          </select>
        </StyledGrid>
      </StyledGridContainer>
      {results && <HakuList haut={results} hakutavat={hakutavat}></HakuList>}
    </div>
  );
}
