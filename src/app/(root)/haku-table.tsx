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
  const getMatchingHakutapa = (hakutapaKoodiUri: string) =>
    hakutavat.find((tapa: Koodi) => hakutapaKoodiUri.startsWith(tapa.koodiUri))
      ?.nimi.fi;

  const userLanguage = useUserLanguage();

  const columns = [
    makeHakuColumn(userLanguage),
    makeTilaColumn(),
    makeHakutapaColumn(getMatchingHakutapa),
    makeKoulutuksenAlkamiskausiColumn(),
    makeCountColumn({
      title: 'Hakukohteet',
      key: 'hakukohteita',
      amountProp: 'hakukohteita',
    }),
  ];

  return (
    <ListTable columns={columns} rows={haut} sort={sort} setSort={setSort} />
  );
};
