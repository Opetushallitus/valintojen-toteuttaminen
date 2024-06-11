'use client';
import ListTable, {
  makeGenericColumn,
  makeColumnWithValueToTranslate,
} from '@/app/components/table/list-table';
import { useTranslations } from '@/app/hooks/useTranslations';
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
  const { t } = useTranslations();

  const columns = [
    makeGenericColumn<Hakemus>({
      title: 'hakeneet.taulukko.hakija',
      key: 'hakija',
      valueProp: 'hakijanNimi',
    }),
    makeColumnWithValueToTranslate<Hakemus>({
      t,
      title: 'hakeneet.taulukko.hakukelpoisuus',
      key: 'hakukelpoisuus',
      valueProp: 'hakukelpoisuus',
    }),
    makeGenericColumn<Hakemus>({
      title: 'hakeneet.taulukko.hakutoiveennro',
      key: 'hakutoiveennro',
      valueProp: 'hakutoiveNumero',
    }),
    makeColumnWithValueToTranslate<Hakemus>({
      t,
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
