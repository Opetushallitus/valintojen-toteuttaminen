'use client';

import { ListTable } from '@/components/table/list-table';
import {
  buildLinkToPerson,
  createHakijaColumn,
  HakijaColumnLinkType,
  makeColumnWithValueToTranslate,
  makeExternalLinkColumn,
  makeGenericColumn,
} from '@/components/table/table-columns';
import { useTranslations } from '@/lib/localization/useTranslations';
import { buildLinkToApplication } from '@/lib/ataru/ataru-service';
import { Hakemus } from '@/lib/ataru/ataru-types';

export const HakeneetTable = ({
  hakeneet,
  setSort,
  sort,
  isKorkeakouluHaku,
}: {
  hakeneet: Array<Hakemus>;
  sort: string;
  setSort: (sort: string) => void;
  isKorkeakouluHaku: boolean;
}) => {
  const { t } = useTranslations();

  const hakijaColumn = createHakijaColumn({
    hakijaLinkType: HakijaColumnLinkType.HAKIJA,
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
