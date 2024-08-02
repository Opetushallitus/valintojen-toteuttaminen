'use client';
import ListTable, {
  makeExternalLinkColumn,
} from '@/app/components/table/list-table';
import { HakemuksenPistetiedot } from '@/app/lib/types/laskenta-types';

const LINK_TO_PERSON = 'henkilo-ui/oppija/';

const buildLinkToPerson = (personOid: string) => LINK_TO_PERSON + personOid;

export const PisteSyottoTable = ({
  pistetiedot,
  setSort,
  sort,
}: {
  pistetiedot: HakemuksenPistetiedot[];
  sort: string;
  setSort: (sort: string) => void;
}) => {
  const hakijaColumn = makeExternalLinkColumn<HakemuksenPistetiedot>({
    linkBuilder: buildLinkToPerson,
    title: 'hakeneet.taulukko.hakija',
    key: 'hakijanNimi',
    nameProp: 'hakijanNimi',
    linkProp: 'hakijaOid',
  });

  const columns = [hakijaColumn];

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
