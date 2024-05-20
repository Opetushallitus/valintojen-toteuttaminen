'use client';
import { Koodi } from '../lib/koodisto';
import ListTable, {
  makeCountColumn,
  makeHakuColumn,
  makeHakutapaColumn,
  makeKoulutuksenAlkamiskausiColumn,
  makeTilaColumn,
} from '../components/table/list-table';
import { Haku } from '../lib/kouta-types';
import { useUserLanguage } from '../hooks/useAsiointiKieli';
import { Language } from '../lib/localization/localization-types';
import { translateName } from '../lib/localization/translation-utils';

export const HakuTable = ({
  haut,
  hakutavat,
  setSort,
  sort,
}: {
  haut: Haku[];
  hakutavat: Koodi[];
  sort: string;
  setSort: (sort: string) => void;
}) => {
  const getMatchingHakutapa =
    (userLanguage: Language) => (hakutapaKoodiUri: string) => {
      const matching = hakutavat.find((tapa: Koodi) =>
        hakutapaKoodiUri.startsWith(tapa.koodiUri),
      );
      return matching ? translateName(matching.nimi, userLanguage) : undefined;
    };

  const userLanguage = useUserLanguage();

  const columns = [
    makeHakuColumn(userLanguage),
    makeTilaColumn(),
    makeHakutapaColumn(getMatchingHakutapa(userLanguage)),
    makeKoulutuksenAlkamiskausiColumn(),
    makeCountColumn({
      title: 'haku.hakukohteet',
      key: 'hakukohteita',
      amountProp: 'hakukohteita',
    }),
  ];

  return (
    <ListTable columns={columns} rows={haut} sort={sort} setSort={setSort} />
  );
};
