'use client';
import {
  buildLinkToPerson,
  hakijaColumn,
} from '@/app/components/table/hakija-column';
import ListTable, {
  makeGenericColumn,
  makeExternalLinkColumn,
  makeColumnWithValueToTranslate,
} from '@/app/components/table/list-table';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Hakemus } from '@/app/lib/types/ataru-types';

const LINK_TO_APPLICATION = 'lomake-editori/applications/search?term=';

const buildLinkToApplication = (hakemusOid: string) =>
  LINK_TO_APPLICATION + hakemusOid;
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
    key: 'hakemusOid',
    linkProp: 'hakemusOid',
  });

  const hakijaOidColumn = makeExternalLinkColumn<Hakemus>({
    linkBuilder: buildLinkToPerson,
    title: 'hakeneet.taulukko.henkilooid',
    key: 'hakijaOid',
    linkProp: 'hakijaOid',
  });

  const columns = isKorkeakouluHaku
    ? [
        hakijaColumn,
        hakukelpoisuusColumn,
        hakutoivenroColumn,
        maksuvelvollisuusColumn,
        hakemusOidColumn,
        hakijaOidColumn,
      ]
    : [hakijaColumn, hakutoivenroColumn, hakemusOidColumn, hakijaOidColumn];

  return (
    <ListTable
      rowKeyProp="hakemusOid"
      columns={columns}
      rows={hakeneet}
      sort={sort}
      setSort={setSort}
    />
  );
};
