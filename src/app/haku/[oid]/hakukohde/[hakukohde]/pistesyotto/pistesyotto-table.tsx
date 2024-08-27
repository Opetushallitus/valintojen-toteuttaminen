'use client';
import ListTable, {
  makeExternalLinkColumn,
  makeGenericColumn,
} from '@/app/components/table/list-table';
import { HakemuksenPistetiedot } from '@/app/lib/types/laskenta-types';
import { Valintakoe } from '@/app/lib/types/valintaperusteet-types';

const LINK_TO_PERSON = 'henkilo-ui/oppija/';

const buildLinkToPerson = (personOid: string) => LINK_TO_PERSON + personOid;

export const PisteSyottoTable = ({
  pistetiedot,
  setSort,
  sort,
  kokeet,
}: {
  pistetiedot: HakemuksenPistetiedot[];
  sort: string;
  setSort: (sort: string) => void;
  kokeet: Valintakoe[];
}) => {
  const hakijaColumn = makeExternalLinkColumn<HakemuksenPistetiedot>({
    linkBuilder: buildLinkToPerson,
    title: 'hakeneet.taulukko.hakija',
    key: 'hakijanNimi',
    nameProp: 'hakijanNimi',
    linkProp: 'hakijaOid',
  });

  const koeColumns = kokeet.map((koe) => {
    return makeGenericColumn<HakemuksenPistetiedot>({
      title: koe.kuvaus,
      key: koe.tunniste,
      valueProp: 'hakijanNimi',
    });
  });

  const columns = [hakijaColumn, ...koeColumns];

  return (
    <ListTable
      rowKeyProp="hakemusOid"
      columns={columns}
      rows={pistetiedot}
      sort={sort}
      setSort={setSort}
    />
  );
};
