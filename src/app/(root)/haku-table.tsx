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
import { TranslatedName } from '../lib/localization/localization-types';
import { useTranslations } from '../hooks/useTranslations';

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
    (translateEntity: (entity: TranslatedName) => string) =>
    (hakutapaKoodiUri: string) => {
      const matching = hakutavat.find((tapa: Koodi) =>
        hakutapaKoodiUri.startsWith(tapa.koodiUri),
      );
      return matching ? translateEntity(matching.nimi) : undefined;
    };

  const { t, translateEntity } = useTranslations();

  const columns = [
    makeHakuColumn(translateEntity),
    makeTilaColumn(),
    makeHakutapaColumn(getMatchingHakutapa(translateEntity)),
    makeKoulutuksenAlkamiskausiColumn(t),
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
