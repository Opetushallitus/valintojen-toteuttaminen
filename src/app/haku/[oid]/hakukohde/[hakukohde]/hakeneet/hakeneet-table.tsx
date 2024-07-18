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
  isKorkeakouluHaku,
}: {
  hakeneet: Hakemus[];
  sort: string;
  setSort: (sort: string) => void;
  isKorkeakouluHaku: boolean;
}) => {
  const { t } = useTranslations();

  const hakijaColumn = makeExternalLinkColumn<Hakemus>({
    linkBuilder: buildLinkToPerson,
    title: 'hakeneet.taulukko.hakija',
    key: 'hakijanNimi',
    nameProp: 'hakijanNimi',
    linkProp: 'henkiloOid',
  });

  const hakukelpoisuusColumn = makeColumnWithValueToTranslate<Hakemus>({
    t,
    title: 'hakeneet.taulukko.hakukelpoisuus',
    key: 'hakukelpoisuus',
    valueProp: 'hakukelpoisuus',
  });

  const hakutoivenroColumn = makeGenericColumn<Hakemus>({
    title: 'hakeneet.taulukko.hakutoiveennro',
    key: 'hakutoiveNumero',
    valueProp: 'hakutoiveNumero',
  });

  const maksuvelvollisuusColumn = makeColumnWithValueToTranslate<Hakemus>({
    t,
    title: 'hakeneet.taulukko.maksuvelvollisuus',
    key: 'maksuvelvollisuus',
    valueProp: 'maksuvelvollisuus',
  });

  const hakemusOidColumn = makeExternalLinkColumn<Hakemus>({
    linkBuilder: buildLinkToApplication,
    title: 'hakeneet.taulukko.oid',
    key: 'oid',
    linkProp: 'oid',
  });

  const henkiloOidColumn = makeExternalLinkColumn<Hakemus>({
    linkBuilder: buildLinkToPerson,
    title: 'hakeneet.taulukko.henkilooid',
    key: 'henkiloOid',
    linkProp: 'henkiloOid',
  });

  const columns = isKorkeakouluHaku
    ? [
        hakijaColumn,
        hakukelpoisuusColumn,
        hakutoivenroColumn,
        maksuvelvollisuusColumn,
        hakemusOidColumn,
        henkiloOidColumn,
      ]
    : [hakijaColumn, hakutoivenroColumn, hakemusOidColumn, henkiloOidColumn];

  return (
    <ListTable
      rowKeyProp="oid"
      columns={columns}
      rows={hakeneet}
      sort={sort}
      setSort={setSort}
    />
  );
};
