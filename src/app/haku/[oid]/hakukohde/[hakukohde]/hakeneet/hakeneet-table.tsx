'use client';
import ListTable, {
  makeGenericColumn,
  makeExternalLinkColumn,
  makeColumnWithValueToTranslate,
} from '@/app/components/table/list-table';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Hakemus } from '@/app/lib/ataru';

const LINK_TO_APPLICATION = 'lomake-editori/applications/search?term=';
const LINK_TO_PERSON = 'henkilo-ui/oppija/';

const buildLinkToApplication = (hakemusOid: string) =>
  LINK_TO_APPLICATION + hakemusOid;
const buildLinkToPerson = (personOid: string) => LINK_TO_PERSON + personOid;

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
    makeExternalLinkColumn<Hakemus>({
      linkBuilder: buildLinkToPerson,
      title: 'hakeneet.taulukko.hakija',
      key: 'hakija',
      nameProp: 'hakijanNimi',
      linkProp: 'henkiloOid',
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
    makeExternalLinkColumn<Hakemus>({
      linkBuilder: buildLinkToApplication,
      title: 'hakeneet.taulukko.oid',
      key: 'hakemusoid',
      linkProp: 'oid',
    }),
    makeExternalLinkColumn<Hakemus>({
      linkBuilder: buildLinkToPerson,
      title: 'hakeneet.taulukko.henkilooid',
      key: 'henkiloOid',
      linkProp: 'henkiloOid',
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
