'use client';
import ListTable, {
  makeExternalLinkColumn,
  makeCountColumn,
  makeGenericColumn,
} from '@/app/components/table/list-table';
import { JonoSijaWithHakijaInfo } from '@/app/lib/valintalaskenta-service';

const LINK_TO_PERSON = 'henkilo-ui/oppija/';

const buildLinkToPerson = (personOid: string) => LINK_TO_PERSON + personOid;

const jonosijaColumn = makeCountColumn<JonoSijaWithHakijaInfo>({
  title: 'jonosija',
  key: 'hakemus',
  amountProp: 'jonosija',
});

const hakijaColumn = makeExternalLinkColumn<JonoSijaWithHakijaInfo>({
  linkBuilder: buildLinkToPerson,
  title: 'hakeneet.taulukko.hakija',
  key: 'hakemus.hakija',
  nameProp: 'hakijanNimi',
  linkProp: 'henkiloOid',
});

const pisteetColumn = makeGenericColumn<JonoSijaWithHakijaInfo>({
  title: 'pisteet',
  key: 'pisteet',
  valueProp: 'pisteet',
});

const hakutoiveColumn = makeGenericColumn<JonoSijaWithHakijaInfo>({
  title: 'hakutoive',
  key: 'hakutoive',
  valueProp: 'hakutoive',
});

const columns = [jonosijaColumn, hakijaColumn, pisteetColumn, hakutoiveColumn];

export const ValintalaskennanTulosTable = ({
  jonosijat,
  setSort,
  sort,
}: {
  jonosijat: Array<JonoSijaWithHakijaInfo>;
  sort: string;
  setSort: (sort: string) => void;
}) => {
  return (
    <ListTable
      rowKeyProp="hakijaOid"
      columns={columns}
      rows={jonosijat}
      sort={sort}
      setSort={setSort}
    />
  );
};
