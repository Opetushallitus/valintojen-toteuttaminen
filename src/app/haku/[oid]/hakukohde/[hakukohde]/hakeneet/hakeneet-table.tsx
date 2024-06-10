'use client';
import ListTable, {
  makeGenericColumn,
} from '@/app/components/table/list-table';
import { Hakemus } from '@/app/lib/ataru';

export const HakeneetTable = ({
  hakeneet,
  setSort,
  sort,
}: {
  hakeneet: Hakemus[];
  sort: string;
  setSort: (sort: string) => void;
}) => {
  const columns = [
    makeGenericColumn<Hakemus>({
      title: 'hakeneet.taulukko.hakija',
      key: 'hakija',
      valueProp: 'hakijanNimi',
    }),
    makeGenericColumn<Hakemus>({
      title: 'hakeneet.taulukko.hakukelpoisuus',
      key: 'hakukelpoisuus',
      valueProp: 'hakukelpoisuus',
    }),
    makeGenericColumn<Hakemus>({
      title: 'hakeneet.taulukko.hakutoiveennro',
      key: 'hakutoiveennro',
      valueProp: 'hakutoiveNumero',
    }),
    makeGenericColumn<Hakemus>({
      title: 'hakeneet.taulukko.maksuvelvollisuus',
      key: 'maksuvelvollisuus',
      valueProp: 'maksuvelvollisuus',
    }),
    makeGenericColumn<Hakemus>({
      title: 'hakeneet.taulukko.oid',
      key: 'hakemusoid',
      valueProp: 'oid',
    }),
    makeGenericColumn<Hakemus>({
      title: 'hakeneet.taulukko.henkilooid',
      key: 'henkiloOid',
      valueProp: 'henkiloOid',
    }),
  ];

  return (
    <ListTable
      columns={columns}
      rows={hakeneet}
      sort={sort}
      setSort={setSort}
    />
  );
};
