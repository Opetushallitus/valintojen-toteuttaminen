'use client';

import { ListTable } from '@/app/components/table/list-table';
import {
  buildLinkToPerson,
  createHakijaColumn,
  makeColumnWithValueToTranslate,
  makeExternalLinkColumn,
  makeGenericColumn,
} from '@/app/components/table/table-columns';
import { useTranslations } from '@/app/hooks/useTranslations';
import { buildLinkToApplication } from '@/app/lib/ataru/ataru-service';
import { Hakemus } from '@/app/lib/ataru/ataru-types';

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

  const hakijaColumn = createHakijaColumn('hakeneet');

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
    style: { textAlign: 'center' },
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
