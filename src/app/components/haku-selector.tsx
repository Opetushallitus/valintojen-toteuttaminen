'use client'
import { useState } from "react";

import { SearchDropdown } from "./search-dropdown";
import { Haku, Tila } from "../lib/kouta";

export const HakuSelector = ({haut}: {haut : Haku[]}) =>{

  const [results, setResults] = useState<Haku[]>();
  const [searchTila, setSearchTila] = useState<Tila>(Tila.JULKAISTU);
  const [selectedHaku, setSelectedHaku] = useState<Haku>();

  type changeHandler = React.ChangeEventHandler<HTMLInputElement>;
  const handleChange: changeHandler = (e) => {
    const { target } = e;
    if (!target.value.trim()) return setResults([]);

    const filteredValue = haut.filter((haku: Haku) =>
      haku.tila == searchTila && haku.nimi.fi?.toLowerCase().includes(target.value.toLowerCase())
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
    </div>
  );
}
