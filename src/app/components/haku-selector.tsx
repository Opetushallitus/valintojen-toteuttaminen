'use client'
import { useState } from "react";

import { SearchDropdown } from "./search-dropdown";
import { Haku, Tila } from "../lib/kouta";
import { Koodi } from "../lib/koodisto";

//TODO: move HaunAlkaminen getHakuAlkamisKaudet to some util for example
const STARTING_YEAR = 2019; // check earliest kouta haku

type HaunAlkaminen = {
  alkamisVuosi: number,
  alkamisKausiKoodiUri: string,
  alkamisKausiNimi: string,
}

const getHakuAlkamisKaudet = (): HaunAlkaminen[] => {
  const nowYear = new Date().getFullYear();
  const alkamiset: HaunAlkaminen[] = [];
  for (let i = nowYear; i >= STARTING_YEAR; i--) {
    alkamiset.push({alkamisVuosi: i, alkamisKausiKoodiUri: 'kausi_s', alkamisKausiNimi: 'SYKSY'})
    alkamiset.push({alkamisVuosi: i, alkamisKausiKoodiUri: 'kausi_k', alkamisKausiNimi: 'KEVÄT'})
  }
  return alkamiset;
}

const alkamisKausiMatchesSelected = (haku: Haku, selectedAlkamisKausi: HaunAlkaminen): boolean =>
  haku.alkamisVuosi === selectedAlkamisKausi.alkamisVuosi && haku.alkamisKausiKoodiUri.startsWith(selectedAlkamisKausi.alkamisKausiKoodiUri);

export const HakuSelector = ({haut, hakutavat}: {haut : Haku[], hakutavat: Koodi[]}) =>{

  const [results, setResults] = useState<Haku[]>();
  const [searchTila, setSearchTila] = useState<Tila>(Tila.JULKAISTU);
  const [selectedHaku, setSelectedHaku] = useState<Haku>();
  const [selectedAlkamisKausi, setSelectedAlkamisKausi] = useState<HaunAlkaminen | undefined>();
  const [selectedHakutapa, setSelectedHakutapa] = useState<Koodi | undefined>();

  const alkamisKaudet = getHakuAlkamisKaudet();

  type changeHandler = React.ChangeEventHandler<HTMLInputElement>;

  const handleChange: changeHandler = (e) => {
    const { target } = e;
    if (!target.value.trim()) return setResults([]);

    const filteredValue = haut.filter((haku: Haku) =>
      haku.tila == searchTila && haku.nimi.fi?.toLowerCase().includes(target.value.toLowerCase())
       && (!selectedAlkamisKausi || alkamisKausiMatchesSelected(haku, selectedAlkamisKausi))
       && (!selectedHakutapa || haku.hakutapaKoodiUri.startsWith(selectedHakutapa.koodiUri))
    );
    setResults(filteredValue);
  };

  const toggleSearchActive = () => {
    setSearchTila(searchTila == Tila.ARKISTOITU ? Tila.JULKAISTU : Tila.ARKISTOITU);
  }

  return (
    <div>
      <button data-testid="haku-tila-toggle" onClick={toggleSearchActive}>{searchTila === Tila.JULKAISTU ? 'Aktiiviset' : 'Passiiviset'}</button>
      <SearchDropdown
        results={results}
        value={selectedHaku?.nimi.fi}
        renderItem={(h: Haku) => <p>{h.nimi.fi}</p>}
        onChange={handleChange}
        onSelect={(h: Haku) => setSelectedHaku(h)}
      />
      <div>
        <label htmlFor="hakutapa-select">Hakutapa</label>
        <select name="hakutapa-select" onChange={(e) => setSelectedHakutapa(e.target.value? hakutavat[parseInt(e.target.value)]: undefined)}>
          <option value={undefined}>Valitse...</option>
          {hakutavat.map((tapa, index) => {
            return <option value={index} key={tapa.koodiUri}>{tapa.nimi.fi}</option> //TODO: translate
          })}
        </select>
      </div>
      <div>
        <label htmlFor="alkamiskausi-select">Koulutuksen alkamiskausi</label>
        <select name="alkamiskausi-select" onChange={(e) => setSelectedAlkamisKausi(e.target.value? alkamisKaudet[parseInt(e.target.value)]: undefined)}>
          <option value={undefined}>Valitse...</option>
          {alkamisKaudet.map((kausi, index) => {
            return <option value={index} key={kausi.alkamisVuosi + kausi.alkamisKausiKoodiUri}>{kausi.alkamisVuosi} {kausi.alkamisKausiNimi}</option> //TODO: translate
          })}
        </select>
      </div>
    </div>
  );
}
